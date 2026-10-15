import {
  Vehicle,
  Trip,
  LocationPoint,
  PublicTruckStatus,
  FuelLog,
} from '../types/models';
import {
  IVehicleRepository,
  ITripRepository,
  IPublicFleetService,
} from '../types/contracts';
import { MOCK_VEHICLES, INITIAL_MOCK_TRUCKS } from './mock-data';

class FleetStore implements IVehicleRepository, ITripRepository, IPublicFleetService {
  private vehicles: Vehicle[] = [...MOCK_VEHICLES];
  private trips: Trip[] = [];
  private locationPoints: Map<string, LocationPoint[]> = new Map();
  private publicFleet: PublicTruckStatus[] = [...INITIAL_MOCK_TRUCKS];
  private listeners: Set<(trucks: PublicTruckStatus[]) => void> = new Set();

  constructor() {
    // Inicializar un viaje de prueba en progreso para REC-01
    const initialTrip: Trip = {
      id: 'trip-pilot-01',
      driverId: 'usr-driver-01',
      vehicleId: 'veh-01',
      status: 'active',
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      totalDistanceKm: 4.8,
      totalDurationMinutes: 45,
      idleDurationMinutes: 18,
      pointsCount: 142,
      fuelConsumptionLiters: 3.22, // (4.8 * 0.42) + (18/60 * 4.0) = 2.016 + 1.2 = 3.216 L
      fuelConsumptionType: 'estimated',
      fuelCalculationParams: {
        nominalFuelRateKm: 0.42,
        idleFuelRateHour: 4.0,
        speedThresholdIdleKmh: 3.0,
        totalDistanceKm: 4.8,
        idleHours: 0.3,
        movingHours: 0.45,
        formulaDescription: 'Consumo = (Distancia * 0.42 L/km) + (Horas_Ralentí * 4.0 L/h)',
      },
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    };
    this.trips.push(initialTrip);
  }

  // --- IVehicleRepository ---
  async getAllVehicles(): Promise<Vehicle[]> {
    return [...this.vehicles];
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.vehicles.find((v) => v.id === id) || null;
  }

  async updateVehicleStatus(id: string, status: Vehicle['status']): Promise<Vehicle> {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle) throw new Error(`Vehículo ${id} no encontrado`);
    vehicle.status = status;
    this.notifyFleetChange();
    return { ...vehicle };
  }

  async updateVehicleFuelRates(
    id: string,
    nominalFuelRateKm: number,
    idleFuelRateHour: number
  ): Promise<Vehicle> {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle) throw new Error(`Vehículo ${id} no encontrado`);
    vehicle.nominalFuelRateKm = nominalFuelRateKm;
    vehicle.idleFuelRateHour = idleFuelRateHour;
    return { ...vehicle };
  }

  // --- ITripRepository ---
  async getActiveTripByDriver(driverId: string): Promise<Trip | null> {
    return this.trips.find((t) => t.driverId === driverId && t.status === 'active') || null;
  }

  async getTripById(id: string): Promise<Trip | null> {
    return this.trips.find((t) => t.id === id) || null;
  }

  async getAllTrips(): Promise<Trip[]> {
    return [...this.trips];
  }

  async startTrip(driverId: string, vehicleId: string): Promise<Trip> {
    // Si ya hay un viaje activo para este chofer, lo retorna
    const existing = await this.getActiveTripByDriver(driverId);
    if (existing) return existing;

    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) throw new Error('Vehículo no válido');

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      driverId,
      vehicleId,
      status: 'active',
      startedAt: new Date().toISOString(),
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      idleDurationMinutes: 0,
      pointsCount: 0,
      fuelConsumptionLiters: 0,
      fuelConsumptionType: 'estimated',
      createdAt: new Date().toISOString(),
    };

    this.trips.unshift(newTrip);
    vehicle.status = 'in_service';

    // Actualiza o crea estado público del camión
    const publicIndex = this.publicFleet.findIndex((p) => p.vehicleId === vehicleId);
    const updatedStatus: PublicTruckStatus = {
      vehicleId: vehicle.id,
      internalCode: vehicle.internalCode,
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      latitude: -17.9647,
      longitude: -67.1102,
      speedKmh: 0,
      lastUpdate: new Date().toISOString(),
      isOnline: true,
      tripId: newTrip.id,
    };

    if (publicIndex >= 0) {
      this.publicFleet[publicIndex] = updatedStatus;
    } else {
      this.publicFleet.push(updatedStatus);
    }

    this.notifyFleetChange();
    return { ...newTrip };
  }

  async finishTrip(tripId: string, measuredFuelLog?: Partial<FuelLog>): Promise<Trip> {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Viaje no encontrado');

    trip.status = 'completed';
    trip.endedAt = new Date().toISOString();

    const vehicle = await this.getVehicleById(trip.vehicleId);
    if (vehicle) {
      vehicle.status = 'available';
    }

    if (measuredFuelLog && measuredFuelLog.litersLoaded) {
      trip.fuelConsumptionLiters = measuredFuelLog.litersLoaded;
      trip.fuelConsumptionType = 'measured';
    }

    // Remueve de flota activa pública
    this.publicFleet = this.publicFleet.filter((p) => p.tripId !== tripId);
    this.notifyFleetChange();

    return { ...trip };
  }

  async recordLocationPoints(points: LocationPoint[]): Promise<void> {
    if (points.length === 0) return;
    const tripId = points[0].tripId;
    const existing = this.locationPoints.get(tripId) || [];
    this.locationPoints.set(tripId, [...existing, ...points]);

    const latest = points[points.length - 1];
    const trip = this.trips.find((t) => t.id === tripId);
    if (trip) {
      trip.pointsCount += points.length;

      // Actualizar estado público
      const truck = this.publicFleet.find((p) => p.tripId === tripId);
      if (truck) {
        truck.latitude = latest.latitude;
        truck.longitude = latest.longitude;
        truck.speedKmh = latest.speedKmh || 0;
        truck.lastUpdate = latest.recordedAt;
        truck.isOnline = true;
        this.notifyFleetChange();
      }
    }
  }

  async getTripPoints(tripId: string): Promise<LocationPoint[]> {
    return this.locationPoints.get(tripId) || [];
  }

  // --- IPublicFleetService ---
  async getActiveTrucks(): Promise<PublicTruckStatus[]> {
    // Recalcula isOnline basado en 5 minutos de inactividad
    const now = Date.now();
    return this.publicFleet.map((t) => {
      const diffMinutes = (now - new Date(t.lastUpdate).getTime()) / (1000 * 60);
      return {
        ...t,
        isOnline: diffMinutes <= 5,
      };
    });
  }

  subscribeToFleetUpdates(callback: (trucks: PublicTruckStatus[]) => void): () => void {
    this.listeners.add(callback);
    // Ejecuta inmediatamente
    this.getActiveTrucks().then(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyFleetChange() {
    this.getActiveTrucks().then((trucks) => {
      this.listeners.forEach((listener) => listener(trucks));
    });
  }
}

export const fleetStore = new FleetStore();

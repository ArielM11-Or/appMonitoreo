import {
  UserProfile,
  Vehicle,
  VehicleAssignment,
  Trip,
  LocationPoint,
  PublicTruckStatus,
  FuelLog,
  UserRole,
} from './models';

export interface IAuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  login(email: string, role: UserRole): Promise<UserProfile>;
  logout(): Promise<void>;
  switchRole(role: UserRole): Promise<UserProfile>;
}

export interface IVehicleRepository {
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | null>;
  updateVehicleStatus(id: string, status: Vehicle['status']): Promise<Vehicle>;
  updateVehicleFuelRates(
    id: string,
    nominalFuelRateKm: number,
    idleFuelRateHour: number
  ): Promise<Vehicle>;
}

export interface ITripRepository {
  getActiveTripByDriver(driverId: string): Promise<Trip | null>;
  getTripById(id: string): Promise<Trip | null>;
  getAllTrips(): Promise<Trip[]>;
  startTrip(driverId: string, vehicleId: string): Promise<Trip>;
  finishTrip(tripId: string, measuredFuelLog?: Partial<FuelLog>): Promise<Trip>;
  recordLocationPoints(points: LocationPoint[]): Promise<void>;
  getTripPoints(tripId: string): Promise<LocationPoint[]>;
}

export interface IPublicFleetService {
  getActiveTrucks(): Promise<PublicTruckStatus[]>;
  subscribeToFleetUpdates(callback: (trucks: PublicTruckStatus[]) => void): () => void;
}

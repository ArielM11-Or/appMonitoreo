export type UserRole = 'driver' | 'admin' | 'public';

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export type VehicleStatus = 'available' | 'in_service' | 'maintenance' | 'out_of_service';

export interface Vehicle {
  id: string;
  internalCode: string;          // Ej: "REC-01"
  plateNumber: string;           // Ej: "4521-XYZ"
  model: string;                 // Ej: "Volvo FE 280 Compactador"
  nominalFuelRateKm: number;     // Litros por km en marcha (ej: 0.42)
  idleFuelRateHour: number;      // Litros por hora en ralentí + compresión (ej: 4.0)
  tankCapacityLiters: number;    // Capacidad del tanque (ej: 250)
  status: VehicleStatus;
  createdAt: string;
}

export interface VehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt: string;
  unassignedAt?: string | null;
  isActive: boolean;
}

export type TripStatus = 'active' | 'completed' | 'cancelled';
export type FuelMethod = 'estimated' | 'measured' | 'unavailable';

export interface FuelCalculationParams {
  nominalFuelRateKm: number;
  idleFuelRateHour: number;
  speedThresholdIdleKmh: number;
  totalDistanceKm: number;
  idleHours: number;
  movingHours: number;
  formulaDescription: string;
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  status: TripStatus;
  startedAt: string;
  endedAt?: string | null;

  // Métricas agregadas
  totalDistanceKm: number;
  totalDurationMinutes: number;
  idleDurationMinutes: number;
  pointsCount: number;

  // Combustible
  fuelConsumptionLiters: number | null;
  fuelConsumptionType: FuelMethod;
  fuelCalculationParams?: FuelCalculationParams;

  createdAt: string;
}

export interface LocationPoint {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speedKmh?: number | null;
  accuracyMeters: number;
  recordedAt: string;     // Hora del reloj del dispositivo (ISO)
  receivedAt: string;     // Hora de procesamiento/recepción (ISO)
  isSynced: boolean;      // Bandera de sincronización fuera de línea
}

export interface PublicTruckStatus {
  vehicleId: string;
  internalCode: string;
  plateNumber: string;
  model: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  lastUpdate: string;     // ISO timestamp
  isOnline: boolean;      // Determinado por frescura (< 5 min)
  tripId?: string;
}

export interface FuelLog {
  id: string;
  tripId?: string;
  vehicleId: string;
  driverId: string;
  litersLoaded: number;
  odometerKm: number;
  receiptNumber?: string;
  fuelStation?: string;   // Ej: "YPFB Estación Central Oruro"
  loggedAt: string;
}

import { UserProfile, Vehicle, PublicTruckStatus } from '../types/models';

export const MOCK_USERS: Record<string, UserProfile> = {
  driver1: {
    id: 'usr-driver-01',
    fullName: 'Juan Mamani Choque',
    role: 'driver',
    phone: '+591 71829301',
    email: 'j.mamani@oruro.bo',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z',
  },
  driver2: {
    id: 'usr-driver-02',
    fullName: 'Carlos Condori Quispe',
    role: 'driver',
    phone: '+591 72938402',
    email: 'c.condori@oruro.bo',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z',
  },
  admin: {
    id: 'usr-admin-01',
    fullName: 'Ing. Laura Pérez Arancibia',
    role: 'admin',
    phone: '+591 73849503',
    email: 'l.perez@oruro.bo',
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  public: {
    id: 'usr-public-01',
    fullName: 'Vecino de Oruro (Consulta)',
    role: 'public',
    email: 'ciudadano@oruro.bo',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-01',
    internalCode: 'REC-01',
    plateNumber: '4521-XYZ',
    model: 'Volvo FE 280 Compactador 16m³',
    nominalFuelRateKm: 0.42,       // 0.42 Litros por km (aprox 2.38 km/L en marcha)
    idleFuelRateHour: 4.0,         // 4.0 L/hora en ralentí con toma de fuerza activa
    tankCapacityLiters: 250,
    status: 'in_service',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'veh-02',
    internalCode: 'REC-02',
    plateNumber: '3890-ABC',
    model: 'Mercedes-Benz Atego 1729 15m³',
    nominalFuelRateKm: 0.40,
    idleFuelRateHour: 3.8,
    tankCapacityLiters: 210,
    status: 'available',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'veh-03',
    internalCode: 'REC-03',
    plateNumber: '5122-DEF',
    model: 'Fuso Canter 815 8m³ (Calles Estrechas)',
    nominalFuelRateKm: 0.28,
    idleFuelRateHour: 2.5,
    tankCapacityLiters: 120,
    status: 'available',
    createdAt: '2026-01-10T08:00:00Z',
  },
];

export const ORURO_LANDMARKS = {
  center: { latitude: -17.9647, longitude: -67.1102, title: 'Plaza 10 de Febrero' },
  socavon: { latitude: -17.9675, longitude: -67.1215, title: 'Santuario del Socavón' },
  mercadoFermin: { latitude: -17.9692, longitude: -67.1118, title: 'Mercado Fermín López' },
  mercadoCampero: { latitude: -17.9610, longitude: -67.1145, title: 'Mercado Campero' },
  parqueUnion: { latitude: -17.9575, longitude: -67.1130, title: 'Parque de la Unión' },
};

export const INITIAL_MOCK_TRUCKS: PublicTruckStatus[] = [
  {
    vehicleId: 'veh-01',
    internalCode: 'REC-01',
    plateNumber: '4521-XYZ',
    model: 'Volvo FE 280 (16m³)',
    latitude: -17.9652,
    longitude: -67.1115,
    speedKmh: 12,
    lastUpdate: new Date().toISOString(),
    isOnline: true,
    tripId: 'trip-pilot-01',
  },
  {
    vehicleId: 'veh-02',
    internalCode: 'REC-02',
    plateNumber: '3890-ABC',
    model: 'MB Atego (15m³)',
    latitude: -17.9688,
    longitude: -67.1130,
    speedKmh: 0,
    // Simula 7 minutos sin emitir para probar semáforo de frescura
    lastUpdate: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    isOnline: false,
    tripId: 'trip-pilot-02',
  },
];

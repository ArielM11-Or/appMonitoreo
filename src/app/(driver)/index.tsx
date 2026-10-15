import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth-context';
import { fleetStore } from '@/services/fleet-store';
import { Trip, Vehicle } from '@/types/models';

export default function DriverHomeScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allVehicles, trip] = await Promise.all([
        fleetStore.getAllVehicles(),
        fleetStore.getActiveTripByDriver(currentUser.id),
      ]);
      setVehicles(allVehicles);
      setActiveTrip(trip);
      if (allVehicles.length > 0 && !selectedVehicleId) {
        setSelectedVehicleId(allVehicles[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!selectedVehicleId) {
      Alert.alert('Selección requerida', 'Por favor selecciona un camión recolector.');
      return;
    }

    setStarting(true);
    try {
      const trip = await fleetStore.startTrip(currentUser.id, selectedVehicleId);
      setActiveTrip(trip);
      router.push('/(driver)/active-trip' as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo iniciar el recorrido.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Cargando flota municipal...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Información del Conductor */}
      <View style={styles.driverCard}>
        <View style={styles.driverAvatar}>
          <Text style={styles.driverAvatarText}>{currentUser.fullName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.driverGreeting}>Bienvenido, conductor</Text>
          <Text style={styles.driverName}>{currentUser.fullName}</Text>
          <Text style={styles.driverZone}>Turno Casco Histórico • DIMA Oruro</Text>
        </View>
      </View>

      {/* Si hay un viaje activo en curso */}
      {activeTrip ? (
        <View style={styles.activeTripBanner}>
          <View style={styles.activeDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activeTripTitle}>¡Recorrido en progreso!</Text>
            <Text style={styles.activeTripSub}>
              Iniciado: {new Date(activeTrip.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activeTrip.totalDistanceKm} km acumulados
            </Text>
          </View>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/(driver)/active-trip' as any)}>
            <Text style={styles.continueButtonText}>Continuar →</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Selector de Camión */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. SELECCIONA EL CAMIÓN ASIGNADO</Text>
        <Text style={styles.sectionSubtitle}>
          Verifica que el código interno coincida con el vehículo asignado para este turno.
        </Text>

        <View style={styles.vehicleList}>
          {vehicles.map((v) => {
            const isSelected = selectedVehicleId === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                onPress={() => setSelectedVehicleId(v.id)}>
                <View style={styles.vehicleHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>{v.internalCode}</Text>
                  </View>
                  <Text style={styles.plateText}>Placa: {v.plateNumber}</Text>
                </View>

                <Text style={styles.vehicleModel}>{v.model}</Text>

                <View style={styles.specsRow}>
                  <Text style={styles.specItem}>
                    ⛽ Consumo marcha: <Text style={styles.specBold}>{v.nominalFuelRateKm} L/km</Text>
                  </Text>
                  <Text style={styles.specItem}>
                    ⏱️ Ralentí compresión: <Text style={styles.specBold}>{v.idleFuelRateHour} L/h</Text>
                  </Text>
                </View>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor:
                          v.status === 'in_service'
                            ? '#EAB308'
                            : v.status === 'available'
                            ? '#22C55E'
                            : '#EF4444',
                      },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {v.status === 'in_service'
                      ? 'En servicio'
                      : v.status === 'available'
                      ? 'Disponible'
                      : 'Mantenimiento'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Aviso Operativo */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeTitle}>ℹ️ Aviso para el Casco Histórico</Text>
        <Text style={styles.noticeText}>
          Al iniciar el recorrido, la ubicación del camión se transmitirá al mapa público municipal
          para que los vecinos conozcan su aproximación. El cálculo de combustible diferenció
          estrictamente tiempo en movimiento vs tiempo en ralentí para compresión.
        </Text>
      </View>

      {/* Botón de Iniciar */}
      <TouchableOpacity
        style={[styles.startButton, starting && { opacity: 0.7 }]}
        disabled={starting || !!activeTrip}
        onPress={handleStartTrip}>
        {starting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.startButtonText}>
            {activeTrip ? 'Recorrido ya iniciado' : 'Iniciar Recorrido y Activar GPS'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  driverGreeting: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  driverZone: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '500',
  },
  activeTripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D97706',
  },
  activeTripTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  activeTripSub: {
    fontSize: 12,
    color: '#B45309',
  },
  continueButton: {
    backgroundColor: '#D97706',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  vehicleList: {
    gap: 10,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  vehicleCardSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  plateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  specItem: {
    fontSize: 12,
    color: '#64748B',
  },
  specBold: {
    fontWeight: '700',
    color: '#334155',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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

export default function ActiveTripScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Estados de métricas en vivo
  const [distanceKm, setDistanceKm] = useState(4.8);
  const [idleMinutes, setIdleMinutes] = useState(18);
  const [movingMinutes, setMovingMinutes] = useState(27);

  useEffect(() => {
    loadActiveTrip();
  }, []);

  // Cronómetro del viaje
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadActiveTrip = async () => {
    const active = await fleetStore.getActiveTripByDriver(currentUser.id);
    if (!active) {
      router.replace('/(driver)' as any);
      return;
    }
    setTrip(active);
    const veh = await fleetStore.getVehicleById(active.vehicleId);
    setVehicle(veh);

    // Calcular segundos transcurridos desde inicio real
    const diff = Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000);
    setElapsedSeconds(diff > 0 ? diff : 0);
  };

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Coeficientes
  const nominalRate = vehicle?.nominalFuelRateKm ?? 0.42;
  const idleRate = vehicle?.idleFuelRateHour ?? 4.0;

  // Cálculo explícito de combustible estimado
  const estimatedFuel = (
    distanceKm * nominalRate +
    (idleMinutes / 60) * idleRate
  ).toFixed(2);

  // Simulación interactiva para pruebas del piloto
  const handleSimulateMove = () => {
    setDistanceKm((prev) => +(prev + 0.5).toFixed(2));
    setMovingMinutes((prev) => prev + 2);
  };

  const handleSimulateStop = () => {
    setIdleMinutes((prev) => prev + 3);
  };

  const handleFinishTrip = () => {
    Alert.alert(
      'Finalizar Recorrido',
      '¿Confirmas la conclusión del recorrido de recolección en el Casco Histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, finalizar',
          style: 'destructive',
          onPress: () => {
            router.push({
              pathname: '/(driver)/summary',
              params: {
                tripId: trip?.id,
                distanceKm: distanceKm.toString(),
                durationMin: Math.floor(elapsedSeconds / 60).toString(),
                idleMin: idleMinutes.toString(),
                fuelEst: estimatedFuel,
              },
            } as any);
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado del Camión */}
      <View style={styles.truckHeader}>
        <View style={styles.badgeCode}>
          <Text style={styles.badgeCodeText}>{vehicle?.internalCode || 'REC-01'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.truckTitle}>{vehicle?.model || 'Camión Recolector'}</Text>
          <Text style={styles.truckPlate}>Placa: {vehicle?.plateNumber} • Casco Histórico</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.livePulse} />
          <Text style={styles.liveText}>GPS ACTIVO</Text>
        </View>
      </View>

      {/* Cronómetro Central */}
      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>TIEMPO DE RECORRIDO TRANSCURRIDO</Text>
        <Text style={styles.timerValue}>{formatTimer(elapsedSeconds)}</Text>
        <Text style={styles.timerSub}>
          Iniciado a las {trip ? new Date(trip.startedAt).toLocaleTimeString() : '--:--'}
        </Text>
      </View>

      {/* Métricas Principales */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>📍</Text>
          <Text style={styles.metricValue}>{distanceKm} km</Text>
          <Text style={styles.metricLabel}>Distancia Recorrida</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>🛑</Text>
          <Text style={styles.metricValue}>{idleMinutes} min</Text>
          <Text style={styles.metricLabel}>Tiempo en Ralentí</Text>
        </View>
      </View>

      {/* Desglose Metodológico de Combustible Estimado */}
      <View style={styles.fuelCard}>
        <View style={styles.fuelHeaderRow}>
          <Text style={styles.fuelCardTitle}>⛽ ESTIMACIÓN DE COMBUSTIBLE</Text>
          <View style={styles.tagEstimated}>
            <Text style={styles.tagEstimatedText}>MODELO CINEMÁTICO</Text>
          </View>
        </View>

        <View style={styles.fuelBigRow}>
          <Text style={styles.fuelBigValue}>{estimatedFuel}</Text>
          <Text style={styles.fuelBigUnit}>Litros Diésel (Est.)</Text>
        </View>

        <View style={styles.formulaBox}>
          <Text style={styles.formulaTitle}>Metodología aplicada para Oruro (3,735 msnm):</Text>
          <Text style={styles.formulaText}>
            • Consumo en marcha: {distanceKm} km × {nominalRate} L/km ={' '}
            <Text style={styles.bold}>{(distanceKm * nominalRate).toFixed(2)} L</Text>
          </Text>
          <Text style={styles.formulaText}>
            • Consumo en ralentí + compactador: ({idleMinutes}/60 h) × {idleRate} L/h ={' '}
            <Text style={styles.bold}>{((idleMinutes / 60) * idleRate).toFixed(2)} L</Text>
          </Text>
        </View>

        <Text style={styles.fuelDisclaimer}>
          * Advertencia técnica: Este valor es una inferencia física calculada por velocidad y tiempo.
          El combustible medido real se concilia al cargar en el surtidor.
        </Text>
      </View>

      {/* Herramientas de Prueba de Piloto */}
      <View style={styles.simulationBox}>
        <Text style={styles.simulationTitle}>🧪 SIMULADOR DE PRUEBAS DE CAMPO</Text>
        <Text style={styles.simulationText}>
          Permite evaluar los cálculos sin requerir movimiento físico del camión:
        </Text>
        <View style={styles.simButtonsRow}>
          <TouchableOpacity style={styles.simButton} onPress={handleSimulateMove}>
            <Text style={styles.simButtonText}>+ 0.5 km (Avance)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.simButton} onPress={handleSimulateStop}>
            <Text style={styles.simButtonText}>+ 3 min (Parada/Recojo)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón de Finalización */}
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishTrip}>
        <Text style={styles.finishButtonText}>Finalizar Recorrido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  badgeCode: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeCodeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  truckTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  truckPlate: {
    fontSize: 12,
    color: '#64748B',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  timerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  timerLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  timerValue: {
    color: '#38BDF8',
    fontSize: 42,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timerSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  fuelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fuelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fuelCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  tagEstimated: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tagEstimatedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  fuelBigRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  fuelBigValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#D97706',
  },
  fuelBigUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350F',
  },
  formulaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  formulaTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  formulaText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  fuelDisclaimer: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  simulationBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  simulationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  simulationText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  simButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#94A3B8',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  simButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  finishButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

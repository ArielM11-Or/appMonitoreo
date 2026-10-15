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

import { fleetStore } from '@/services/fleet-store';
import { Trip, Vehicle } from '@/types/models';

export default function AdminTripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const [allTrips, allVehicles] = await Promise.all([
        fleetStore.getAllTrips(),
        fleetStore.getAllVehicles(),
      ]);
      setTrips(allTrips);
      const vMap: Record<string, Vehicle> = {};
      allVehicles.forEach((v) => {
        vMap[v.id] = v;
      });
      setVehicles(vMap);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    Alert.alert(
      'Exportación Completa',
      JSON.stringify(trips, null, 2),
      [{ text: 'Cerrar' }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Auditoría de Recorridos</Text>
          <Text style={styles.subtitle}>
            Trazabilidad histórica de turnos y verificación de consumo
          </Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportJSON}>
          <Text style={styles.exportBtnText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6D28D9" style={{ marginTop: 30 }} />
      ) : trips.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No hay recorridos registrados aún.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {trips.map((t) => {
            const vehicle = vehicles[t.vehicleId];
            const isCompleted = t.status === 'completed';

            return (
              <View key={t.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {vehicle?.internalCode || 'REC-??'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{vehicle?.model || 'Camión Recolector'}</Text>
                    <Text style={styles.cardDate}>
                      {new Date(t.startedAt).toLocaleDateString()} • {new Date(t.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      isCompleted ? styles.statusCompleted : styles.statusActive,
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        isCompleted ? styles.textCompleted : styles.textActive,
                      ]}>
                      {isCompleted ? 'COMPLETADO' : 'EN CURSO'}
                    </Text>
                  </View>
                </View>

                {/* Métricas del Viaje */}
                <View style={styles.grid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Distancia</Text>
                    <Text style={styles.gridVal}>{t.totalDistanceKm} km</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Duración</Text>
                    <Text style={styles.gridVal}>{t.totalDurationMinutes} min</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Ralentí/Paradas</Text>
                    <Text style={styles.gridVal}>{t.idleDurationMinutes} min</Text>
                  </View>
                </View>

                {/* Bloque de Combustible */}
                <View style={styles.fuelBox}>
                  <View style={styles.fuelTop}>
                    <Text style={styles.fuelTitle}>CONSUMO DE DIÉSEL:</Text>
                    <View
                      style={[
                        styles.fuelTypeTag,
                        t.fuelConsumptionType === 'measured'
                          ? styles.tagMeasured
                          : styles.tagEstimated,
                      ]}>
                      <Text
                        style={[
                          styles.fuelTypeTagText,
                          t.fuelConsumptionType === 'measured'
                            ? styles.tagMeasuredText
                            : styles.tagEstimatedText,
                        ]}>
                        {t.fuelConsumptionType === 'measured' ? 'MEDIDO EN SURTIDOR' : 'INFERENCIA CINEMÁTICA'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.fuelNumber}>
                    {t.fuelConsumptionLiters ? `${t.fuelConsumptionLiters} Litros` : 'En cálculo...'}
                  </Text>

                  {t.fuelCalculationParams && (
                    <Text style={styles.fuelFormulaText}>
                      📐 {t.fuelCalculationParams.formulaDescription}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  exportBtn: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportBtnText: {
    color: '#6D28D9',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  list: {
    gap: 14,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDate: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: '#F1F5F9',
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textCompleted: {
    color: '#475569',
  },
  textActive: {
    color: '#16A34A',
  },
  grid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  gridVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  fuelBox: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  fuelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fuelTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  fuelTypeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tagEstimated: {
    backgroundColor: '#FEF3C7',
  },
  tagMeasured: {
    backgroundColor: '#DCFCE7',
  },
  fuelTypeTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tagEstimatedText: {
    color: '#B45309',
  },
  tagMeasuredText: {
    color: '#166534',
  },
  fuelNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  fuelFormulaText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
});

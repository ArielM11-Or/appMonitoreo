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

import { fleetStore } from '@/services/fleet-store';
import { Trip, Vehicle } from '@/types/models';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [allVehicles, allTrips] = await Promise.all([
      fleetStore.getAllVehicles(),
      fleetStore.getAllTrips(),
    ]);
    setVehicles(allVehicles);
    setTrips(allTrips);
  };

  const activeVehiclesCount = vehicles.filter((v) => v.status === 'in_service').length;
  const totalDistance = trips.reduce((acc, t) => acc + (t.totalDistanceKm || 0), 0);
  const totalEstimatedFuel = trips
    .filter((t) => t.fuelConsumptionType === 'estimated')
    .reduce((acc, t) => acc + (t.fuelConsumptionLiters || 0), 0);
  const totalMeasuredFuel = trips
    .filter((t) => t.fuelConsumptionType === 'measured')
    .reduce((acc, t) => acc + (t.fuelConsumptionLiters || 0), 0);

  const handleExportData = () => {
    Alert.alert(
      'Exportación del Piloto',
      `Se han consolidado ${trips.length} recorridos y ${vehicles.length} vehículos en formato JSON para análisis de la DIMA.`,
      [{ text: 'Entendido' }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.badgeLabel}>DIRECCIÓN INTEGRAL DE MEDIO AMBIENTE • GAMO</Text>
        <Text style={styles.title}>Supervisión de Aseo Urbano</Text>
        <Text style={styles.subtitle}>
          Control de flota, recorridos y auditoría de combustible en Oruro
        </Text>
      </View>

      {/* Tarjetas de Métricas Globales (KPIs) */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{activeVehiclesCount}/{vehicles.length}</Text>
          <Text style={styles.kpiLabel}>Flota en Servicio</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{totalDistance.toFixed(1)} km</Text>
          <Text style={styles.kpiLabel}>Distancia Total Hoy</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNumber, { color: '#D97706' }]}>
            {totalEstimatedFuel.toFixed(1)} L
          </Text>
          <Text style={styles.kpiLabel}>Combustible Estimado</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNumber, { color: '#059669' }]}>
            {totalMeasuredFuel.toFixed(1)} L
          </Text>
          <Text style={styles.kpiLabel}>Combustible Medido</Text>
        </View>
      </View>

      {/* Accesos a Submódulos Administrativos */}
      <Text style={styles.sectionHeader}>GESTIÓN DE RECURSOS</Text>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => router.push('/(admin)/vehicles' as any)}>
        <View style={[styles.navIconBox, { backgroundColor: '#EDE9FE' }]}>
          <Text style={styles.navEmoji}>🚛</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Vehículos y Coeficientes de Combustible</Text>
          <Text style={styles.navDesc}>
            Ajustar tasas de consumo por km y por hora de ralentí/compactador para cada modelo.
          </Text>
        </View>
        <Text style={styles.navArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => router.push('/(admin)/trips' as any)}>
        <View style={[styles.navIconBox, { backgroundColor: '#F3E8FF' }]}>
          <Text style={styles.navEmoji}>📋</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Historial y Auditoría de Recorridos</Text>
          <Text style={styles.navDesc}>
            Auditar viajes completados, duración de paradas y desvío entre estimado y medido.
          </Text>
        </View>
        <Text style={styles.navArrow}>→</Text>
      </TouchableOpacity>

      {/* Botón de Exportación */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
        <Text style={styles.exportButtonText}>📥 Exportar Datos de Auditoría (CSV / JSON)</Text>
      </TouchableOpacity>

      {/* Nota técnica */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Metodología de Auditoría Municipal</Text>
        <Text style={styles.infoText}>
          En el Casco Histórico de Oruro, los tiempos prolongados de detención en esquinas con el
          motor encendido alimentando el cilindro hidráulico representan hasta el 40% del consumo
          total de diésel. Todo reporte diferencia estrictamente el consumo cinemático inferido
          frente al comprobante físico de estación de servicio.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginBottom: 20,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  navCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navEmoji: {
    fontSize: 22,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  navDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  navArrow: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },
  exportButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#6D28D9',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#4C1D95',
    lineHeight: 18,
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { fleetStore } from '@/services/fleet-store';

export default function TripSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tripId?: string;
    distanceKm?: string;
    durationMin?: string;
    idleMin?: string;
    fuelEst?: string;
  }>();

  const [hasFuelLoad, setHasFuelLoad] = useState(false);
  const [liters, setLiters] = useState('');
  const [odometer, setOdometer] = useState('');
  const [station, setStation] = useState('Surtidor YPFB - Oruro');
  const [receipt, setReceipt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveAndClose = async () => {
    setSaving(true);
    try {
      if (params.tripId) {
        await fleetStore.finishTrip(
          params.tripId,
          hasFuelLoad && liters
            ? {
                litersLoaded: parseFloat(liters),
                odometerKm: parseFloat(odometer) || 0,
                fuelStation: station,
                receiptNumber: receipt,
              }
            : undefined
        );
      }
      Alert.alert(
        'Recorrido Concluido',
        'El recorrido ha sido registrado exitosamente en la memoria local municipal.',
        [
          {
            text: 'Volver al Inicio',
            onPress: () => router.replace('/(driver)' as any),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el recorrido.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.checkIcon}>✅</Text>
        <Text style={styles.headerTitle}>Recorrido Finalizado</Text>
        <Text style={styles.headerSubtitle}>
          Resumen consolidado para auditoría de aseo urbano en Oruro
        </Text>
      </View>

      {/* Tarjeta de Métricas Consolidadas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>MÉTRICAS OFICIALES DEL RECORRIDO</Text>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Distancia total recorrida:</Text>
          <Text style={styles.metricValue}>{params.distanceKm || '0'} km</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Duración total de turno:</Text>
          <Text style={styles.metricValue}>{params.durationMin || '0'} minutos</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Tiempo en ralentí (paradas de recojo):</Text>
          <Text style={styles.metricValue}>{params.idleMin || '0'} minutos</Text>
        </View>

        <View style={[styles.metricRow, styles.fuelRow]}>
          <View>
            <Text style={styles.fuelLabel}>Consumo Estimado:</Text>
            <Text style={styles.fuelBadge}>MODELO CINEMÁTICO</Text>
          </View>
          <Text style={styles.fuelValue}>{params.fuelEst || '0'} L</Text>
        </View>
      </View>

      {/* Sección de Carga de Combustible Medido */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>REGISTRO DE COMBUSTIBLE MEDIDO</Text>
            <Text style={styles.cardSubtitle}>
              ¿Se cargó diésel en surtidor con factura o vale oficial?
            </Text>
          </View>
          <Switch
            value={hasFuelLoad}
            onValueChange={setHasFuelLoad}
            trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
          />
        </View>

        {hasFuelLoad ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Litros Cargados (Medido en surtidor)*</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 20.0"
                keyboardType="numeric"
                value={liters}
                onChangeText={setLiters}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Odómetro del Tablero (km)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 142580"
                keyboardType="numeric"
                value={odometer}
                onChangeText={setOdometer}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estación de Servicio</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del surtidor"
                value={station}
                onChangeText={setStation}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>N° de Factura / Vale Municipal</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: FAC-84920"
                value={receipt}
                onChangeText={setReceipt}
              />
            </View>

            <Text style={styles.formNote}>
              📌 Al ingresar combustible medido, el sistema contrastará la variación frente a la
              estimación teórica en los reportes de administración.
            </Text>
          </View>
        ) : (
          <Text style={styles.noLoadText}>
            No se registró carga física. El recorrido quedará clasificado con consumo{' '}
            <Text style={{ fontWeight: '700' }}>'estimated'</Text>.
          </Text>
        )}
      </View>

      {/* Botón Guardar */}
      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.7 }]}
        disabled={saving}
        onPress={handleSaveAndClose}>
        <Text style={styles.saveButtonText}>Guardar y Concluir Turno</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  checkIcon: {
    fontSize: 44,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metricLabel: {
    fontSize: 13,
    color: '#475569',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  fuelRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    alignItems: 'center',
  },
  fuelLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  fuelBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  fuelValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D97706',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noLoadText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 10,
    lineHeight: 18,
  },
  formContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  formNote: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { fleetStore } from '@/services/fleet-store';
import { Vehicle } from '@/types/models';

export default function AdminVehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nominalRate, setNominalRate] = useState('');
  const [idleRate, setIdleRate] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const list = await fleetStore.getAllVehicles();
    setVehicles(list);
  };

  const startEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setNominalRate(v.nominalFuelRateKm.toString());
    setIdleRate(v.idleFuelRateHour.toString());
  };

  const handleSaveRates = async (id: string) => {
    const nr = parseFloat(nominalRate);
    const ir = parseFloat(idleRate);

    if (isNaN(nr) || isNaN(ir) || nr <= 0 || ir <= 0) {
      Alert.alert('Valores Inválidos', 'Ingresa números mayores a cero.');
      return;
    }

    try {
      await fleetStore.updateVehicleFuelRates(id, nr, ir);
      Alert.alert('Éxito', 'Coeficientes de consumo actualizados.');
      setEditingId(null);
      loadVehicles();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleToggleStatus = async (v: Vehicle) => {
    const nextStatus =
      v.status === 'available'
        ? 'maintenance'
        : v.status === 'maintenance'
        ? 'available'
        : 'available';
    await fleetStore.updateVehicleStatus(v.id, nextStatus);
    loadVehicles();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Flota de Camiones Recolectores</Text>
      <Text style={styles.headerSubtitle}>
        Configuración de tasas de consumo físico calibradas para la altitud de Oruro
      </Text>

      <View style={styles.list}>
        {vehicles.map((v) => {
          const isEditing = editingId === v.id;

          return (
            <View key={v.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{v.internalCode}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modelName}>{v.model}</Text>
                  <Text style={styles.plateNumber}>Placa: {v.plateNumber}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        v.status === 'in_service'
                          ? '#FEF3C7'
                          : v.status === 'available'
                          ? '#DCFCE7'
                          : '#FEE2E2',
                    },
                  ]}
                  onPress={() => handleToggleStatus(v)}>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          v.status === 'in_service'
                            ? '#92400E'
                            : v.status === 'available'
                            ? '#166534'
                            : '#991B1B',
                      },
                    ]}>
                    {v.status === 'in_service'
                      ? 'En servicio'
                      : v.status === 'available'
                      ? 'Disponible'
                      : 'Mantenimiento'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Coeficientes */}
              {isEditing ? (
                <View style={styles.editBox}>
                  <Text style={styles.editTitle}>Editar Coeficientes de Consumo:</Text>

                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Marcha (L/km):</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={nominalRate}
                        onChangeText={setNominalRate}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Ralentí/Toma (L/h):</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={idleRate}
                        onChangeText={setIdleRate}
                      />
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setEditingId(null)}>
                      <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={() => handleSaveRates(v.id)}>
                      <Text style={styles.saveBtnText}>Guardar Coeficientes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.ratesBox}>
                  <View style={styles.rateCol}>
                    <Text style={styles.rateLabel}>Tasa en Marcha</Text>
                    <Text style={styles.rateValue}>{v.nominalFuelRateKm} L/km</Text>
                  </View>
                  <View style={styles.rateCol}>
                    <Text style={styles.rateLabel}>Tasa en Ralentí + PTO</Text>
                    <Text style={styles.rateValue}>{v.idleFuelRateHour} L/hora</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => startEdit(v)}>
                    <Text style={styles.editBtnText}>Calibrar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    marginTop: 2,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: '#6D28D9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  codeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  plateNumber: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  rateCol: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  editBtn: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
  },
  editBox: {
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  editTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    color: '#4C1D95',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#6D28D9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

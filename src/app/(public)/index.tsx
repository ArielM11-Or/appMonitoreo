import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PublicMap } from '@/components/public-map';
import { fleetStore } from '@/services/fleet-store';
import { ORURO_LANDMARKS } from '@/services/mock-data';
import { PublicTruckStatus } from '@/types/models';

export default function PublicMapScreen() {
  const [trucks, setTrucks] = useState<PublicTruckStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    // Suscripción al bus de eventos de flota
    const unsubscribe = fleetStore.subscribeToFleetUpdates((updatedTrucks) => {
      setTrucks(updatedTrucks);
      setLoading(false);
      setLastRefreshed(new Date());
    });

    return () => unsubscribe();
  }, []);

  const getFreshness = (isoDate: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diffSec < 60) return `hace ${diffSec} seg`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} min`;
    return `hace ${Math.floor(diffMin / 60)} h`;
  };

  const getNearestLandmark = (lat: number, lng: number) => {
    // Aproximación simple para orientar al vecino en el Casco Histórico
    if (lat > -17.966) return 'Cerca de Plaza 10 de Febrero';
    if (lng < -67.115) return 'Sector Santuario del Socavón';
    return 'Sector Mercado Fermín López';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Banner de Consulta Ciudadana */}
      <View style={styles.banner}>
        <View style={styles.badgeRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>SEGUIMIENTO PÚBLICO • CASCO HISTÓRICO DE ORURO</Text>
        </View>
        <Text style={styles.bannerTitle}>Camiones Recolectores en Ruta</Text>
        <Text style={styles.bannerSub}>
          Consulta la aproximación del servicio de aseo urbano. Los datos se actualizan
          automáticamente.
        </Text>
      </View>

      {/* Tarjeta de Referencia Urbana (Casco Histórico) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PUNTOS DE REFERENCIA EN EL CASCO VIEJO</Text>
        <View style={styles.landmarksRow}>
          <View style={styles.landmarkChip}>
            <Text style={styles.landmarkIcon}>🏛️</Text>
            <Text style={styles.landmarkText}>{ORURO_LANDMARKS.center.title}</Text>
          </View>
          <View style={styles.landmarkChip}>
            <Text style={styles.landmarkIcon}>⛪</Text>
            <Text style={styles.landmarkText}>{ORURO_LANDMARKS.socavon.title}</Text>
          </View>
          <View style={styles.landmarkChip}>
            <Text style={styles.landmarkIcon}>🛒</Text>
            <Text style={styles.landmarkText}>{ORURO_LANDMARKS.mercadoFermin.title}</Text>
          </View>
        </View>
      </View>

      {/* Mapa Interactivo con Leaflet y OpenStreetMap de Oruro */}
      <PublicMap trucks={trucks} height={380} />

      {/* Lista de Camiones Activos */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ESTADO DE LA FLOTA EN SERVICIO ({trucks.length})</Text>
        <Text style={styles.refreshText}>
          Actualizado: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color="#059669" size="large" />
          <Text style={styles.loadingText}>Localizando camiones...</Text>
        </View>
      ) : trucks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🚚</Text>
          <Text style={styles.emptyTitle}>No hay camiones en servicio en este momento</Text>
          <Text style={styles.emptySub}>
            Los turnos de recolección en el centro histórico inician a las 06:00 y 19:00.
          </Text>
        </View>
      ) : (
        <View style={styles.truckList}>
          {trucks.map((truck) => {
            const diffMin = (Date.now() - new Date(truck.lastUpdate).getTime()) / (1000 * 60);
            const isFresh = diffMin < 5;
            const isDelayed = diffMin >= 5 && diffMin < 15;

            return (
              <View key={truck.vehicleId} style={styles.truckCard}>
                <View style={styles.truckHeader}>
                  <View style={styles.codeContainer}>
                    <Text style={styles.truckCode}>{truck.internalCode}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.truckModel}>{truck.model}</Text>
                    <Text style={styles.truckLocation}>
                      📍 {getNearestLandmark(truck.latitude, truck.longitude)}
                    </Text>
                  </View>

                  {/* Semáforo de Frescura */}
                  <View
                    style={[
                      styles.statusPill,
                      isFresh
                        ? styles.statusFresh
                        : isDelayed
                        ? styles.statusDelayed
                        : styles.statusOffline,
                    ]}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: isFresh
                            ? '#16A34A'
                            : isDelayed
                            ? '#D97706'
                            : '#64748B',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isFresh
                            ? '#16A34A'
                            : isDelayed
                            ? '#D97706'
                            : '#64748B',
                        },
                      ]}>
                      {isFresh ? 'EN SERVICIO' : isDelayed ? 'SEÑAL DEMORADA' : 'INACTIVO'}
                    </Text>
                  </View>
                </View>

                {/* Detalles de Coordenadas y Hora */}
                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>
                    Velocidad: <Text style={styles.boldText}>{truck.speedKmh} km/h</Text>
                  </Text>
                  <Text style={styles.detailText}>
                    Último reporte: <Text style={styles.boldText}>{getFreshness(truck.lastUpdate)}</Text>
                  </Text>
                </View>

                {/* Alerta de señal demorada si corresponde */}
                {isDelayed && (
                  <View style={styles.delayedAlert}>
                    <Text style={styles.delayedAlertText}>
                      ⚠️ La señal del camión no se recibe desde hace más de 5 minutos (posible calle
                      estrecha o corte de cobertura móvil en Oruro).
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Garantía de Privacidad y Consentimiento */}
      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>🔒 POLÍTICA DE PRIVACIDAD MUNICIPAL</Text>
        <Text style={styles.privacyText}>
          Este mapa público solo muestra la posición técnica de las unidades recolectoras durante
          sus turnos oficiales. Por seguridad y protección de datos, no se exhiben nombres ni datos
          personales del personal operativo.
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
  banner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.7,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  landmarksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  landmarkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  landmarkIcon: {
    fontSize: 14,
  },
  landmarkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  refreshText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  centerBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  truckList: {
    gap: 12,
    marginBottom: 20,
  },
  truckCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: '#064E3B',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  truckCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  truckModel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  truckLocation: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusFresh: {
    backgroundColor: '#DCFCE7',
  },
  statusDelayed: {
    backgroundColor: '#FEF3C7',
  },
  statusOffline: {
    backgroundColor: '#F1F5F9',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '700',
    color: '#1E293B',
  },
  delayedAlert: {
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    padding: 8,
  },
  delayedAlertText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  privacyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  privacyText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});

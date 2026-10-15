import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, role, switchRole, loginAsDriver, loginAsAdmin, loginAsPublic } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Encabezado Institucional */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.statusDot} />
            <Text style={styles.badgeText}>SISTEMA DE GESTIÓN MUNICIPAL - ORURO</Text>
          </View>
          <Text style={styles.mainTitle}>Monitoreo de Residuos Sólidos</Text>
          <Text style={styles.subtitle}>
            Casco Histórico • Prueba Piloto de Trazabilidad y Combustible
          </Text>
        </View>

        {/* Tarjeta de Sesión Rápida (Selector de Persona de Prueba) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>SESIÓN ACTIVA PARA PRUEBAS</Text>
          <View style={styles.userInfoRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{currentUser.fullName.charAt(0)}</Text>
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{currentUser.fullName}</Text>
              <Text style={styles.userRole}>
                Rol actual:{' '}
                <Text style={styles.userRoleHighlight}>
                  {role === 'driver' ? 'Conductor' : role === 'admin' ? 'Administrador' : 'Ciudadano'}
                </Text>
              </Text>
            </View>
          </View>

          <Text style={styles.helperText}>
            Cambia rápidamente de rol para probar cada módulo del piloto:
          </Text>
          <View style={styles.roleSwitcherRow}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
              onPress={() => loginAsDriver('driver1')}>
              <Text style={[styles.roleButtonText, role === 'driver' && styles.roleButtonTextActive]}>
                🚛 Conductor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, role === 'public' && styles.roleButtonActive]}
              onPress={loginAsPublic}>
              <Text style={[styles.roleButtonText, role === 'public' && styles.roleButtonTextActive]}>
                🗺️ Vecino
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
              onPress={loginAsAdmin}>
              <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextActive]}>
                📊 Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Módulos de Acceso */}
        <Text style={styles.sectionHeader}>MÓDULOS DEL PILOTO</Text>

        {/* 1. Módulo Conductor */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => {
            loginAsDriver('driver1');
            router.push('/(driver)' as any);
          }}>
          <View style={[styles.moduleIconBox, { backgroundColor: '#E0F2FE' }]}>
            <Text style={styles.moduleEmoji}>🚛</Text>
          </View>
          <View style={styles.moduleContent}>
            <Text style={styles.moduleTitle}>Portal del Conductor</Text>
            <Text style={styles.moduleDescription}>
              Iniciar recorrido, captura GPS en segundo plano, odómetro, cálculo de ralentí y vale de combustible.
            </Text>
            <Text style={styles.moduleAction}>Ingresar al turno →</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Módulo Mapa Público */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => {
            loginAsPublic();
            router.push('/(public)' as any);
          }}>
          <View style={[styles.moduleIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.moduleEmoji}>🗺️</Text>
          </View>
          <View style={styles.moduleContent}>
            <Text style={styles.moduleTitle}>Mapa Ciudadano en Vivo</Text>
            <Text style={styles.moduleDescription}>
              Ubicación en tiempo real de los camiones recolectores en el Casco Histórico con semáforo de frescura.
            </Text>
            <Text style={[styles.moduleAction, { color: '#059669' }]}>Ver mapa público →</Text>
          </View>
        </TouchableOpacity>

        {/* 3. Módulo Administrador */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => {
            loginAsAdmin();
            router.push('/(admin)' as any);
          }}>
          <View style={[styles.moduleIconBox, { backgroundColor: '#F3E8FF' }]}>
            <Text style={styles.moduleEmoji}>📊</Text>
          </View>
          <View style={styles.moduleContent}>
            <Text style={styles.moduleTitle}>Panel de Administración</Text>
            <Text style={styles.moduleDescription}>
              Supervisión de flota, historial de recorridos, auditoría de combustible estimado vs medido y coeficientes.
            </Text>
            <Text style={[styles.moduleAction, { color: '#7C3AED' }]}>Abrir consola →</Text>
          </View>
        </TouchableOpacity>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GAMO • DIMA (Dirección Integral de Medio Ambiente) • Oruro, Bolivia
          </Text>
          <Text style={styles.footerSubtext}>
            Arquitectura desacoplada • Fase 1 (Estructura & Modelos)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  userRole: {
    fontSize: 13,
    color: '#64748B',
  },
  userRoleHighlight: {
    fontWeight: '700',
    color: '#0284C7',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  roleSwitcherRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#0284C7',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  moduleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleEmoji: {
    fontSize: 26,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 6,
  },
  moduleAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
    textAlign: 'center',
  },
});

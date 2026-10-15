import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#6D28D9' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Panel Administrativo GAMO',
          headerBackTitle: 'Inicio',
        }}
      />
      <Stack.Screen
        name="vehicles"
        options={{
          title: 'Gestión de Vehículos & Coeficientes',
        }}
      />
      <Stack.Screen
        name="trips"
        options={{
          title: 'Auditoría de Recorridos',
        }}
      />
    </Stack>
  );
}

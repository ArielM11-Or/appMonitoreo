import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0284C7' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Turno de Conductor',
          headerBackTitle: 'Inicio',
        }}
      />
      <Stack.Screen
        name="active-trip"
        options={{
          title: 'Recorrido en Curso',
          headerBackVisible: false, // Evita volver atrás por error mientras el GPS corre
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: 'Resumen del Recorrido',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}

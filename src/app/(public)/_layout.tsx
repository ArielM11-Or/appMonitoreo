import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#059669' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mapa Ciudadano Oruro',
          headerBackTitle: 'Inicio',
        }}
      />
    </Stack>
  );
}

/**
 * Home Stack Layout — İşletmeler sekmesinin içindeki stack navigasyonu.
 *
 * expo-router'da Stack bileşeni ile sayfa yığını oluşturulur.
 * Akış: İşletmeler (index) → Salon Detay (salon) → Randevu Al (booking)
 *
 * Eski koddaki CustomerHomeStack'in karşılığı.
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      {/* İşletmeler listesi — stack'in ilk sayfası */}
      <Stack.Screen name="index" />

      {/* Salon detay / hizmetler sayfası */}
      <Stack.Screen name="salon" />

      {/* Randevu alma sayfası */}
      <Stack.Screen name="booking" />
    </Stack>
  );
}

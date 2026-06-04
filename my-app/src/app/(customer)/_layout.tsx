/**
 * Customer Tab Layout — Müşteri sekmeli navigasyonu.
 *
 * expo-router'da Tabs bileşeni ile alt sekme çubuğu oluşturulur.
 * 3 sekme: İşletmeler (Home stack), Randevularım, Profil
 *
 * Eski koddaki BottomTabNavigator'ın karşılığı.
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function CustomerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* ───── İşletmeler Sekmesi (Home Stack) ───── */}
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'İşletmeler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />

      {/* ───── Randevularım Sekmesi ───── */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Randevularım',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* ───── Profil Sekmesi ───── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

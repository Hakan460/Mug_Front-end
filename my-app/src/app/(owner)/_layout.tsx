/**
 * Owner Tab Layout — Salon sahibi sekmeli navigasyonu.
 *
 * 3 sekme: İşletme Paneli (Dashboard), Randevular, Profil
 * Eski koddaki OWNER rolü için BottomTabNavigator'ın karşılığı.
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function OwnerTabLayout() {
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
      {/* ───── İşletme Paneli ───── */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'İşletme Paneli',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />

      {/* ───── Randevular ───── */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Randevular',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* ───── Profil ───── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* ───── Gizli Paneller (Tab barda gözükmez) ───── */}
      <Tabs.Screen
        name="business-settings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="services-settings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="staff-settings"
        options={{ href: null }}
      />
    </Tabs>
  );
}

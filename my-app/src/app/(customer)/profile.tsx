/**
 * Profil Ekranı (Müşteri)
 *
 * Eski ProfileScreen.tsx'in expo-router uyumlu versiyonu.
 * Props (userRole, onLogout) → useAuth() context hook'una geçti.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';
const AVATAR_URL = 'https://randomuser.me/api/portraits/men/32.jpg';

export default function ProfileScreen() {
  const { userRole, logout } = useAuth();

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        {/* ───── Profil Kartı ───── */}
        <View style={styles.profileCard}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
          <Text style={styles.name}>Emirhan Kılıç</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {userRole === 'CUSTOMER' ? 'Seçkin Müşteri' : 'Salon Sahibi / Yönetici'}
            </Text>
          </View>
        </View>

        {/* ───── Menü ───── */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Hesap Ayarları</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Güvenlik ve İzinler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
            <Text style={[styles.menuText, { color: Colors.danger }]}>
              Sistemden Güvenli Çıkış
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 20,
    justifyContent: 'center',
  },
  profileCard: { alignItems: 'center', marginBottom: 40 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 15,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  badgeText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },
  menuContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  logoutItem: { borderBottomWidth: 0 },
  menuText: { color: Colors.text, fontSize: 16, marginLeft: 12, fontWeight: '500' },
});

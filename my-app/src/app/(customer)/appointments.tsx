/**
 * Randevularım Ekranı (Müşteri)
 *
 * Eski MyAppointmentsScreen.tsx'in expo-router uyumlu versiyonu.
 * Müşterinin randevularını bilet tarzı kartlarla gösterir.
 *
 * Değişiklikler:
 * - useIsFocused → useFocusEffect
 * - BlurView → View + glassBackground
 * - API → api.ts servisinden
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getAppointments, deleteAppointment, Appointment } from '@/services/api';

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    getAppointments()
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Ekrana her odaklandığında verileri tazele
  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const cancelAppointment = (id: number) => {
    Alert.alert(
      'İptal Onayı',
      'Bu randevuyu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: () => {
            deleteAppointment(id)
              .then(() => fetchAppointments())
              .catch((err) => console.error(err));
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        {/* ───── Başlık ───── */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Randevularım</Text>
          <Text style={styles.subtitle}>Yaklaşan güzellik serüveniniz</Text>
        </View>

        {appointments.length === 0 ? (
          /* ───── Boş Durum ───── */
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-clear-outline"
              size={70}
              color="rgba(212, 175, 55, 0.5)"
            />
            <Text style={styles.emptyText}>
              Henüz bir randevunuz bulunmuyor.
            </Text>
          </View>
        ) : (
          /* ───── Randevu Listesi (Bilet Tasarımı) ───── */
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.ticketCard}>
                {/* Biletin üst kısmı */}
                <View style={styles.ticketTop}>
                  <View>
                    <Text style={styles.serviceName}>
                      {item.serviceName || 'Bilinmeyen Hizmet'}
                    </Text>
                    <Text style={styles.statusText}>
                      Durum: {item.status || 'Onaylandı'}
                    </Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Ionicons name="cut" size={24} color={Colors.primary} />
                  </View>
                </View>

                {/* Bilet kesik çizgisi */}
                <View style={styles.divider}>
                  <View style={styles.circleLeft} />
                  <View style={styles.dashedLine} />
                  <View style={styles.circleRight} />
                </View>

                {/* Biletin alt kısmı */}
                <View style={styles.ticketBottom}>
                  <View style={styles.timeInfo}>
                    <Ionicons name="calendar-outline" size={16} color="#AAAAAA" />
                    <Text style={styles.timeText}>
                      {item.bookingDate || 'Bugün'} — {item.bookingTime || '---'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => cancelAppointment(item.id)}
                  >
                    <Text style={styles.cancelBtnText}>İptal Et</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#E0E0E0', marginTop: 5, fontStyle: 'italic' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { color: '#AAAAAA', fontSize: 16, marginTop: 15, fontWeight: '500' },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  ticketCard: {
    overflow: 'hidden',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: Colors.glassBackground,
  },

  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  serviceName: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginBottom: 5 },
  statusText: { fontSize: 14, color: Colors.success, fontWeight: 'bold' },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bilet kesik çizgi efekti
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  circleLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    marginLeft: -12,
  },
  circleRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    marginRight: -12,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },

  ticketBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  timeInfo: { flexDirection: 'row', alignItems: 'center' },
  timeText: { color: '#AAAAAA', marginLeft: 8, fontSize: 15, fontWeight: '600' },

  cancelBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.5)',
  },
  cancelBtnText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },
});

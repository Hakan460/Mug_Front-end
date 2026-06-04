/**
 * İşletme Paneli (Admin Dashboard)
 *
 * Eski AdminDashboardScreen.tsx'in expo-router uyumlu versiyonu.
 * Salon sahibinin tüm randevuları görmesi ve yönetmesi.
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
import {
  getAllAppointments,
  deleteAppointment as deleteAppointmentApi,
  Appointment,
} from '@/services/api';

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

export default function AdminDashboardScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    getAllAppointments()
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const totalAppointments = appointments.length;
  const expectedRevenue = appointments.reduce(
    (sum, app) => sum + Number(app.service?.price || app.servicePrice || 0),
    0
  );

  const handleDeleteAppointment = (id: number) => {
    Alert.alert(
      'Randevuyu Sil',
      'Bu randevuyu sistemden tamamen silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteAppointmentApi(id)
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
          <Text style={styles.title}>İşletme Paneli</Text>
          <Text style={styles.subtitle}>İşler tıkırında patron! 💼</Text>
        </View>

        {/* ───── İstatistik Kartları ───── */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="people" size={28} color={Colors.primary} />
            <Text style={styles.statValue}>{totalAppointments}</Text>
            <Text style={styles.statLabel}>Toplam Randevu</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="wallet" size={28} color={Colors.success} />
            <Text style={styles.statValue}>{expectedRevenue} ₺</Text>
            <Text style={styles.statLabel}>Beklenen Ciro</Text>
          </View>
        </View>

        {/* ───── Randevu Listesi ───── */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Tüm Randevular</Text>

          {appointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="folder-open-outline"
                size={50}
                color="rgba(212, 175, 55, 0.5)"
              />
              <Text style={styles.emptyText}>
                Henüz bir randevu kaydı yok.
              </Text>
            </View>
          ) : (
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.adminCard}>
                  <View style={styles.cardLeft}>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeText}>
                        {item.bookingDate || 'Tarihsiz'}
                      </Text>
                      <Text
                        style={[
                          styles.timeText,
                          { fontSize: 12, marginTop: 3, color: '#E0E0E0' },
                        ]}
                      >
                        {item.bookingTime || '---'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.customerName}>
                        👤 {item.user?.name || 'Bilinmeyen Müşteri'}
                      </Text>
                      <Text style={styles.serviceName}>
                        ✂️ {item.service?.name || item.serviceName || 'Silinmiş Hizmet'}
                      </Text>
                      <Text style={styles.priceText}>
                        Ücret: {item.service?.price || item.servicePrice || 0} TL
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteAppointment(item.id)}
                  >
                    <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15 },
  title: { fontSize: 32, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#E0E0E0', marginTop: 5 },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statBox: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: Colors.glassBackground,
  },
  statValue: { fontSize: 26, fontWeight: 'bold', color: Colors.text, marginVertical: 8 },
  statLabel: { fontSize: 14, color: '#AAAAAA', fontWeight: '600' },

  listSection: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  adminCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  timeBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 15,
    alignItems: 'center',
  },
  timeText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  serviceName: { fontSize: 14, color: '#CCCCCC', marginBottom: 4 },
  priceText: { fontSize: 14, color: Colors.success, fontWeight: '600' },

  deleteBtn: {
    padding: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 10,
  },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#AAAAAA', fontSize: 16, marginTop: 15, fontWeight: '500' },
});

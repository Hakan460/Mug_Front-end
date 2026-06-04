/**
 * Randevular Ekranı (Salon Sahibi)
 * Müşteri versiyonuyla aynı, sadece owner grubunda.
 * İleride farklılaştırılabilir (örn: tüm müşterilerin randevularını gösterme).
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

export default function OwnerAppointmentsScreen() {
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

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const handleCancelAppointment = (id: number) => {
    Alert.alert(
      'Randevuyu Sil',
      'Bu randevuyu silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
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
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Randevular</Text>
          <Text style={styles.subtitle}>Tüm müşteri randevuları</Text>
        </View>

        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-clear-outline"
              size={70}
              color="rgba(212, 175, 55, 0.5)"
            />
            <Text style={styles.emptyText}>Henüz bir randevu kaydı yok.</Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.ticketCard}>
                <View style={styles.ticketTop}>
                  <View>
                    <Text style={styles.serviceName}>
                      {item.serviceName || 'Bilinmeyen Hizmet'}
                    </Text>
                    <Text style={styles.statusText}>
                      {item.bookingDate} — {item.bookingTime}
                    </Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Ionicons name="cut" size={24} color={Colors.primary} />
                  </View>
                </View>

                <View style={styles.divider}>
                  <View style={styles.circleLeft} />
                  <View style={styles.dashedLine} />
                  <View style={styles.circleRight} />
                </View>

                <View style={styles.ticketBottom}>
                  <Text style={styles.priceText}>
                    {item.servicePrice || 0} TL
                  </Text>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancelAppointment(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                    <Text style={styles.cancelBtnText}> Sil</Text>
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
  statusText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  circleLeft: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.8)', marginLeft: -12 },
  circleRight: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.8)', marginRight: -12 },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed', marginHorizontal: 10 },

  ticketBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  priceText: { color: Colors.success, fontSize: 18, fontWeight: 'bold' },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.5)',
  },
  cancelBtnText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },
});

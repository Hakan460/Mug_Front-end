import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground, StatusBar, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

export default function AdminDashboardScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchAppointments = () => {
    setLoading(true);
    fetch('http://10.0.2.2:3000/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isFocused) fetchAppointments();
  }, [isFocused]);

  const totalAppointments = appointments.length;
  // DÜZELTME: Number() kullanarak metinleri matematiksel toplama çevirdik.
  // Böylece "500500" yerine 1000 TL gösterecek!
  const expectedRevenue = appointments.reduce((sum, app: any) => sum + Number(app.service?.price || 0), 0);

  const deleteAppointment = (id: number) => {
    Alert.alert(
      "Randevuyu Sil",
      "Bu randevuyu sistemden tamamen silmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil", style: "destructive",
          onPress: () => {
            fetch(`http://10.0.2.2:3000/appointments/${id}`, { method: 'DELETE' })
              .then(() => fetchAppointments())
              .catch(err => console.error(err));
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: '#121212' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

        <View style={styles.headerContainer}>
          <Text style={styles.title}>İşletme Paneli</Text>
          <Text style={styles.subtitle}>İşler tıkırında patron! 💼</Text>
        </View>

        <View style={styles.statsContainer}>
          <BlurView intensity={70} tint="dark" style={styles.statBox}>
            <Ionicons name="people" size={28} color="#D4AF37" />
            <Text style={styles.statValue}>{totalAppointments}</Text>
            <Text style={styles.statLabel}>Toplam Randevu</Text>
          </BlurView>

          <BlurView intensity={70} tint="dark" style={styles.statBox}>
            <Ionicons name="wallet" size={28} color="#2ecc71" />
            <Text style={styles.statValue}>{expectedRevenue} ₺</Text>
            <Text style={styles.statLabel}>Beklenen Ciro</Text>
          </BlurView>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Tüm Randevular</Text>

          {appointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={50} color="rgba(212, 175, 55, 0.5)" />
              <Text style={styles.emptyText}>Henüz bir randevu kaydı yok.</Text>
            </View>
          ) : (
            <FlatList
              data={appointments}
              keyExtractor={(item: any) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.adminCard}>
                  <View style={styles.cardLeft}>
                    <View style={styles.timeBadge}>
                      {/* DÜZELTME: Artık veritabanındaki gerçek gün ve saat yazıyor */}
                      <Text style={styles.timeText}>{item.bookingDate || 'Tarihsiz'}</Text>
                      <Text style={[styles.timeText, { fontSize: 12, marginTop: 3, color: '#E0E0E0' }]}>{item.bookingTime || '---'}</Text>
                    </View>
                    <View>
                      <Text style={styles.serviceName}>{item.service?.name || "Silinmiş Hizmet"}</Text>
                      <Text style={styles.priceText}>Ücret: {item.service?.price || 0} TL</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteAppointment(item.id)}>
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
  title: { fontSize: 32, fontWeight: '900', color: '#D4AF37', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#E0E0E0', marginTop: 5 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  statBox: {
    width: '48%', padding: 20, borderRadius: 20, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  statValue: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginVertical: 8 },
  statLabel: { fontSize: 14, color: '#AAAAAA', fontWeight: '600' },

  listSection: { flex: 1, backgroundColor: '#121212', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 25 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 20, marginBottom: 15 },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  adminCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A1A1A', padding: 15, borderRadius: 15, marginBottom: 15,
    borderLeftWidth: 4, borderLeftColor: '#D4AF37'
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  timeBadge: { backgroundColor: 'rgba(212, 175, 55, 0.15)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 15, alignItems: 'center' },
  timeText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 13 },
  serviceName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  priceText: { fontSize: 14, color: '#2ecc71', fontWeight: '600' },

  deleteBtn: { padding: 10, backgroundColor: 'rgba(231, 76, 60, 0.1)', borderRadius: 10 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#AAAAAA', fontSize: 16, marginTop: 15, fontWeight: '500' },
});
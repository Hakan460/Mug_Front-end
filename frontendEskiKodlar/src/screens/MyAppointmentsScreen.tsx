import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground, StatusBar, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kullanıcı bu sekmeye her tıkladığında verileri tazelemek için
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

  // Randevu İptal Etme Fonksiyonu
  const cancelAppointment = (id: number) => {
    Alert.alert(
      "İptal Onayı",
      "Bu randevuyu iptal etmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "İptal Et", style: "destructive",
          onPress: () => {
            fetch(`http://10.0.2.2:3000/appointments/${id}`, { method: 'DELETE' })
              .then(() => fetchAppointments()) // Silme başarılıysa listeyi yenile
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
          <Text style={styles.title}>Randevularım</Text>
          <Text style={styles.subtitle}>Yaklaşan güzellik serüveniniz</Text>
        </View>

        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={70} color="rgba(212, 175, 55, 0.5)" />
            <Text style={styles.emptyText}>Henüz bir randevunuz bulunmuyor.</Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <BlurView intensity={60} tint="dark" style={styles.ticketCard}>
                {/* Biletin Üst Kısmı */}
                <View style={styles.ticketTop}>
                  <View>
                    <Text style={styles.serviceName}>{item.service?.name || "Bilinmeyen Hizmet"}</Text>
                    <Text style={styles.statusText}>Durum: {item.status}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Ionicons name="cut" size={24} color="#D4AF37" />
                  </View>
                </View>

                {/* Bilet Kesik Çizgisi (Tasarım Detayı) */}
                <View style={styles.divider}>
                   <View style={styles.circleLeft} />
                   <View style={styles.dashedLine} />
                   <View style={styles.circleRight} />
                </View>

                {/* Biletin Alt Kısmı */}
                <View style={styles.ticketBottom}>
                  <View style={styles.timeInfo}>
                     <Ionicons name="calendar-outline" size={16} color="#AAAAAA" />
                     <Text style={styles.timeText}>Sistem Kaydı (Bugün)</Text>
                  </View>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelAppointment(item.id)}>
                    <Text style={styles.cancelBtnText}>İptal Et</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
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
  title: { fontSize: 32, fontWeight: '900', color: '#D4AF37', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#E0E0E0', marginTop: 5, fontStyle: 'italic' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { color: '#AAAAAA', fontSize: 16, marginTop: 15, fontWeight: '500' },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  ticketCard: { overflow: 'hidden', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },

  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  serviceName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  statusText: { fontSize: 14, color: '#2ecc71', fontWeight: 'bold' },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center' },

  // Bilet Kesik Çizgi Efekti
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  circleLeft: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.8)', marginLeft: -12 },
  circleRight: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.8)', marginRight: -12 },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed', marginHorizontal: 10 },

  ticketBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  timeInfo: { flexDirection: 'row', alignItems: 'center' },
  timeText: { color: '#AAAAAA', marginLeft: 8, fontSize: 15, fontWeight: '600' },

  cancelBtn: { backgroundColor: 'rgba(231, 76, 60, 0.15)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(231, 76, 60, 0.5)' },
  cancelBtnText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 }
});
/**
 * Randevu Alma Ekranı
 *
 * Eski BookingScreen.tsx'in expo-router uyumlu versiyonu.
 * Personel, tarih ve saat seçerek randevu oluşturur.
 *
 * Değişiklikler:
 * - useRoute → useLocalSearchParams (expo-router)
 * - useIsFocused → useFocusEffect (expo-router)
 * - navigation.navigate → router.replace
 * - API çağrıları → api.ts servisinden
 * - Params: service objesi yerine ayrı string parametreler
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getAppointments, createAppointment, Appointment } from '@/services/api';

// Sahte uzman personel verileri — backend hazır olunca API'den gelecek
const MOCK_STAFF = [
  {
    id: 'staff_1',
    name: 'Emirhan Kılıç',
    title: 'Master Barber',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 'staff_2',
    name: 'Hakan Yılmaz',
    title: 'Saç Tasarım',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
  },
  {
    id: 'staff_3',
    name: 'Fark Etmez',
    title: 'En Uygun Uzman',
    avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  },
];

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    serviceDescription: string;
    servicePrice: string;
    serviceDuration: string;
    businessName: string;
  }>();

  const service = {
    id: Number(params.serviceId),
    name: params.serviceName || '',
    description: params.serviceDescription || '',
    price: Number(params.servicePrice),
    duration: Number(params.serviceDuration),
  };
  const businessName = params.businessName || 'Salon VIP';

  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('Bugün');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);

  const dates = ['Bugün', 'Yarın', '12 Mayıs', '13 Mayıs', '14 Mayıs'];
  const times = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

  // Ekran odaklandığında randevuları çek
  useFocusEffect(
    useCallback(() => {
      getAppointments()
        .then((data) => setBookedAppointments(data))
        .catch((err) => console.error('Randevular çekilemedi:', err));
    }, [])
  );

  // Seçili tarih için dolu saatleri filtrele
  const takenTimesForSelectedDate = bookedAppointments
    .filter((app) => app.bookingDate === selectedDate)
    .map((app) => app.bookingTime);

  // Tarih değiştiğinde dolu saat seçiliyse sıfırla
  useEffect(() => {
    if (takenTimesForSelectedDate.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate, bookedAppointments]);

  const handleBooking = () => {
    if (!selectedStaff) {
      Alert.alert('Eksik Seçim', 'Lütfen hizmet almak istediğiniz personeli seçin.');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Eksik Seçim', 'Lütfen randevu için uygun bir saat seçin.');
      return;
    }

    createAppointment({
      serviceId: service.id,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      staffId: selectedStaff,
    })
      .then(() => {
        const staffName = MOCK_STAFF.find((s) => s.id === selectedStaff)?.name;
        Alert.alert(
          'Randevu Onaylandı! 🎉',
          `${businessName} - ${staffName} ile ${service.name} için randevunuz oluşturuldu.`,
          [
            {
              text: 'Randevularıma Git',
              onPress: () => router.replace('/(customer)/appointments' as any),
            },
          ]
        );
      })
      .catch((error) => {
        Alert.alert('Dolu!', 'Bu saat az önce başkası tarafından alındı.');
        console.error('Hata:', error);
      });
  };

  if (!params.serviceId) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: Colors.text }}>Lütfen önce bir hizmet seçin.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ───── Geri Butonu ───── */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      {/* ───── Hizmet Bilgi Kartı ───── */}
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceTitle}>{service.name}</Text>
        <Text style={styles.serviceDesc}>{service.description}</Text>
        <View style={styles.serviceInfoRow}>
          <View style={styles.infoChip}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{service.duration} Dk.</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="cash-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{service.price} TL</Text>
          </View>
        </View>
      </View>

      {/* ───── Uzman Seçimi ───── */}
      <Text style={styles.sectionTitle}>Uzman Seçin</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.staffScroll}>
        {MOCK_STAFF.map((staff) => (
          <TouchableOpacity
            key={staff.id}
            style={[styles.staffCard, selectedStaff === staff.id && styles.selectedStaffCard]}
            onPress={() => {
              setSelectedStaff(staff.id);
              setSelectedTime('');
            }}
            activeOpacity={0.7}
          >
            <Image source={{ uri: staff.avatar }} style={styles.staffAvatar} />
            <Text style={[styles.staffName, selectedStaff === staff.id && styles.selectedStaffText]}>
              {staff.name}
            </Text>
            <Text style={styles.staffTitle}>{staff.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ───── Tarih Seçimi ───── */}
      <Text style={[styles.sectionTitle, !selectedStaff && { opacity: 0.3 }]}>Tarih Seçin</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.horizontalScroll, !selectedStaff && { opacity: 0.3 }]}
        pointerEvents={selectedStaff ? 'auto' : 'none'}
      >
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dateChip, selectedDate === date && styles.selectedDateChip]}
            onPress={() => {
              setSelectedDate(date);
              setSelectedTime('');
            }}
          >
            <Text style={[styles.dateText, selectedDate === date && styles.selectedDateText]}>
              {date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ───── Saat Seçimi ───── */}
      <Text style={[styles.sectionTitle, !selectedStaff && { opacity: 0.3 }]}>Saat Seçin</Text>
      <View
        style={[styles.timeGrid, !selectedStaff && { opacity: 0.3 }]}
        pointerEvents={selectedStaff ? 'auto' : 'none'}
      >
        {times.map((time, index) => {
          const isBooked = takenTimesForSelectedDate.includes(time);
          const isSelected = selectedTime === time && !isBooked;

          return (
            <TouchableOpacity
              key={index}
              disabled={isBooked}
              style={[
                styles.timeChip,
                isSelected && styles.selectedTimeChip,
                isBooked && styles.disabledTimeChip,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeText,
                  isSelected && styles.selectedTimeText,
                  isBooked && styles.disabledTimeText,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ───── Onay Butonu ───── */}
      <TouchableOpacity
        style={[styles.confirmButton, (!selectedTime || !selectedStaff) && { opacity: 0.4 }]}
        onPress={handleBooking}
        disabled={!selectedTime || !selectedStaff}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmButtonText}>Randevuyu Onayla</Text>
        <Ionicons name="checkmark-circle" size={20} color={Colors.background} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 40,
  },

  serviceHeader: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  serviceDesc: { fontSize: 14, color: '#AAAAAA', marginBottom: 15, lineHeight: 20 },
  serviceInfoRow: { flexDirection: 'row', gap: 15 },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoText: { color: Colors.primary, marginLeft: 5, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },

  // Personel seçim stilleri
  staffScroll: { marginBottom: 25, flexGrow: 0 },
  staffCard: {
    width: 120,
    padding: 15,
    backgroundColor: Colors.card,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedStaffCard: { borderColor: Colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  staffAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, borderWidth: 1, borderColor: '#444' },
  staffName: { color: Colors.text, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  selectedStaffText: { color: Colors.primary },
  staffTitle: { color: '#777', fontSize: 12, marginTop: 2 },

  // Tarih seçim stilleri
  horizontalScroll: { marginBottom: 25, flexGrow: 0 },
  dateChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedDateChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateText: { color: '#AAAAAA', fontSize: 16, fontWeight: '600' },
  selectedDateText: { color: Colors.background, fontWeight: 'bold' },

  // Saat seçim stilleri
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  timeChip: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedTimeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeText: { color: '#AAAAAA', fontSize: 16, fontWeight: '600' },
  selectedTimeText: { color: Colors.background, fontWeight: 'bold' },
  disabledTimeChip: { backgroundColor: '#1c1c1c', borderColor: '#222', opacity: 0.4 },
  disabledTimeText: { color: '#555555', textDecorationLine: 'line-through' },

  // Onay butonu
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  confirmButtonText: { color: Colors.background, fontSize: 18, fontWeight: 'bold' },
});

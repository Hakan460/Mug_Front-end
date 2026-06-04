import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';

// Sahte Uzman Personel Verileri
const MOCK_STAFF = [
  { id: 'staff_1', name: 'Emirhan Kılıç', title: 'Master Barber', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'staff_2', name: 'Hakan Yılmaz', title: 'Saç Tasarım', avatar: 'https://randomuser.me/api/portraits/men/43.jpg' },
  { id: 'staff_3', name: 'Fark Etmez', title: 'En Uygun Uzman', avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
];

export default function BookingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const service = route.params?.selectedService;
  const businessName = route.params?.businessName || 'Salon VIP';

  const [selectedStaff, setSelectedStaff] = useState(''); // Seçilen Personel State'i
  const [selectedDate, setSelectedDate] = useState('Bugün');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const dates = ['Bugün', 'Yarın', '12 Mayıs', '13 Mayıs', '14 Mayıs'];
  const times = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

  useEffect(() => {
    if (isFocused) {
      fetch('http://10.0.2.2:3000/appointments')
        .then(res => res.json())
        .then(data => setBookedAppointments(data))
        .catch(err => console.error("Randevular çekilemedi:", err));
    }
  }, [isFocused]);

  const takenTimesForSelectedDate = bookedAppointments
    .filter((app: any) => app.bookingDate === selectedDate)
    .map((app: any) => app.bookingTime);

  useEffect(() => {
    if (takenTimesForSelectedDate.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate, bookedAppointments]);

  const handleBooking = () => {
    if (!selectedStaff) {
      Alert.alert("Eksik Seçim", "Lütfen hizmet almak istediğiniz personeli seçin.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Eksik Seçim", "Lütfen randevu için uygun bir saat seçin.");
      return;
    }

    // Backend'e gönderirken artık staffId bilgisini de pakete ekliyoruz!
    fetch('http://10.0.2.2:3000/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: service.id,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        staffId: selectedStaff // backend hazır olduğunda burayı dinleyecek
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
         Alert.alert("Dolu!", data.message || "Bu saat az önce başkası tarafından alındı.");
         return;
      }
      const staffName = MOCK_STAFF.find(s => s.id === selectedStaff)?.name;
      Alert.alert(
        "Randevu Onaylandı! 🎉",
        `${businessName} - ${staffName} ile ${service.name} için randevunuz oluşturuldu.`,
        [{ text: "Randevularıma Git", onPress: () => navigation.navigate('MyAppointments') }]
      );
    })
    .catch(error => console.error("Hata:", error));
  };

  if (!service) {
    return (
      <View style={styles.centered}><Text style={{ color: '#fff' }}>Lütfen önce bir hizmet seçin.</Text></View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Üst Bilgi Kartı */}
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceTitle}>{service.name}</Text>
        <Text style={styles.serviceDesc}>{service.description}</Text>
        <View style={styles.serviceInfoRow}>
          <View style={styles.infoChip}>
            <Ionicons name="time-outline" size={16} color="#D4AF37" />
            <Text style={styles.infoText}>{service.duration} Dk.</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="cash-outline" size={16} color="#D4AF37" />
            <Text style={styles.infoText}>{service.price} TL</Text>
          </View>
        </View>
      </View>

      {/* YENİ MODÜL: Uzman Personel Seçimi */}
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
          >
            <Image source={{ uri: staff.avatar }} style={styles.staffAvatar} />
            <Text style={[styles.staffName, selectedStaff === staff.id && styles.selectedStaffText]}>{staff.name}</Text>
            <Text style={styles.staffTitle}>{staff.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tarih Seçimi (Sadece Personel Seçildiyse Aktif Olur) */}
      <Text style={[styles.sectionTitle, !selectedStaff && { opacity: 0.3 }]}>Tarih Seçin</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.horizontalScroll, !selectedStaff && { opacity: 0.3 }]} pointerEvents={selectedStaff ? 'auto' : 'none'}>
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dateChip, selectedDate === date && styles.selectedDateChip]}
            onPress={() => {
              setSelectedDate(date);
              setSelectedTime('');
            }}
          >
            <Text style={[styles.dateText, selectedDate === date && styles.selectedDateText]}>{date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Saat Seçimi (Sadece Personel Seçildiyse Aktif Olur) */}
      <Text style={[styles.sectionTitle, !selectedStaff && { opacity: 0.3 }]}>Saat Seçin</Text>
      <View style={[styles.timeGrid, !selectedStaff && { opacity: 0.3 }]} pointerEvents={selectedStaff ? 'auto' : 'none'}>
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
                isBooked && styles.disabledTimeChip
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[
                styles.timeText,
                isSelected && styles.selectedTimeText,
                isBooked && styles.disabledTimeText
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Onay Butonu */}
      <TouchableOpacity
        style={[styles.confirmButton, (!selectedTime || !selectedStaff) && { opacity: 0.4 }]}
        onPress={handleBooking}
        disabled={!selectedTime || !selectedStaff}
      >
        <Text style={styles.confirmButtonText}>Randevuyu Onayla</Text>
        <Ionicons name="checkmark-circle" size={20} color="#121212" style={{marginLeft: 8}} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  serviceHeader: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  serviceTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
  serviceDesc: { fontSize: 14, color: '#AAAAAA', marginBottom: 15, lineHeight: 20 },
  serviceInfoRow: { flexDirection: 'row', gap: 15 },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  infoText: { color: '#D4AF37', marginLeft: 5, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },

  // Personel Seçim Stilleri
  staffScroll: { marginBottom: 25, flexGrow: 0 },
  staffCard: { width: 120, padding: 15, backgroundColor: '#1A1A1A', borderRadius: 15, alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#333' },
  selectedStaffCard: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  staffAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, borderWidth: 1, borderColor: '#444' },
  staffName: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  selectedStaffText: { color: '#D4AF37' },
  staffTitle: { color: '#777', fontSize: 12, marginTop: 2 },

  horizontalScroll: { marginBottom: 25, flexGrow: 0 },
  dateChip: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#1A1A1A', borderRadius: 12, marginRight: 15, borderWidth: 1, borderColor: '#333' },
  selectedDateChip: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  dateText: { color: '#AAAAAA', fontSize: 16, fontWeight: '600' },
  selectedDateText: { color: '#121212', fontWeight: 'bold' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  timeChip: { width: '30%', paddingVertical: 12, backgroundColor: '#1A1A1A', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  selectedTimeChip: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  timeText: { color: '#AAAAAA', fontSize: 16, fontWeight: '600' },
  selectedTimeText: { color: '#121212', fontWeight: 'bold' },
  disabledTimeChip: { backgroundColor: '#1c1c1c', borderColor: '#222', opacity: 0.4 },
  disabledTimeText: { color: '#555555', textDecorationLine: 'line-through' },
  confirmButton: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingVertical: 16, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  confirmButtonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' }
});
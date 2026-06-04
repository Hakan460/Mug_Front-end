import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, ImageBackground, StatusBar, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';

// Sahte Yorum Verileri (Marketplace Hissiyatı İçin)
const MOCK_REVIEWS = [
  { id: '1', user: 'Ahmet Y.', rating: 5, comment: 'Emirhan Usta saç kesiminde bir numara. Diyarbakır’ın en iyisi!', date: '2 gün önce' },
  { id: '2', user: 'Mehmet T.', rating: 4, comment: 'Mekan çok lüks, ikramlar harika. Sadece biraz sıra bekledim.', date: '1 hafta önce' },
];

export default function HomeScreen() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'REVIEWS'>('SERVICES'); // Hizmetler mi Yorumlar mı?

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // BusinessesScreen'den gelen dükkan bilgilerini yakalıyoruz
  const businessName = route.params?.businessName || 'Seçilen VIP Salon';

  useEffect(() => {
    fetch('http://10.0.2.2:3000/services')
      .then((response) => response.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Hatası:", error);
        setLoading(false);
      });
  }, []);

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

        {/* Dinamik Dükkan Başlığı & Puanı */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{businessName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#D4AF37" />
            <Text style={styles.ratingText}>4.9 (142 Değerlendirme)</Text>
          </View>
        </View>

        {/* Premium Segment Kontrolü (Hizmetler / Yorumlar Geçişi) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'SERVICES' && styles.activeTabButton]}
            onPress={() => setActiveTab('SERVICES')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'SERVICES' && styles.activeTabButtonText]}>Hizmetler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'REVIEWS' && styles.activeTabButton]}
            onPress={() => setActiveTab('REVIEWS')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'REVIEWS' && styles.activeTabButtonText]}>Yorumlar</Text>
          </TouchableOpacity>
        </View>

        {/* İÇERİK ALANI */}
        {activeTab === 'SERVICES' ? (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('BookingScreen', { selectedService: item, businessName })}
              >
                <BlurView intensity={60} tint="dark" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
                  </View>

                  {item.description && <Text style={styles.desc}>{item.description}</Text>}

                  <View style={styles.cardFooter}>
                    <View style={styles.badge}>
                      <Ionicons name="time-outline" size={16} color="#FFFFFF" style={{marginRight: 4}} />
                      <Text style={styles.badgeText}>{item.duration} Dk.</Text>
                    </View>
                    <Text style={styles.price}>{item.price} TL</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}
          />
        ) : (
          /* YORUMLAR LİSTESİ */
          <FlatList
            data={MOCK_REVIEWS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <BlurView intensity={40} tint="dark" style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{item.user}</Text>
                  <Text style={styles.reviewDate}>{item.date}</Text>
                </View>
                <View style={styles.starsRow}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#D4AF37" />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
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
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: { paddingTop: 30, paddingHorizontal: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#D4AF37', letterSpacing: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { color: '#E0E0E0', marginLeft: 6, fontSize: 14, fontWeight: '500' },

  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#333' },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabButton: { backgroundColor: '#D4AF37' },
  tabButtonText: { color: '#AAAAAA', fontWeight: 'bold', fontSize: 15 },
  activeTabButtonText: { color: '#121212' },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { overflow: 'hidden', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  desc: { color: '#CCCCCC', marginVertical: 10, fontSize: 15, lineHeight: 22 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  price: { fontSize: 22, color: '#D4AF37', fontWeight: '800' },

  reviewCard: { padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  reviewDate: { color: '#777', fontSize: 13 },
  starsRow: { flexDirection: 'row', marginVertical: 6 },
  reviewComment: { color: '#DDD', fontSize: 14, lineHeight: 20 }
});
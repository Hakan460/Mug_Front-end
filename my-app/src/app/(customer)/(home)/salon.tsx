/**
 * Salon Detay / Hizmetler Ekranı
 *
 * Eski HomeScreen.tsx'in expo-router uyumlu versiyonu.
 * Seçilen salonun hizmetlerini ve yorumlarını gösterir.
 *
 * Değişiklikler:
 * - useRoute → useLocalSearchParams (expo-router)
 * - navigation.navigate → router.push
 * - BlurView → View + glassBackground
 * - API çağrısı → api.ts servisinden
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getServices, Service } from '@/services/api';

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';

// Sahte yorum verileri — backend hazır olunca API'den gelecek
const MOCK_REVIEWS = [
  {
    id: '1',
    user: 'Ahmet Y.',
    rating: 5,
    comment:
      'Emirhan Usta saç kesiminde bir numara. Diyarbakır\'ın en iyisi!',
    date: '2 gün önce',
  },
  {
    id: '2',
    user: 'Mehmet T.',
    rating: 4,
    comment:
      'Mekan çok lüks, ikramlar harika. Sadece biraz sıra bekledim.',
    date: '1 hafta önce',
  },
];

export default function SalonScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'REVIEWS'>('SERVICES');

  const router = useRouter();
  const { businessName } = useLocalSearchParams<{ businessName: string }>();

  const salonName = businessName || 'Seçilen VIP Salon';

  useEffect(() => {
    getServices()
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API Hatası:', error);
        setLoading(false);
      });
  }, []);

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
        {/* ───── Geri Butonu + Başlık ───── */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{salonName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={Colors.primary} />
            <Text style={styles.ratingText}>4.9 (142 Değerlendirme)</Text>
          </View>
        </View>

        {/* ───── Hizmetler / Yorumlar Sekmesi ───── */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'SERVICES' && styles.activeTabButton]}
            onPress={() => setActiveTab('SERVICES')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'SERVICES' && styles.activeTabButtonText]}>
              Hizmetler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'REVIEWS' && styles.activeTabButton]}
            onPress={() => setActiveTab('REVIEWS')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'REVIEWS' && styles.activeTabButtonText]}>
              Yorumlar
            </Text>
          </TouchableOpacity>
        </View>

        {/* ───── İçerik ───── */}
        {activeTab === 'SERVICES' ? (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/(home)/booking' as any,
                    params: {
                      serviceId: item.id.toString(),
                      serviceName: item.name,
                      serviceDescription: item.description,
                      servicePrice: item.price.toString(),
                      serviceDuration: item.duration.toString(),
                      businessName: salonName,
                    },
                  })
                }
              >
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                  </View>

                  {item.description && (
                    <Text style={styles.desc}>{item.description}</Text>
                  )}

                  <View style={styles.cardFooter}>
                    <View style={styles.badge}>
                      <Ionicons name="time-outline" size={16} color={Colors.text} style={{ marginRight: 4 }} />
                      <Text style={styles.badgeText}>{item.duration} Dk.</Text>
                    </View>
                    <Text style={styles.price}>{item.price} TL</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={MOCK_REVIEWS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{item.user}</Text>
                  <Text style={styles.reviewDate}>{item.date}</Text>
                </View>
                <View style={styles.starsRow}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color={Colors.primary} />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
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
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { color: '#E0E0E0', marginLeft: 6, fontSize: 14, fontWeight: '500' },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabButton: { backgroundColor: Colors.primary },
  tabButtonText: { color: '#AAAAAA', fontWeight: 'bold', fontSize: 15 },
  activeTabButtonText: { color: Colors.background },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    overflow: 'hidden',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: Colors.glassBackground,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  desc: { color: '#CCCCCC', marginVertical: 10, fontSize: 15, lineHeight: 22 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  price: { fontSize: 22, color: Colors.primary, fontWeight: '800' },

  reviewCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: Colors.glassBackground,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUser: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
  reviewDate: { color: '#777', fontSize: 13 },
  starsRow: { flexDirection: 'row', marginVertical: 6 },
  reviewComment: { color: '#DDD', fontSize: 14, lineHeight: 20 },
});

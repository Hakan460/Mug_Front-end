import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getServices, Service, getReviews, addReview, Review } from '@/services/api';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';

export default function SalonScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'REVIEWS'>('SERVICES');

  // Yorum Ekleme Form State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const router = useRouter();
  const { businessName, businessId } = useLocalSearchParams<{ businessName: string, businessId: string }>();
  const salonName = businessName || 'Seçilen VIP Salon';
  const bId = businessId ? Number(businessId) : undefined;

  useEffect(() => {
    if (!bId) return;
    setLoading(true);
    
    Promise.all([
      getServices(bId),
      getReviews(bId)
    ])
    .then(([servicesData, reviewsData]) => {
      setServices(servicesData);
      setReviews(reviewsData);
    })
    .catch((error) => console.error('Veri yükleme hatası:', error))
    .finally(() => setLoading(false));
  }, [bId]);

  const handleSubmitReview = async () => {
    if (!bId) return;
    setSubmittingReview(true);
    try {
      const newReview = await addReview({
        businessId: bId,
        rating,
        comment
      });
      // Yeni yorumu listenin başına ekle
      setReviews([newReview, ...reviews]);
      setReviewModalVisible(false);
      setComment('');
      setRating(5);
      Alert.alert('Başarılı', 'Yorumunuz kaydedildi. Teşekkürler!');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Yorum gönderilemedi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
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
        {/* ───── Geri Butonu + Başlık ───── */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{salonName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={Colors.primary} />
            <Text style={styles.ratingText}>{calculateAverageRating()} ({reviews.length} Değerlendirme)</Text>
          </View>
        </View>

        {/* ───── Hizmetler / Yorumlar Sekmesi ───── */}
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

        {/* ───── İçerik ───── */}
        {activeTab === 'SERVICES' ? (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Bu işletme henüz hizmet eklememiş.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/(home)/booking' as any,
                    params: {
                      serviceId: item.id.toString(),
                      serviceName: item.name,
                      serviceDescription: item.description || '',
                      servicePrice: item.price.toString(),
                      serviceDuration: item.duration.toString(),
                      businessName: salonName,
                      businessId: businessId || '',
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
          <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
              <TouchableOpacity style={styles.addReviewBtn} onPress={() => setReviewModalVisible(true)}>
                <Ionicons name="pencil-outline" size={20} color={Colors.background} style={{ marginRight: 8 }} />
                <Text style={styles.addReviewBtnText}>Yorum Yap</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Henüz hiç yorum yapılmamış. İlk yorumu siz yapın!</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>{item.user?.name || 'Müşteri'}</Text>
                    <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
                  </View>
                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons key={i} name={i < item.rating ? "star" : "star-outline"} size={14} color={Colors.primary} />
                    ))}
                  </View>
                  {item.comment ? <Text style={styles.reviewComment}>{item.comment}</Text> : null}
                </View>
              )}
            />
          </View>
        )}

        {/* ───── Yorum Ekleme Modalı ───── */}
        <Modal visible={reviewModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>İşletmeyi Değerlendir</Text>
              
              <View style={styles.starSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons name={star <= rating ? "star" : "star-outline"} size={36} color={Colors.primary} style={{ marginHorizontal: 5 }} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Deneyiminizi paylaşın... (İsteğe bağlı)"
                placeholderTextColor="#777"
                multiline
                value={comment}
                onChangeText={setComment}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setReviewModalVisible(false)} disabled={submittingReview}>
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview ? (
                    <ActivityIndicator color={Colors.background} />
                  ) : (
                    <Text style={styles.modalSubmitText}>Gönder</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.glassBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { color: '#E0E0E0', marginLeft: 6, fontSize: 14, fontWeight: '500' },

  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, backgroundColor: Colors.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#333' },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabButton: { backgroundColor: Colors.primary },
  tabButtonText: { color: '#AAAAAA', fontWeight: 'bold', fontSize: 15 },
  activeTabButtonText: { color: Colors.background },

  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  emptyText: { color: '#AAA', textAlign: 'center', marginTop: 30, fontSize: 16 },

  card: { padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', backgroundColor: Colors.glassBackground },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  desc: { color: '#CCCCCC', marginVertical: 10, fontSize: 15, lineHeight: 22 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  price: { fontSize: 22, color: Colors.primary, fontWeight: '800' },

  addReviewBtn: { flexDirection: 'row', backgroundColor: Colors.primary, padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addReviewBtnText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },

  reviewCard: { padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: Colors.glassBackground },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
  reviewDate: { color: '#777', fontSize: 13 },
  starsRow: { flexDirection: 'row', marginVertical: 6 },
  reviewComment: { color: '#DDD', fontSize: 14, lineHeight: 20, marginTop: 4 },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.card, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  starSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 15, color: Colors.text, fontSize: 15, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 15 },
  modalCancelBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#333', alignItems: 'center' },
  modalCancelText: { color: Colors.text, fontSize: 16, fontWeight: 'bold' },
  modalSubmitBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  modalSubmitText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },
});

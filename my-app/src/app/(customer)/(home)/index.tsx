/**
 * İşletmeler Ekranı — Salon listesi
 *
 * Eski BusinessesScreen.tsx'in expo-router uyumlu versiyonu.
 *
 * Değişiklikler:
 * - navigation.navigate('HomeScreen') → router.push({ pathname: '/salon', params })
 * - BlurView → View + glassBackground rengi
 * - businessName parametresi salon'a gönderiliyor (eski kodda eksikti)
 * - Kahramanmaraş (Onikişubat, Dulkadiroğlu, Tekerek, Binevler, Doğukent) işletmeleri eklendi
 * - İşletme sahiplerinin telefon numaraları eklendi
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getBusinesses, Business } from '@/services/api';

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';

export default function BusinessesScreen() {
  const router = useRouter();
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      getBusinesses()
        .then((data) => {
          setBusinesses(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, [])
  );

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        {/* ───── Başlık ───── */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Seçkin İşletmeler</Text>
          <Text style={styles.subtitle}>
            Kahramanmaraş'ta premium hizmet alacağınız salonu seçin
          </Text>
        </View>

        {/* ───── Salon Listesi ───── */}
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Salon Görseli */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/(home)/salon' as any,
                    params: { businessId: item.id, businessName: item.name },
                  })
                }
              >
                <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/800x400' }} style={styles.salonImage} />
              </TouchableOpacity>

              <View style={styles.cardContent}>
                {/* İsim + Puan */}
                <View style={styles.cardHeader}>
                  <TouchableOpacity
                    style={styles.nameContainer}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname: '/(customer)/(home)/salon' as any,
                        params: { businessId: item.id, businessName: item.name },
                      })
                    }
                  >
                    <Text style={styles.name}>{item.name}</Text>
                  </TouchableOpacity>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color={Colors.background} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                {/* Konum */}
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={Colors.primary}
                  />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>

                {/* Ayırıcı */}
                <View style={styles.divider} />

                {/* Telefon + Ara Butonu */}
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={16} color={Colors.primary} />
                  <Text style={styles.phoneText}>{item.phone || 'Telefon Yok'}</Text>
                  {item.phone && (
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => handleCall(item.phone!)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call" size={14} color={Colors.background} />
                      <Text style={styles.callButtonText}>Ara</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  headerContainer: {
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#E0E0E0',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
  },
  salonImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: Colors.background,
    fontWeight: 'bold',
    marginLeft: 3,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationText: {
    color: '#AAAAAA',
    marginLeft: 4,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    color: '#CCCCCC',
    marginLeft: 6,
    fontSize: 14,
    flex: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  callButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 13,
  },
});

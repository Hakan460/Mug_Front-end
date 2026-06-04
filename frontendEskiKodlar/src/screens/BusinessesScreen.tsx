import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, StatusBar, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop';

const MOCK_SALONS = [
  { id: '1', name: 'Makas VIP Salon', location: 'Kayapınar, Diyarbakır', rating: 4.9, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop' },
  { id: '2', name: 'Gold Gentleman', location: 'Yenişehir, Diyarbakır', rating: 4.7, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop' },
];

export default function BusinessesScreen() {
  const navigation = useNavigation<any>();

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Seçkin İşletmeler</Text>
          <Text style={styles.subtitle}>Premium hizmet alacağınız salonu seçin</Text>
        </View>

        <FlatList
          data={MOCK_SALONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HomeScreen')}
            >
              <BlurView intensity={50} tint="dark" style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.salonImage} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={14} color="#121212" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color="#D4AF37" />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  headerContainer: { paddingTop: 65, paddingHorizontal: 20, paddingBottom: 15 },
  title: { fontSize: 32, fontWeight: '900', color: '#D4AF37', letterSpacing: 1 },
  subtitle: { fontSize: 15, color: '#E0E0E0', marginTop: 4 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { overflow: 'hidden', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', backgroundColor: '#1A1A1A' },
  salonImage: { width: '100%', height: 150, resizeMode: 'cover' },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { color: '#121212', fontWeight: 'bold', marginLeft: 3, fontSize: 13 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#AAAAAA', marginLeft: 4, fontSize: 14 }
});
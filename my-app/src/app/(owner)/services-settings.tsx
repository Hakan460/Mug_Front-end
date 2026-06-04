import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getMeApi, getBusinesses, getServices, createService, deleteService, Service } from '@/services/api';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

export default function ServicesSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await getMeApi();
      const allBusinesses = await getBusinesses();
      const mine = allBusinesses.find(b => b.ownerId === me.id);
      
      if (mine) {
        setBusinessId(mine.id);
        const myServices = await getServices(mine.id);
        setServices(myServices);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!businessId) {
      Alert.alert('Uyarı', 'Önce İşletmemi Yönet sekmesinden işletmenizi oluşturmalısınız.');
      return;
    }
    if (!name.trim() || !price.trim() || !duration.trim()) {
      Alert.alert('Hata', 'Hizmet adı, fiyat ve süre zorunludur.');
      return;
    }

    setSaving(true);
    try {
      const newService = await createService({
        businessId,
        name,
        description,
        price: Number(price),
        duration: Number(duration),
      });
      setServices([...services, newService]);
      setName('');
      setDescription('');
      setPrice('');
      setDuration('');
      Alert.alert('Başarılı', 'Hizmet eklendi.');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = (id: number) => {
    Alert.alert('Emin misiniz?', 'Hizmeti silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteService(id);
            setServices(services.filter(s => s.id !== id));
          } catch (e: any) {
            Alert.alert('Hata', 'Hizmet silinemedi.');
          }
        }
      }
    ]);
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
        {/* Başlık ve Geri Butonu */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push('/(owner)/profile' as any)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Hizmetlerimi Yönet</Text>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {!businessId ? (
             <Text style={styles.warningText}>
               Hizmet ekleyebilmek için önce "İşletmemi Yönet" bölümünden işletmenizi oluşturmalısınız.
             </Text>
          ) : (
            <>
              <View style={styles.addForm}>
                <Text style={styles.sectionTitle}>Yeni Hizmet Ekle</Text>
                
                <TextInput style={styles.input} placeholder="Hizmet Adı (Örn: Saç Kesimi)" placeholderTextColor="#777" value={name} onChangeText={setName} />
                <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Açıklama (İsteğe bağlı)" placeholderTextColor="#777" value={description} onChangeText={setDescription} multiline />
                
                <View style={styles.row}>
                  <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="Fiyat (TL)" placeholderTextColor="#777" keyboardType="numeric" value={price} onChangeText={setPrice} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Süre (Dakika)" placeholderTextColor="#777" keyboardType="numeric" value={duration} onChangeText={setDuration} />
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={handleAddService} disabled={saving}>
                  {saving ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.addBtnText}>Hizmeti Kaydet</Text>}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Mevcut Hizmetler ({services.length})</Text>
              {services.map(service => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description ? <Text style={styles.serviceDesc}>{service.description}</Text> : null}
                    <View style={styles.serviceStats}>
                      <Text style={styles.statItem}>⏳ {service.duration} Dk.</Text>
                      <Text style={styles.statItem}>💰 {service.price} TL</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteService(service.id)}>
                    <Ionicons name="trash" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  
  container: { padding: 20 },
  warningText: { color: Colors.danger, fontSize: 16, textAlign: 'center', marginTop: 40, lineHeight: 24 },
  
  addForm: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 10,
  },
  row: { flexDirection: 'row' },
  addBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  addBtnText: { color: Colors.background, fontWeight: 'bold', fontSize: 16 },

  serviceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  serviceName: { color: Colors.text, fontSize: 16, fontWeight: 'bold' },
  serviceDesc: { color: '#AAA', fontSize: 13, marginVertical: 4 },
  serviceStats: { flexDirection: 'row', marginTop: 5, gap: 10 },
  statItem: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  deleteBtn: { padding: 10, backgroundColor: 'rgba(231, 76, 60, 0.15)', borderRadius: 10, marginLeft: 10 },
});

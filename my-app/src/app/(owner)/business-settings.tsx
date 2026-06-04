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
import { getMeApi, getBusinesses, createBusiness, updateBusiness, deleteBusiness, Business } from '@/services/api';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

export default function BusinessSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myBusiness, setMyBusiness] = useState<Business | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    loadMyBusiness();
  }, []);

  const loadMyBusiness = async () => {
    try {
      const me = await getMeApi();
      const allBusinesses = await getBusinesses();
      const mine = allBusinesses.find(b => b.ownerId === me.id);
      
      if (mine) {
        setMyBusiness(mine);
        setName(mine.name);
        setLocation(mine.location);
        setPhone(mine.phone || '');
        setImageUrl(mine.imageUrl || '');
      }
    } catch (error) {
      console.error('İşletme yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !location.trim()) {
      Alert.alert('Hata', 'İşletme adı ve konumu zorunludur.');
      return;
    }

    setSaving(true);
    try {
      const data = { name, location, phone, imageUrl };
      if (myBusiness) {
        // Update
        const updated = await updateBusiness(myBusiness.id, data);
        setMyBusiness(updated);
        Alert.alert('Başarılı', 'İşletme bilgileriniz güncellendi.');
      } else {
        // Create
        const created = await createBusiness(data);
        setMyBusiness(created);
        Alert.alert('Başarılı', 'İşletmeniz başarıyla oluşturuldu.');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!myBusiness) return;
    Alert.alert('İşletmeyi Sil', 'İşletmenizi ve ona bağlı tüm hizmet, çalışan ve randevuları kalıcı olarak silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive', 
        onPress: async () => {
          setLoading(true);
          try {
            await deleteBusiness(myBusiness.id);
            Alert.alert('Başarılı', 'İşletmeniz silindi.');
            setMyBusiness(null);
            setName('');
            setLocation('');
            setPhone('');
            setImageUrl('');
          } catch (e: any) {
            Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
          } finally {
            setLoading(false);
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
        {/* ───── Geri Butonu + Başlık ───── */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push('/(owner)/profile' as any)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>İşletmemi Yönet</Text>
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            {myBusiness ? 'İşletme detaylarınızı güncelleyin' : 'Sistemde henüz bir işletmeniz yok. Yeni işletme profili oluşturun.'}
          </Text>

          {/* İşletme Adı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Adı</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="storefront-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Örn: Royal Erkek Kuaförü"
                placeholderTextColor="#777"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Konum */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konum / Adres</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Örn: Onikişubat, Kahramanmaraş"
                placeholderTextColor="#777"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Telefon */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İletişim Numarası</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Örn: +90 5XX XXX XX XX"
                placeholderTextColor="#777"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Görsel URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Görseli (URL)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="image-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#777"
                autoCapitalize="none"
                value={imageUrl}
                onChangeText={setImageUrl}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.saveBtnText}>{myBusiness ? 'Güncelle' : 'İşletmeyi Oluştur'}</Text>
            )}
          </TouchableOpacity>

          {myBusiness && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
              <Text style={styles.deleteBtnText}>İşletmeyi Sil</Text>
            </TouchableOpacity>
          )}
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
  
  formContainer: { padding: 20 },
  subtitle: { color: '#CCC', fontSize: 15, marginBottom: 30, lineHeight: 22 },

  inputGroup: { marginBottom: 20 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 14 },

  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },

  deleteBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  deleteBtnText: { color: Colors.danger, fontSize: 16, fontWeight: 'bold' },
});

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
import { getMeApi, getBusinesses, getStaff, createStaff, deleteStaff } from '@/services/api';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

export default function StaffSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');

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
        const myStaff = await getStaff(mine.id);
        setStaffList(myStaff);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!businessId) {
      Alert.alert('Uyarı', 'Önce İşletmemi Yönet sekmesinden işletmenizi oluşturmalısınız.');
      return;
    }
    if (!name.trim() || !title.trim()) {
      Alert.alert('Hata', 'Uzman adı ve uzmanlık alanı zorunludur.');
      return;
    }

    setSaving(true);
    try {
      const newStaff = await createStaff({
        businessId,
        name,
        title,
      });
      setStaffList([...staffList, newStaff]);
      setName('');
      setTitle('');
      Alert.alert('Başarılı', 'Uzman eklendi.');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = (id: number) => {
    Alert.alert('Emin misiniz?', 'Bu uzmanı silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteStaff(id);
            setStaffList(staffList.filter(s => s.id !== id));
          } catch (e: any) {
            Alert.alert('Hata', 'Uzman silinemedi.');
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
          <Text style={styles.title}>Uzmanlarımı Yönet</Text>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {!businessId ? (
             <Text style={styles.warningText}>
               Uzman ekleyebilmek için önce "İşletmemi Yönet" bölümünden işletmenizi oluşturmalısınız.
             </Text>
          ) : (
            <>
              <View style={styles.addForm}>
                <Text style={styles.sectionTitle}>Yeni Uzman Ekle</Text>
                
                <TextInput style={styles.input} placeholder="Ad Soyad (Örn: Ahmet Yılmaz)" placeholderTextColor="#777" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Uzmanlık Alanı (Örn: Saç Kesim Uzmanı)" placeholderTextColor="#777" value={title} onChangeText={setTitle} />
                
                <TouchableOpacity style={styles.addBtn} onPress={handleAddStaff} disabled={saving}>
                  {saving ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.addBtnText}>Uzmanı Kaydet</Text>}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Mevcut Uzmanlar ({staffList.length})</Text>
              {staffList.map(staff => (
                <View key={staff.id} style={styles.staffCard}>
                  <View style={styles.staffAvatar}>
                     <Ionicons name="person" size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.staffName}>{staff.name}</Text>
                    <Text style={styles.staffRole}>{staff.title}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteStaff(staff.id)}>
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
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.glassBackground, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  
  container: { padding: 20 },
  warningText: { color: Colors.danger, fontSize: 16, textAlign: 'center', marginTop: 40, lineHeight: 24 },
  
  addForm: { backgroundColor: Colors.card, padding: 15, borderRadius: 15, marginBottom: 30, borderWidth: 1, borderColor: '#333' },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, color: Colors.text, fontSize: 15, marginBottom: 10 },
  addBtn: { backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  addBtnText: { color: Colors.background, fontWeight: 'bold', fontSize: 16 },

  staffCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  staffAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(212, 175, 55, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  staffName: { color: Colors.text, fontSize: 16, fontWeight: 'bold' },
  staffRole: { color: Colors.primary, fontSize: 14, marginVertical: 4 },
  staffEmail: { color: '#AAA', fontSize: 12 },
  deleteBtn: { padding: 10, backgroundColor: 'rgba(231, 76, 60, 0.15)', borderRadius: 10, marginLeft: 10 },
});

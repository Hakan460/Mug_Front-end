/**
 * Profil Ekranı (Müşteri)
 *
 * Eski ProfileScreen.tsx'in expo-router uyumlu versiyonu.
 * Props (userRole, onLogout) → useAuth() context hook'una geçti.
 *
 * Değişiklikler:
 * - Ad/soyad ve profil fotoğrafı düzenleme modalı eklendi
 * - AuthContext'ten userName ve avatarUri kullanılıyor
 * - Expo Image Picker ile fotoğraf seçimi
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=D4AF37&color=121212&size=200&bold=true&name=';

export default function ProfileScreen() {
  const { userRole, logout, userName, avatarUri, updateProfile } = useAuth();

  // Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editAvatar, setEditAvatar] = useState<string | null>(avatarUri);

  const displayName = userName.trim() !== '' ? userName : 'Kullanıcı Adı';
  const displayAvatar =
    avatarUri ||
    `${DEFAULT_AVATAR}${encodeURIComponent(displayName === 'Kullanıcı Adı' ? 'K' : displayName)}`;

  // Profil fotoğrafı seç
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  // Profili kaydet
  const handleSave = async () => {
    if (editName.trim() === '') {
      Alert.alert('Uyarı', 'Ad - soyad boş olamaz.');
      return;
    }
    try {
      await updateProfile(editName.trim(), editAvatar);
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Profil güncellenemedi.');
    }
  };

  // Modalı aç
  const openEditModal = () => {
    setEditName(userName);
    setEditAvatar(avatarUri);
    setEditModalVisible(true);
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        {/* ───── Profil Kartı ───── */}
        <View style={styles.profileCard}>
          {/* Avatar + Düzenle ikonu */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarBadge} onPress={openEditModal}>
              <Ionicons name="camera" size={16} color={Colors.background} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{displayName}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {userRole === 'CUSTOMER' ? 'Seçkin Müşteri' : 'Salon Sahibi / Yönetici'}
            </Text>
          </View>
        </View>

        {/* ───── Menü ───── */}
        <View style={styles.menuContainer}>
          {/* Profili Düzenle */}
          <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
            <Ionicons name="person-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Profili Düzenle</Text>
            <Ionicons name="chevron-forward" size={18} color="#555" style={styles.menuChevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Hesap Ayarları</Text>
            <Ionicons name="chevron-forward" size={18} color="#555" style={styles.menuChevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuText}>Güvenlik ve İzinler</Text>
            <Ionicons name="chevron-forward" size={18} color="#555" style={styles.menuChevron} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
            <Text style={[styles.menuText, { color: Colors.danger }]}>
              Sistemden Güvenli Çıkış
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ───── Profil Düzenleme Modalı ───── */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            {/* Modal Başlık */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Fotoğraf Seçimi */}
              <View style={styles.avatarPickerContainer}>
                <Image
                  source={{
                    uri:
                      editAvatar ||
                      `${DEFAULT_AVATAR}${encodeURIComponent(
                        editName.trim() !== '' ? editName.trim() : 'K'
                      )}`,
                  }}
                  style={styles.avatarPreview}
                />
                <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                  <Ionicons name="camera-outline" size={18} color={Colors.primary} />
                  <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
                </TouchableOpacity>
                {editAvatar && (
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => setEditAvatar(null)}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                    <Text style={styles.removePhotoText}>Fotoğrafı Kaldır</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Ad - Soyad Alanı */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ad - Soyad</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Adınızı ve soyadınızı girin"
                    placeholderTextColor="#666"
                    value={editName}
                    onChangeText={setEditName}
                    autoCapitalize="words"
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Kaydet Butonu */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.background} />
                <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 20,
    justifyContent: 'center',
  },

  // Profil Kartı
  profileCard: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  name: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  badgeText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },

  // Menü
  menuContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  logoutItem: { borderBottomWidth: 0 },
  menuText: { color: Colors.text, fontSize: 16, marginLeft: 12, fontWeight: '500', flex: 1 },
  menuChevron: { marginLeft: 'auto' },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Avatar Picker
  avatarPickerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 14,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 6,
    marginBottom: 8,
  },
  changePhotoText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  removePhotoText: {
    color: Colors.danger,
    fontSize: 13,
  },

  // Input
  inputContainer: { marginBottom: 24 },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 14,
  },

  // Kaydet Butonu
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    color: Colors.background,
    fontWeight: '800',
    fontSize: 16,
  },
});

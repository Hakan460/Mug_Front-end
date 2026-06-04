import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

interface AuthScreenProps {
  onLogin: (role: 'CUSTOMER' | 'OWNER') => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');

  const handleAuth = () => {
    onLogin(role);
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="cut" size={50} color="#D4AF37" />
            <Text style={styles.title}>Salon VIP</Text>
            <Text style={styles.subtitle}>Güzellik & Bakım Platformu</Text>
          </View>

          <BlurView intensity={70} tint="dark" style={styles.formContainer}>
            {/* Kayıt Ol modundaysa Rol Seçim Butonlarını Göster */}
            {!isLogin && (
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'CUSTOMER' && styles.roleBtnActive]}
                  onPress={() => setRole('CUSTOMER')}
                >
                  <Ionicons name="person" size={18} color={role === 'CUSTOMER' ? '#121212' : '#AAAAAA'} />
                  <Text style={[styles.roleText, role === 'CUSTOMER' && styles.roleTextActive]}>Müşteri Kaydı</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, role === 'OWNER' && styles.roleBtnActive]}
                  onPress={() => setRole('OWNER')}
                >
                  <Ionicons name="business" size={18} color={role === 'OWNER' ? '#121212' : '#AAAAAA'} />
                  <Text style={[styles.roleText, role === 'OWNER' && styles.roleTextActive]}>İşletme Sahibi</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Ionicons name="mail-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="E-posta Adresiniz" placeholderTextColor="#777" keyboardType="email-address" />
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Şifreniz" placeholderTextColor="#777" secureTextEntry />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAuth}>
              <Text style={styles.submitBtnText}>{isLogin ? "Giriş Yap" : "Kayıt Ol ve Başlat"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchBtnText}>
                {isLogin ? "Hesabın yok mu? Yeni Kayıt Oluştur" : "Zaten hesabın var mı? Giriş Yap"}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 35 },
  title: { fontSize: 36, fontWeight: '900', color: '#D4AF37', letterSpacing: 2, marginTop: 10 },
  subtitle: { fontSize: 16, color: '#E0E0E0', fontStyle: 'italic', marginTop: 5 },
  formContainer: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.25)' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#333', borderRadius: 10, marginHorizontal: 5 },
  roleBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  roleText: { marginLeft: 6, color: '#AAAAAA', fontWeight: 'bold', fontSize: 13 },
  roleTextActive: { color: '#121212' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', paddingVertical: 14, fontSize: 16 },
  submitBtn: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
  switchBtn: { marginTop: 20, alignItems: 'center' },
  switchBtnText: { color: '#AAAAAA', fontSize: 14, textDecorationLine: 'underline' }
});
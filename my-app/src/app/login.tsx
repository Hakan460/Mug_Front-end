/**
 * Login Ekranı — Giriş / Kayıt Sayfası
 *
 * Eski AuthScreen.tsx'in expo-router uyumlu versiyonu.
 *
 * Değişiklikler (eski koda göre):
 * - expo-blur → View + rgba arka plan (Android uyumlu)
 * - onLogin prop → useAuth().login (Context)
 * - ImageBackground korundu
 * - Tüm stiller ve tasarım korundu
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=2111&auto=format&fit=crop';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  
  const [email, setEmail] = useState('customer@mug.com');
  const [password, setPassword] = useState('customer123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre zorunludur.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        if (!name) {
          Alert.alert('Hata', 'Ad soyad zorunludur.');
          setLoading(false);
          return;
        }
        await register({ name, email, password, phone, role });
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE_URL }} style={styles.background}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* ───── Logo & Başlık ───── */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="cut" size={50} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Salon VIP</Text>
            <Text style={styles.subtitle}>Güzellik & Bakım Platformu</Text>
          </View>

          {/* ───── Form Alanı (Cam Efekti) ───── */}
          <View style={styles.formContainer}>
            {/* Kayıt Ol modundaysa Rol Seçimi */}
            {!isLogin && (
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === 'CUSTOMER' && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole('CUSTOMER')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="person"
                    size={18}
                    color={role === 'CUSTOMER' ? Colors.background : '#AAAAAA'}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === 'CUSTOMER' && styles.roleTextActive,
                    ]}
                  >
                    Müşteri Kaydı
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === 'OWNER' && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole('OWNER')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="business"
                    size={18}
                    color={role === 'OWNER' ? Colors.background : '#AAAAAA'}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === 'OWNER' && styles.roleTextActive,
                    ]}
                  >
                    İşletme Sahibi
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Kayıt için ekstra alanlar */}
            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Ionicons name="person-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor="#777"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Ionicons name="call-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Telefon Numaranız"
                    placeholderTextColor="#777"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </>
            )}

            {/* E-posta alanı */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#AAAAAA"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-posta Adresiniz"
                placeholderTextColor="#777"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Şifre alanı */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#AAAAAA"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Şifreniz"
                placeholderTextColor="#777"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Giriş / Kayıt butonu */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAuth}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isLogin ? 'Giriş Yap' : 'Kayıt Ol ve Başlat'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Geçiş linki */}
            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchBtnText}>
                {isLogin
                  ? 'Hesabın yok mu? Yeni Kayıt Oluştur'
                  : 'Zaten hesabın var mı? Giriş Yap'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    fontStyle: 'italic',
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  roleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    marginLeft: 6,
    color: '#AAAAAA',
    fontWeight: 'bold',
    fontSize: 13,
  },
  roleTextActive: {
    color: Colors.background,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 14,
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchBtnText: {
    color: '#AAAAAA',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

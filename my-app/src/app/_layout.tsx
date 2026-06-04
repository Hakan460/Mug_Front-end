/**
 * Root Layout — Uygulamanın kök düzeni.
 *
 * Bu dosya tüm sayfaları sarar ve şunları yapar:
 * 1. AuthProvider ile oturum yönetimini sağlar
 * 2. Giriş durumuna göre login veya ana ekrana yönlendirir
 * 3. Premium dark temayı uygular
 *
 * expo-router'da _layout.tsx dosyaları, o dizindeki
 * sayfaların nasıl render edileceğini belirler.
 */

import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';

/**
 * Auth yönlendirme mantığı.
 * Giriş yapılmamışsa → /login
 * Giriş yapılmışsa → role göre /(customer) veya /(owner)
 */
function AuthGate() {
  const { isLoggedIn, userRole } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Mevcut sayfanın grubunu kontrol et
    const inAuthScreen = segments[0] === 'login';
    const inCustomerGroup = segments[0] === '(customer)';
    const inOwnerGroup = segments[0] === '(owner)';

    if (!isLoggedIn) {
      // Giriş yapılmamış → login sayfasına yönlendir
      if (!inAuthScreen) {
        router.replace('/login' as any);
      }
    } else {
      // Giriş yapılmış → role göre yönlendir
      if (inAuthScreen) {
        if (userRole === 'OWNER') {
          router.replace('/(owner)/dashboard' as any);
        } else {
          router.replace('/(customer)/(home)' as any);
        }
      }
      // Yanlış gruba girdiyse düzelt
      if (userRole === 'OWNER' && inCustomerGroup) {
        router.replace('/(owner)/dashboard' as any);
      }
      if (userRole === 'CUSTOMER' && inOwnerGroup) {
        router.replace('/(customer)/(home)' as any);
      }
    }
  }, [isLoggedIn, userRole, segments]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Slot />
    </>
  );
}

/**
 * Ana Layout bileşeni.
 * AuthProvider tüm uygulamayı sarar.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

/**
 * Berber Randevu Uygulaması — Premium Dark Tema
 * Altın ve koyu tonlar ile lüks bir görünüm.
 */

import { Platform } from 'react-native';

export const Colors = {
  // Ana renk paleti
  primary: '#D4AF37',        // Altın — butonlar, vurgular, aktif sekmeler
  primaryLight: '#E8CC6E',   // Açık altın — hover, gradient
  primaryDark: '#B8942E',    // Koyu altın — pressed state

  // Arka plan tonları
  background: '#121212',     // Ana arka plan
  card: '#1A1A1A',           // Kart arka planları
  surface: '#1E1E1E',        // Yüzey elemanları
  surfaceLight: '#252525',   // Daha açık yüzey

  // Metin renkleri
  text: '#FFFFFF',           // Ana metin
  textSecondary: '#B0B0B0',  // İkincil metin
  textMuted: '#666666',      // Soluk metin

  // Kenarlık
  border: '#2A2A2A',         // Kenar çizgileri

  // Durum renkleri
  success: '#4CAF50',        // Başarılı
  danger: '#FF4444',         // Tehlike / iptal
  warning: '#FFA726',        // Uyarı
  info: '#29B6F6',           // Bilgi

  // Özel renkler
  overlay: 'rgba(0, 0, 0, 0.6)',       // Arka plan overlay
  glassBackground: 'rgba(26, 26, 26, 0.85)', // Cam efekti arka plan
  glassBorder: 'rgba(212, 175, 55, 0.15)',    // Cam efekti kenarlık
  star: '#FFD700',           // Yıldız derecelendirme
  notification: '#D4AF37',   // Bildirim
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

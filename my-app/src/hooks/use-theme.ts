/**
 * Tema hook'u — Premium dark tema renklerini döndürür.
 * Uygulama her zaman dark modda çalışır.
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  // Uygulama her zaman dark tema kullanır
  return Colors;
}

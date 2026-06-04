/**
 * Ana Sayfa Index — Login'e yönlendirme.
 *
 * expo-router'da index.tsx varsayılan sayfa olduğundan,
 * giriş kontrolü _layout.tsx'deki AuthGate tarafından yapılır.
 * Bu dosya sadece ilk yükleme için Redirect sağlar.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/login" />;
}

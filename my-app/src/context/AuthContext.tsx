/**
 * AuthContext — Oturum Yönetimi
 *
 * Kullanıcının giriş durumunu ve rolünü (CUSTOMER / OWNER) yönetir.
 * Şu an mock auth kullanılıyor — backend hazır olunca gerçek API'ye geçilecek.
 *
 * Kullanım:
 *   const { isLoggedIn, userRole, login, logout } = useAuth();
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// Kullanıcı rolleri
export type UserRole = 'CUSTOMER' | 'OWNER';

// Context tipi
interface AuthContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
}

// Varsayılan değerler
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userRole: 'CUSTOMER',
  login: () => {},
  logout: () => {},
});

/**
 * AuthProvider — Uygulamanın kök bileşenini sarar.
 * Root _layout.tsx içinde kullanılır.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('CUSTOMER');

  const login = useCallback((role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole('CUSTOMER');
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — Auth context'e erişim hook'u.
 * Herhangi bir ekrandan çağrılabilir.
 *
 * Örnek:
 *   const { login, logout, userRole, isLoggedIn } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

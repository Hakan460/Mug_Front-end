/**
 * AuthContext — Oturum Yönetimi
 *
 * Kullanıcının giriş durumunu ve rolünü (CUSTOMER / OWNER) yönetir.
 * Gerçek backend API ile entegredir.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginApi, registerApi, getMeApi, updateProfileApi } from '../services/api';

// Kullanıcı rolleri
export type UserRole = 'CUSTOMER' | 'OWNER';

// Context tipi
interface AuthContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
  userName: string;
  avatarUri: string | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, avatarUri: string | null) => Promise<void>;
}

// Varsayılan değerler
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userRole: 'CUSTOMER',
  userName: '',
  avatarUri: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('CUSTOMER');
  const [userName, setUserName] = useState<string>('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        const user = await getMeApi();
        setUserRole(user.role);
        setUserName(user.name);
        setAvatarUri(user.avatarUrl || null);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Oturum geçersiz veya yok', error);
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (data: any) => {
    const response = await loginApi(data);
    await SecureStore.setItemAsync('userToken', response.access_token);
    setUserRole(response.user.role);
    setUserName(response.user.name);
    setAvatarUri(response.user.avatarUrl || null);
    setIsLoggedIn(true);
  }, []);

  const register = useCallback(async (data: any) => {
    const response = await registerApi(data);
    await SecureStore.setItemAsync('userToken', response.access_token);
    setUserRole(response.user.role);
    setUserName(response.user.name);
    setAvatarUri(response.user.avatarUrl || null);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('userToken');
    setIsLoggedIn(false);
    setUserRole('CUSTOMER');
    setUserName('');
    setAvatarUri(null);
  }, []);

  const updateProfile = useCallback(async (name: string, uri: string | null) => {
    const user = await updateProfileApi({ name, avatarUrl: uri || undefined });
    setUserName(user.name);
    setAvatarUri(user.avatarUrl || null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userName, avatarUri, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

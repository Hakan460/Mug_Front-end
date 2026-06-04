/**
 * API Servis Katmanı
 *
 * Tüm backend API çağrılarını merkezi olarak yönetir.
 * Android emülatörde localhost'a erişmek için 10.0.2.2 kullanılır.
 * Expo Go (fiziksel cihaz) için bilgisayarın yerel IP'si gerekir.
 *
 * NOT: Backend Docker ile kurulacak, port 3000 üzerinden çalışacak.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Android emülatör: 10.0.2.2 = host makinenin localhost'u
// Fiziksel cihaz: Bilgisayarın WiFi IP adresini yazın (ör: 192.168.1.x)
const API_BASE = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

// ─────────────────────────────────────
// Yardımcı fonksiyon — API isteklerini yönetir
// ─────────────────────────────────────
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        ...headers,
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {}
      throw new Error(errorData?.message || `API Hatası: ${response.status} ${response.statusText}`);
    }

    // DELETE gibi istekler boş yanıt dönebilir
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    console.error(`API İstek Hatası [${endpoint}]:`, error);
    throw error;
  }
}

// ─────────────────────────────────────
// Auth API
// ─────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'OWNER';
  avatarUrl?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export function loginApi(data: any): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function registerApi(data: any): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMeApi(): Promise<User> {
  return request<User>('/auth/me');
}

export function updateProfileApi(data: { name: string, avatarUrl?: string }): Promise<User> {
  return request<User>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─────────────────────────────────────
// Businesses API
// ─────────────────────────────────────
export interface Business {
  id: number;
  name: string;
  location: string;
  phone?: string;
  rating?: number;
  imageUrl?: string;
  ownerId?: number;
  services?: Service[];
  staff?: any[];
}

export function getBusinesses(): Promise<Business[]> {
  return request<Business[]>('/businesses');
}

export function createBusiness(data: Partial<Business>): Promise<Business> {
  return request<Business>('/businesses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBusiness(id: number, data: Partial<Business>): Promise<Business> {
  return request<Business>(`/businesses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteBusiness(id: number): Promise<void> {
  return request<void>(`/businesses/${id}`, {
    method: 'DELETE',
  });
}

// ─────────────────────────────────────
// Hizmetler (Services) API
// ─────────────────────────────────────
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // dakika
}

export function getServices(businessId?: number): Promise<Service[]> {
  const query = businessId ? `?businessId=${businessId}` : '';
  return request<Service[]>(`/services${query}`);
}

export function createService(data: { name: string; description: string; price: number; duration: number; businessId: number }): Promise<Service> {
  return request<Service>('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteService(id: number): Promise<void> {
  return request<void>(`/services/${id}`, {
    method: 'DELETE',
  });
}

export function getStaff(businessId?: number): Promise<any[]> {
  const query = businessId ? `?businessId=${businessId}` : '';
  return request<any[]>(`/staff${query}`);
}

export function createStaff(data: { name: string; title: string; businessId: number }): Promise<any> {
  return request<any>('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteStaff(id: number): Promise<void> {
  return request<void>(`/staff/${id}`, {
    method: 'DELETE',
  });
}

// ─────────────────────────────────────
// Yorumlar (Reviews) API
// ─────────────────────────────────────
export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: User;
}

export function getReviews(businessId?: number): Promise<Review[]> {
  const query = businessId ? `?businessId=${businessId}` : '';
  return request<Review[]>(`/reviews${query}`);
}

export function addReview(data: { businessId: number; rating: number; comment?: string }): Promise<Review> {
  return request<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─────────────────────────────────────
// Randevular (Appointments) API
// ─────────────────────────────────────
export interface Appointment {
  id: number;
  serviceId: number;
  serviceName?: string;
  servicePrice?: number;
  bookingDate: string;
  bookingTime: string;
  staffId?: number;
  staff?: any;
  service?: any;
  status?: string;
}

export interface CreateAppointmentData {
  serviceId: number;
  bookingDate: string;
  bookingTime: string;
  staffId?: number;
}

export function getAppointments(): Promise<Appointment[]> {
  return request<Appointment[]>('/appointments');
}

export function getAllAppointments(): Promise<Appointment[]> {
  return request<Appointment[]>('/appointments/all');
}

export function getBusinessAppointments(businessId: number): Promise<Appointment[]> {
  return request<Appointment[]>(`/appointments/business/${businessId}`);
}

export function createAppointment(data: CreateAppointmentData): Promise<Appointment> {
  return request<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteAppointment(id: number): Promise<void> {
  return request<void>(`/appointments/${id}`, {
    method: 'DELETE',
  });
}

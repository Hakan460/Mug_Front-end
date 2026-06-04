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
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
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
// Hizmetler (Services) API
// ─────────────────────────────────────
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // dakika
}

export function getServices(): Promise<Service[]> {
  return request<Service[]>('/services');
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
  staffId?: string;
  staffName?: string;
  status?: string;
}

export interface CreateAppointmentData {
  serviceId: number;
  bookingDate: string;
  bookingTime: string;
  staffId: string;
}

export function getAppointments(): Promise<Appointment[]> {
  return request<Appointment[]>('/appointments');
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

import React, { useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Ekranlar
import AuthScreen from '../screens/AuthScreen';
import BusinessesScreen from '../screens/BusinessesScreen';
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import MyAppointmentsScreen from '../screens/MyAppointmentsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
console.log("AppNavigator Başlatıldı!"); // Eğer bu terminalde çıkıyorsa navigasyon hatasızdır.

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const PremiumDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#D4AF37',
    background: '#121212',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#333333',
  },
};

// Müşteri Akışı: İşletmeler Listesi -> Dükkan Hizmetleri -> Randevu Detayı
const CustomerHomeStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: '#1A1A1A' },
    headerTintColor: '#D4AF37',
    headerTitleStyle: { fontWeight: 'bold' }
  }}>
    <Stack.Screen name="BusinessesScreen" component={BusinessesScreen} options={{ title: 'İşletmeler', headerShown: false }} />
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Hizmetler' }} />
    <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ title: 'Randevu Al' }} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1A1A1A' }, headerTintColor: '#D4AF37' }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'İşletme Paneli' }} />
  </Stack.Navigator>
);

// ROL TABANLI SEKME SİSTEMİ
const MainTabs = ({ userRole, onLogout }: { userRole: 'CUSTOMER' | 'OWNER'; onLogout: () => void }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1A1A1A', borderTopWidth: 0, elevation: 10, height: 60, paddingBottom: 10 },
      tabBarActiveTintColor: '#D4AF37',
      tabBarInactiveTintColor: '#7F8C8D',
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = 'ellipse';

        if (route.name === 'CustomerHome' || route.name === 'AdminTab') {
          iconName = focused ? 'business' : 'business-outline';
        } else if (route.name === 'MyAppointments' || route.name === 'OwnerAppointments') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'ProfileTab') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName as any} size={size + 2} color={color} />;
      },
    })}
  >
    {userRole === 'CUSTOMER' ? (
      <>
        <Tab.Screen name="CustomerHome" component={CustomerHomeStack} options={{ tabBarLabel: 'İşletmeler' }} />
        <Tab.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ tabBarLabel: 'Randevularım' }} />
      </>
    ) : (
      <>
        <Tab.Screen name="AdminTab" component={AdminStack} options={{ tabBarLabel: 'Yönetim' }} />
        <Tab.Screen name="OwnerAppointments" component={MyAppointmentsScreen} options={{ tabBarLabel: 'Randevular' }} />
      </>
    )}

    <Tab.Screen name="ProfileTab" options={{ tabBarLabel: 'Profil' }}>
      {() => <ProfileScreen userRole={userRole} onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');

  const handleLogin = (role: 'CUSTOMER' | 'OWNER') => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // %100 BAĞIMSIZ DOĞRULAMA AKIŞI: Giriş yapılmadıysa bağımsız AuthScreen'i gösterir
  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Giriş yapıldıysa mevcut sorunsuz Drawer & Tab yapısını ayağa kaldırır
  return (
    <NavigationContainer theme={PremiumDarkTheme}>
      <Drawer.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#D4AF37',
        drawerStyle: { backgroundColor: '#121212' },
        drawerActiveTintColor: '#D4AF37',
        drawerInactiveTintColor: '#FFFFFF'
      }}>
        <Drawer.Screen name="MainTabs" options={{ title: userRole === 'CUSTOMER' ? 'Salon VIP' : 'İşletme Yönetimi' }}>
          {() => <MainTabs userRole={userRole} onLogout={handleLogout} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
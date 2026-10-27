import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';

// Fungsi render icon di luar komponen untuk optimasi performa dan menghindari warning linter
const renderHomeIcon = ({ color, focused }: { color: any; focused: boolean }) => (
  <Ionicons
    name={focused ? 'compass' : 'compass-outline'}
    size={24}
    color={typeof color === 'string' ? color : undefined}
  />
);

const renderExperienceIcon = ({ color, focused }: { color: any; focused: boolean }) => (
  <Ionicons
    name={focused ? 'calendar' : 'calendar-outline'}
    size={23}
    color={typeof color === 'string' ? color : undefined}
  />
);

const renderMapIcon = ({ color, focused }: { color: any; focused: boolean }) => (
  <Ionicons
    name={focused ? 'map' : 'map-outline'}
    size={24}
    color={typeof color === 'string' ? color : undefined}
  />
);

const renderStoreIcon = ({ color }: { color: any }) => (
  <Feather
    name="shopping-bag"
    size={22}
    color={typeof color === 'string' ? color : undefined}
  />
);

const renderProfileIcon = ({ color, focused }: { color: any; focused: boolean }) => (
  <Ionicons
    name={focused ? 'person' : 'person-outline'}
    size={23}
    color={typeof color === 'string' ? color : undefined}
  />
);

const renderSensorIcon = ({ color, focused }: { color: any; focused: boolean }) => (
  <Ionicons
    name={focused ? 'hardware-chip' : 'hardware-chip-outline'}
    size={22}
    color={typeof color === 'string' ? color : undefined}
  />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: renderHomeIcon,
        }}
      />

      <Tabs.Screen
        name="experiences"
        options={{
          title: 'Booking',
          tabBarIcon: renderExperienceIcon,
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Hidden Gems',
          tabBarIcon: renderMapIcon,
        }}
      />

      <Tabs.Screen
        name="store"
        options={{
          title: 'Artisan Store',
          tabBarIcon: renderStoreIcon,
        }}
      />

      <Tabs.Screen
        name="sensor"
        options={{
          title: 'Sensor',
          tabBarIcon: renderSensorIcon,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: renderProfileIcon,
        }}
      />

      <Tabs.Screen
        name="demo"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="pagebaru"
        options={{
          href: null,
        }}
      />

    </Tabs>
    
  );
}

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/src/constants/Theme';
import { PushNotificationTester } from '@/components/PushNotificationTester';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* HEADER NAVIGASI */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Push Notification</Text>
          <Text style={styles.headerSubtitle}>
            Penugasan Praktik: Task 02 — Send Push Notification
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* INFO CARD TUGAS */}
        <View style={styles.assignmentInfoCard}>
          <View style={styles.infoBadgeRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>BAGIAN TUGAS 02</Text>
            </View>
            <Text style={styles.partnerInfoText}>
              Task 01: Registrasi Token (Rekan) • Task 02: Kirim Notifikasi (Saya)
            </Text>
          </View>
          <Text style={styles.assignmentDescription}>
            Menguji pengiriman notifikasi dari <Text style={styles.boldText}>Backend Server</Text> via{' '}
            <Text style={styles.boldText}>Push Provider (Expo Push API)</Text> menuju{' '}
            <Text style={styles.boldText}>Perangkat Target</Text>, serta memverifikasi penerimaan pesan dan penampilannya di layar.
          </Text>
        </View>

        {/* KOMPONEN TESTER UTAMA */}
        <PushNotificationTester />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  assignmentInfoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  partnerInfoText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
  },
  assignmentDescription: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#1E293B',
  },
});


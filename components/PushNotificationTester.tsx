import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useSendNotification } from '@/hooks/useSendNotification';
import { NotificationPipelineStage } from '@/src/types/notifications';

export interface PushNotificationTesterProps {
  onDismiss?: () => void;
  showCardOnly?: boolean;
}

export function PushNotificationTester({ onDismiss }: PushNotificationTesterProps) {
  const {
    pushToken,
    setPushToken,
    title,
    setTitle,
    body,
    setBody,
    isSending,
    pipelineStage,
    logs,
    currentBannerNotification,
    history,
    sendViaServerApi,
    sendLocalSimulation,
    dismissBanner,
    clearHistory,
    applyPreset,
    saveCustomToken,
    reloadTokenFromDevice,
  } = useSendNotification();

  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'logs'>('send');
  const [tokenInputMode, setTokenInputMode] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string>(pushToken);

  const handleSaveToken = async () => {
    if (tempToken.trim()) {
      await saveCustomToken(tempToken);
      setTokenInputMode(false);
    }
  };

  const isStageActive = (stage: NotificationPipelineStage) => {
    const order: NotificationPipelineStage[] = [
      'idle',
      'server_dispatch',
      'provider_forwarding',
      'device_received',
      'message_displayed',
    ];
    const currentIndex = order.indexOf(pipelineStage);
    const stageIndex = order.indexOf(stage);
    return currentIndex >= stageIndex && stageIndex > 0;
  };

  return (
    <View style={styles.container}>
      {/* 1. HEADER KARTU TUGAS */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="notifications" size={14} color="#FFF" />
          <Text style={styles.headerBadgeText}>TASK 02 — PUSH NOTIFICATION</Text>
        </View>
        <Text style={styles.title}>Send Push Notification</Text>
        <Text style={styles.subtitle}>
          Alur: Server → Expo Push Provider → Mobile Device → Receive → Display Message
        </Text>
      </View>

      {/* 2. POP-UP TAMPILAN PESAN NOTIFIKASI DI LAYAR (SEPERTI DI MOCKUP SLIDE) */}
      {currentBannerNotification && (
        <View style={styles.incomingBannerWrapper}>
          <View style={styles.mockupPhoneHeader}>
            <Ionicons name="phone-portrait-outline" size={14} color="#2563EB" />
            <Text style={styles.mockupPhoneHeaderText}>LAYAR PERANGKAT (RECEIVE NOTIFICATION)</Text>
          </View>
          <View style={styles.incomingNotificationCard}>
            <View style={styles.bellIconContainer}>
              <Ionicons name="notifications" size={26} color="#EAB308" />
              <View style={styles.pulseDot} />
            </View>
            <View style={styles.incomingNotificationContent}>
              <View style={styles.incomingHeaderRow}>
                <Text style={styles.incomingTitle}>{currentBannerNotification.title}</Text>
                <TouchableOpacity onPress={dismissBanner} hitSlop={8}>
                  <Feather name="x" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.incomingBody}>{currentBannerNotification.body}</Text>
              <View style={styles.incomingFooterRow}>
                <Text style={styles.incomingTimestamp}>
                  Baru saja • {currentBannerNotification.source === 'expo-push-server' ? 'Server API' : 'Simulasi'}
                </Text>
                <View style={styles.badgeDelivered}>
                  <Text style={styles.badgeDeliveredText}>Diterima</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 3. DIAGRAM ALUR 5 TAHAPAN (PIPELINE VISUALIZER) */}
      <View style={styles.pipelineCard}>
        <Text style={styles.sectionHeader}>ALUR PENGIRIMAN NOTIFIKASI</Text>
        <View style={styles.pipelineRow}>
          {/* Step 1: Server */}
          <View style={[styles.pipelineStep, isStageActive('server_dispatch') && styles.stepActive]}>
            <View style={styles.stepIconBox}>
              <Ionicons name="server-outline" size={18} color={isStageActive('server_dispatch') ? '#2563EB' : '#64748B'} />
            </View>
            <Text style={[styles.stepLabel, isStageActive('server_dispatch') && styles.stepLabelActive]}>
              1. Backend{'\n'}Server
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={14} color="#94A3B8" style={styles.arrowIcon} />

          {/* Step 2: Provider */}
          <View style={[styles.pipelineStep, isStageActive('provider_forwarding') && styles.stepActive]}>
            <View style={styles.stepIconBox}>
              <Ionicons name="cloud-outline" size={18} color={isStageActive('provider_forwarding') ? '#2563EB' : '#64748B'} />
            </View>
            <Text style={[styles.stepLabel, isStageActive('provider_forwarding') && styles.stepLabelActive]}>
              2. Push{'\n'}Provider
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={14} color="#94A3B8" style={styles.arrowIcon} />

          {/* Step 3: Mobile Device */}
          <View style={[styles.pipelineStep, isStageActive('device_received') && styles.stepActive]}>
            <View style={styles.stepIconBox}>
              <Ionicons name="phone-portrait-outline" size={18} color={isStageActive('device_received') ? '#2563EB' : '#64748B'} />
            </View>
            <Text style={[styles.stepLabel, isStageActive('device_received') && styles.stepLabelActive]}>
              3. Mobile{'\n'}Device
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={14} color="#94A3B8" style={styles.arrowIcon} />

          {/* Step 4 & 5: Receive & Display */}
          <View style={[styles.pipelineStep, isStageActive('message_displayed') && styles.stepSuccess]}>
            <View style={[styles.stepIconBox, isStageActive('message_displayed') && styles.stepIconSuccess]}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={isStageActive('message_displayed') ? '#10B981' : '#64748B'}
              />
            </View>
            <Text style={[styles.stepLabel, isStageActive('message_displayed') && styles.stepLabelSuccess]}>
              4 & 5. Display{'\n'}Message
            </Text>
          </View>
        </View>
      </View>

      {/* 4. TAB NAVIGATION: FORM PENGIRIMAN / RIWAYAT / LOG TEKNIS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'send' && styles.tabButtonActive]}
          onPress={() => setActiveTab('send')}>
          <Feather name="send" size={14} color={activeTab === 'send' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'send' && styles.tabTextActive]}>
            Kirim Notifikasi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}>
          <Feather name="inbox" size={14} color={activeTab === 'history' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Riwayat ({history.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'logs' && styles.tabButtonActive]}
          onPress={() => setActiveTab('logs')}>
          <Feather name="activity" size={14} color={activeTab === 'logs' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
            Log Alur
          </Text>
        </TouchableOpacity>
      </View>

      {/* KONTEN TAB 1: FORM PENGIRIMAN */}
      {activeTab === 'send' && (
        <View style={styles.formContainer}>
          {/* PUSH TOKEN BAR */}
          <View style={styles.tokenBox}>
            <View style={styles.tokenHeader}>
              <View style={styles.tokenTitleRow}>
                <Ionicons name="key-outline" size={16} color={Colors.primary} />
                <Text style={styles.tokenTitle}>Target Push Token (Perangkat):</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setTempToken(pushToken);
                  setTokenInputMode(!tokenInputMode);
                }}>
                <Text style={styles.tokenActionText}>
                  {tokenInputMode ? 'Batal' : 'Edit Token'}
                </Text>
              </TouchableOpacity>
            </View>

            {tokenInputMode ? (
              <View style={styles.tokenEditRow}>
                <TextInput
                  style={styles.tokenInput}
                  value={tempToken}
                  onChangeText={setTempToken}
                  placeholder="ExponentPushToken[xxxxxxxx]"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.tokenSaveBtn} onPress={handleSaveToken}>
                  <Text style={styles.tokenSaveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.tokenValue} numberOfLines={1}>
                  {pushToken}
                </Text>
                <TouchableOpacity
                  style={styles.syncTokenBtn}
                  onPress={reloadTokenFromDevice}
                  activeOpacity={0.7}>
                  <Ionicons name="sync-outline" size={12} color={Colors.primary} />
                  <Text style={styles.syncTokenBtnText}>
                    Sinkronkan dengan Token Terdaftar dari Task 01
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* PRESET SHORTCUTS */}
          <View style={styles.presetsSection}>
            <Text style={styles.sectionSmallTitle}>Pilih Template Pesan:</Text>
            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => applyPreset('presidentku')}>
                <Text style={styles.presetBtnText}>🎓 PresidentKu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => applyPreset('lokaltrip_gem')}>
                <Text style={styles.presetBtnText}>🌄 Hidden Gem</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => applyPreset('lokaltrip_promo')}>
                <Text style={styles.presetBtnText}>🎟️ Promo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* INPUT FORM: TITLE & BODY */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Judul Notifikasi (Title):</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Masukkan judul notifikasi..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Isi Pesan (Body):</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={body}
              onChangeText={setBody}
              placeholder="Masukkan isi pesan notifikasi..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionButtonsCol}>
            <TouchableOpacity
              style={[styles.primarySendBtn, isSending && styles.btnDisabled]}
              onPress={sendViaServerApi}
              disabled={isSending}>
              {isSending ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.primarySendBtnText}>Menghubungi Server...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Ionicons name="paper-plane" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primarySendBtnText}>Kirim via Server (Expo Push API)</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondarySendBtn}
              onPress={sendLocalSimulation}
              disabled={isSending}>
              <Feather name="smartphone" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.secondarySendBtnText}>Tes Tampilan Langsung di Layar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* KONTEN TAB 2: RIWAYAT NOTIFIKASI */}
      {activeTab === 'history' && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionSmallTitle}>Notifikasi yang Diterima:</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearHistoryText}>Hapus Semua</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="notifications-off-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyHistoryText}>Belum ada notifikasi yang diterima.</Text>
              <Text style={styles.emptyHistorySubtext}>
                Tekan tombol kirim di atas untuk menguji pengiriman pesan.
              </Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyIconBox}>
                  <Ionicons name="notifications" size={18} color="#EAB308" />
                </View>
                <View style={styles.historyTextBox}>
                  <Text style={styles.historyItemTitle}>{item.title}</Text>
                  <Text style={styles.historyItemBody}>{item.body}</Text>
                  <Text style={styles.historyItemTime}>
                    {new Date(item.timestamp).toLocaleTimeString('id-ID')} •{' '}
                    {item.source === 'expo-push-server' ? 'Server API' : 'Simulasi'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* KONTEN TAB 3: LOG ALUR */}
      {activeTab === 'logs' && (
        <View style={styles.logsContainer}>
          <Text style={styles.sectionSmallTitle}>Log Eksekusi Pipeline:</Text>
          <ScrollView style={styles.logScrollView} nestedScrollEnabled>
            {logs.length === 0 ? (
              <Text style={styles.emptyLogsText}>Belum ada aktivitas tercatat.</Text>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <Text style={styles.logTimestamp}>[{log.timestamp}]</Text>
                  <Text
                    style={[
                      styles.logMessage,
                      log.type === 'success' && styles.logSuccess,
                      log.type === 'error' && styles.logError,
                      log.type === 'warning' && styles.logWarning,
                    ]}>
                    {log.message}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    marginBottom: 14,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  incomingBannerWrapper: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mockupPhoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mockupPhoneHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  incomingNotificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#EAB308',
  },
  bellIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF9C3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  pulseDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  incomingNotificationContent: {
    flex: 1,
  },
  incomingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  incomingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  incomingBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 6,
  },
  incomingFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomingTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
  },
  badgeDelivered: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeDeliveredText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  pipelineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  pipelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pipelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepActive: {
    opacity: 1,
  },
  stepSuccess: {
    opacity: 1,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 4,
  },
  stepIconSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  stepLabel: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  stepLabelSuccess: {
    color: '#10B981',
    fontWeight: '700',
  },
  arrowIcon: {
    marginHorizontal: 2,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 6,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  formContainer: {},
  tokenBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 4,
  },
  tokenActionText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  tokenValue: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#475569',
  },
  syncTokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 3,
  },
  syncTokenBtnText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  tokenEditRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tokenInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
  },
  tokenSaveBtn: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 6,
  },
  tokenSaveBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  presetsSection: {
    marginBottom: 12,
  },
  sectionSmallTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  actionButtonsCol: {
    marginTop: 6,
    gap: 8,
  },
  primarySendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primarySendBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondarySendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondarySendBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  historyContainer: {
    minHeight: 180,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearHistoryText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyHistoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 8,
  },
  emptyHistorySubtext: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF9C3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  historyTextBox: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyItemBody: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  historyItemTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  logsContainer: {
    minHeight: 180,
  },
  logScrollView: {
    maxHeight: 220,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
  },
  emptyLogsText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
  },
  logItem: {
    marginBottom: 6,
  },
  logTimestamp: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  logMessage: {
    color: '#E2E8F0',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  logSuccess: {
    color: '#4ADE80',
  },
  logError: {
    color: '#F87171',
  },
  logWarning: {
    color: '#FBBF24',
  },
});

export default PushNotificationTester;

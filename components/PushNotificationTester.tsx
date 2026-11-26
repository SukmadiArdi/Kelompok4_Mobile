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
} from 'react-native';
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useSendNotification } from '@/hooks/useSendNotification';
import { useNotificationResponse } from '@/hooks/useNotificationResponse';
import { NotificationPipelineStage } from '@/src/types/notifications';
import { ResponsePipelineStep } from '@/src/types/notificationResponse';

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
    targetScreen,
    setTargetScreen,
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

  const {
    responseStep,
    lastResolvedRoute,
    responseLogs,
    simulateTapOnNotification,
    resetLogs,
  } = useNotificationResponse();

  const [activeTab, setActiveTab] = useState<'send' | 'response' | 'history' | 'logs'>('send');
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

  const isResponseStepActive = (step: ResponsePipelineStep) => {
    const order: ResponsePipelineStep[] = [
      'idle',
      'notification_received',
      'user_taps',
      'read_payload',
      'identify_screen',
      'navigate_to_page',
      'completed',
    ];
    const currentIndex = order.indexOf(responseStep);
    const stepIndex = order.indexOf(step);
    return currentIndex >= stepIndex && stepIndex > 0;
  };

  return (
    <View style={styles.container}>
      {/* 1. HEADER KARTU TUGAS */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="notifications" size={14} color="#FFF" />
          <Text style={styles.headerBadgeText}>TASK 02 & TASK 03 — SEND & HANDLE RESPONSE</Text>
        </View>
        <Text style={styles.title}>Push Notification & Deep Linking</Text>
        <Text style={styles.subtitle}>
          Alur Lengkap: Kirim dari Server → Diterima di Perangkat → Ketuk Notifikasi → Navigasi ke Halaman
        </Text>
      </View>

      {/* 2. POP-UP TAMPILAN PESAN NOTIFIKASI DI LAYAR (DENGAN AKSI TAP TASK 03) */}
      {currentBannerNotification && (
        <View style={styles.incomingBannerWrapper}>
          <View style={styles.mockupPhoneHeader}>
            <Ionicons name="phone-portrait-outline" size={14} color="#2563EB" />
            <Text style={styles.mockupPhoneHeaderText}>LAYAR PERANGKAT (KETUK KARTU UNTUK NAVIGASI)</Text>
          </View>
          <TouchableOpacity
            style={styles.incomingNotificationCard}
            activeOpacity={0.85}
            onPress={() =>
              simulateTapOnNotification(
                currentBannerNotification.data || { screen: targetScreen },
                currentBannerNotification.title
              )
            }>
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
              
              {/* Task 03 Deep Link Pill */}
              <View style={styles.deepLinkActionPill}>
                <Ionicons name="navigate-circle" size={14} color="#2563EB" />
                <Text style={styles.deepLinkActionText}>
                  Ketuk untuk buka:{' '}
                  <Text style={styles.deepLinkPath}>
                    {currentBannerNotification.data?.screen || targetScreen}
                  </Text>
                </Text>
              </View>

              <View style={styles.incomingFooterRow}>
                <Text style={styles.incomingTimestamp}>
                  Baru saja • {currentBannerNotification.source === 'expo-push-server' ? 'Server API' : 'Simulasi'}
                </Text>
                <View style={styles.badgeDelivered}>
                  <Text style={styles.badgeDeliveredText}>Diterima • Siap Diketuk 👆</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. TAB NAVIGATION */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'send' && styles.tabButtonActive]}
          onPress={() => setActiveTab('send')}>
          <Feather name="send" size={13} color={activeTab === 'send' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'send' && styles.tabTextActive]}>
            Task 02: Kirim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'response' && styles.tabButtonActive]}
          onPress={() => setActiveTab('response')}>
          <Ionicons name="navigate-outline" size={14} color={activeTab === 'response' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'response' && styles.tabTextActive]}>
            Task 03: Respon
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}>
          <Feather name="inbox" size={13} color={activeTab === 'history' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Riwayat ({history.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'logs' && styles.tabButtonActive]}
          onPress={() => setActiveTab('logs')}>
          <Feather name="activity" size={13} color={activeTab === 'logs' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
            Log
          </Text>
        </TouchableOpacity>
      </View>

      {/* =================================================================== */}
      {/* KONTEN TAB 1: FORM PENGIRIMAN (TASK 02) */}
      {/* =================================================================== */}
      {activeTab === 'send' && (
        <View style={styles.formContainer}>
          {/* DIAGRAM ALUR TASK 02 */}
          <View style={styles.pipelineCard}>
            <Text style={styles.sectionHeader}>ALUR TASK 02: PENGIRIMAN DARI SERVER KE PERANGKAT</Text>
            <View style={styles.pipelineRow}>
              <View style={[styles.pipelineStep, isStageActive('server_dispatch') && styles.stepActive]}>
                <View style={styles.stepIconBox}>
                  <Ionicons name="server-outline" size={16} color={isStageActive('server_dispatch') ? '#2563EB' : '#64748B'} />
                </View>
                <Text style={[styles.stepLabel, isStageActive('server_dispatch') && styles.stepLabelActive]}>
                  1. Server
                </Text>
              </View>

              <Ionicons name="arrow-forward" size={12} color="#94A3B8" style={styles.arrowIcon} />

              <View style={[styles.pipelineStep, isStageActive('provider_forwarding') && styles.stepActive]}>
                <View style={styles.stepIconBox}>
                  <Ionicons name="cloud-outline" size={16} color={isStageActive('provider_forwarding') ? '#2563EB' : '#64748B'} />
                </View>
                <Text style={[styles.stepLabel, isStageActive('provider_forwarding') && styles.stepLabelActive]}>
                  2. Provider
                </Text>
              </View>

              <Ionicons name="arrow-forward" size={12} color="#94A3B8" style={styles.arrowIcon} />

              <View style={[styles.pipelineStep, isStageActive('device_received') && styles.stepActive]}>
                <View style={styles.stepIconBox}>
                  <Ionicons name="phone-portrait-outline" size={16} color={isStageActive('device_received') ? '#2563EB' : '#64748B'} />
                </View>
                <Text style={[styles.stepLabel, isStageActive('device_received') && styles.stepLabelActive]}>
                  3. Device
                </Text>
              </View>

              <Ionicons name="arrow-forward" size={12} color="#94A3B8" style={styles.arrowIcon} />

              <View style={[styles.pipelineStep, isStageActive('message_displayed') && styles.stepSuccess]}>
                <View style={[styles.stepIconBox, isStageActive('message_displayed') && styles.stepIconSuccess]}>
                  <Ionicons name="checkmark-circle" size={16} color={isStageActive('message_displayed') ? '#10B981' : '#64748B'} />
                </View>
                <Text style={[styles.stepLabel, isStageActive('message_displayed') && styles.stepLabelSuccess]}>
                  4 & 5. Display
                </Text>
              </View>
            </View>
          </View>

          {/* TARGET PUSH TOKEN BAR */}
          <View style={styles.tokenBox}>
            <View style={styles.tokenHeader}>
              <View style={styles.tokenTitleRow}>
                <Ionicons name="key-outline" size={15} color={Colors.primary} />
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
                  <Ionicons name="sync-outline" size={13} color={Colors.primary} />
                  <Text style={styles.syncTokenBtnText}>
                    Sinkronkan dengan Token Terdaftar dari Task 01
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* PRESET SHORTCUTS */}
          <View style={styles.presetsSection}>
            <Text style={styles.sectionSmallTitle}>Pilih Template Skenario Pengujian:</Text>
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
                <Text style={styles.presetBtnText}>🎟️ Pengalaman</Text>
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

          {/* INPUT TARGET SCREEN (TASK 03 PAYLOAD) */}
          <View style={styles.inputGroup}>
            <View style={styles.targetScreenHeader}>
              <Text style={styles.inputLabel}>Halaman Tujuan Saat Diketuk (Task 03 Deep Link):</Text>
            </View>
            <View style={styles.targetPillRow}>
              <TouchableOpacity
                style={[styles.targetPill, targetScreen === '/gem/gem-1' && styles.targetPillActive]}
                onPress={() => setTargetScreen('/gem/gem-1')}>
                <Text style={[styles.targetPillText, targetScreen === '/gem/gem-1' && styles.targetPillTextActive]}>
                  🌄 Tanggedu Gem
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.targetPill, targetScreen === '/experience/exp-1' && styles.targetPillActive]}
                onPress={() => setTargetScreen('/experience/exp-1')}>
                <Text style={[styles.targetPillText, targetScreen === '/experience/exp-1' && styles.targetPillTextActive]}>
                  🎭 Batik Canting
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.targetPill, targetScreen === '/product/prod-1' && styles.targetPillActive]}
                onPress={() => setTargetScreen('/product/prod-1')}>
                <Text style={[styles.targetPillText, targetScreen === '/product/prod-1' && styles.targetPillTextActive]}>
                  🛍️ Tenun Sumba
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { marginTop: 6, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}
              value={targetScreen}
              onChangeText={setTargetScreen}
              placeholder="/gem/gem-1 atau /experience/exp-1"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
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
                  <Ionicons name="paper-plane" size={17} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primarySendBtnText}>Kirim via Server (Expo Push API)</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondarySendBtn}
              onPress={sendLocalSimulation}
              disabled={isSending}>
              <Feather name="smartphone" size={15} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.secondarySendBtnText}>Tes Tampilan Langsung di Layar (Instant)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* =================================================================== */}
      {/* KONTEN TAB 2: ALUR RESPON & DEEP LINK (TASK 03) */}
      {/* =================================================================== */}
      {activeTab === 'response' && (
        <View style={styles.responseContainer}>
          {/* DIAGRAM 5 TAHAPAN TASK 03 (SESUAI SLIDE) */}
          <View style={styles.pipelineCard}>
            <Text style={styles.sectionHeader}>ALUR PENGERJAAN TASK 03: HANDLE NOTIFICATION RESPONSE</Text>
            
            <View style={styles.task03StepList}>
              <View style={[styles.task03StepItem, isResponseStepActive('notification_received') && styles.task03StepItemActive]}>
                <View style={styles.task03NumberBadge}>
                  <Text style={styles.task03NumberText}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.task03Title}>NOTIFICATION RECEIVED</Text>
                  <Text style={styles.task03Desc}>Aplikasi menerima notifikasi dari provider.</Text>
                </View>
                {isResponseStepActive('notification_received') && (
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                )}
              </View>

              <View style={[styles.task03StepItem, isResponseStepActive('user_taps') && styles.task03StepItemActive]}>
                <View style={styles.task03NumberBadge}>
                  <Text style={styles.task03NumberText}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.task03Title}>USER TAPS</Text>
                  <Text style={styles.task03Desc}>Pengguna menekan/mengetuk notifikasi di HP.</Text>
                </View>
                {isResponseStepActive('user_taps') && (
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                )}
              </View>

              <View style={[styles.task03StepItem, isResponseStepActive('read_payload') && styles.task03StepItemActive]}>
                <View style={styles.task03NumberBadge}>
                  <Text style={styles.task03NumberText}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.task03Title}>READ PAYLOAD</Text>
                  <Text style={styles.task03Desc}>Data dari payload notifikasi dibaca oleh listener.</Text>
                </View>
                {isResponseStepActive('read_payload') && (
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                )}
              </View>

              <View style={[styles.task03StepItem, isResponseStepActive('identify_screen') && styles.task03StepItemActive]}>
                <View style={styles.task03NumberBadge}>
                  <Text style={styles.task03NumberText}>4</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.task03Title}>IDENTIFY SCREEN</Text>
                  <Text style={styles.task03Desc}>Menentukan rute halaman tujuan dari data.</Text>
                </View>
                {isResponseStepActive('identify_screen') && (
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                )}
              </View>

              <View style={[styles.task03StepItem, isResponseStepActive('navigate_to_page') && styles.task03StepItemActive]}>
                <View style={styles.task03NumberBadge}>
                  <Text style={styles.task03NumberText}>5</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.task03Title}>NAVIGATE TO PAGE</Text>
                  <Text style={styles.task03Desc}>Aplikasi membuka halaman sesuai tujuan.</Text>
                </View>
                {isResponseStepActive('navigate_to_page') && (
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                )}
              </View>
            </View>
          </View>

          {/* TOMBOL SIMULASI KETUK NOTIFIKASI LANGSUNG */}
          <View style={styles.simulateBox}>
            <Text style={styles.sectionSmallTitle}>Uji Ketuk Notifikasi & Buka Halaman Tujuan:</Text>
            <Text style={styles.simulateSubtext}>
              Target Rute:{' '}
              <Text style={styles.simulateTargetBold}>{targetScreen}</Text>
            </Text>

            <TouchableOpacity
              style={styles.primarySendBtn}
              onPress={() =>
                simulateTapOnNotification(
                  { screen: targetScreen, url: targetScreen, title, body, sentAt: Date.now() },
                  title
                )
              }>
              <View style={styles.loadingRow}>
                <MaterialCommunityIcons name="gesture-tap" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.primarySendBtnText}>Simulasikan User Mengetuk Notifikasi 👆</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* HASIL RESOLUSI RUTE TERAKHIR */}
          {lastResolvedRoute && (
            <View style={styles.resolvedCard}>
              <View style={styles.resolvedHeaderRow}>
                <Ionicons name="compass" size={18} color={Colors.primary} />
                <Text style={styles.resolvedTitle}>Halaman Tujuan Teridentifikasi:</Text>
              </View>
              <Text style={styles.resolvedLabel}>{lastResolvedRoute.label}</Text>
              <Text style={styles.resolvedRoute}>{lastResolvedRoute.route}</Text>
              <Text style={styles.resolvedDesc}>{lastResolvedRoute.description}</Text>
            </View>
          )}

          {/* RIWAYAT NAVIGASI HASIL KETUKAN */}
          <View style={styles.responseHistorySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionSmallTitle}>Riwayat Navigasi Notifikasi (Task 03):</Text>
              {responseLogs.length > 0 && (
                <TouchableOpacity onPress={resetLogs}>
                  <Text style={styles.clearHistoryText}>Hapus Riwayat</Text>
                </TouchableOpacity>
              )}
            </View>

            {responseLogs.length === 0 ? (
              <Text style={styles.emptyHistorySubtext}>
                Belum ada ketukan notifikasi yang tercatat. Tekan tombol simulasi di atas.
              </Text>
            ) : (
              responseLogs.map((item) => (
                <View key={item.id} style={styles.responseLogCard}>
                  <View style={styles.responseLogIconBox}>
                    <Ionicons name="open-outline" size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.responseLogTitle}>{item.title}</Text>
                    <Text style={styles.responseLogRoute}>Rute: {item.route}</Text>
                    <Text style={styles.responseLogTime}>{item.timestamp}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {/* =================================================================== */}
      {/* KONTEN TAB 3: RIWAYAT NOTIFIKASI */}
      {/* =================================================================== */}
      {activeTab === 'history' && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionSmallTitle}>Notifikasi yang Pernah Diterima:</Text>
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
                Kirimkan notifikasi pada tab Task 02 untuk menguji.
              </Text>
            </View>
          ) : (
            history.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyCard}
                activeOpacity={0.7}
                onPress={() => simulateTapOnNotification(item.data || { screen: targetScreen }, item.title)}>
                <View style={styles.historyIconBox}>
                  <Ionicons name="notifications" size={18} color="#EAB308" />
                </View>
                <View style={styles.historyTextBox}>
                  <Text style={styles.historyItemTitle}>{item.title}</Text>
                  <Text style={styles.historyItemBody}>{item.body}</Text>
                  <View style={styles.historyItemBottomRow}>
                    <Text style={styles.historyItemTime}>
                      {new Date(item.timestamp).toLocaleTimeString('id-ID')} •{' '}
                      {item.source === 'expo-push-server' ? 'Server API' : 'Simulasi'}
                    </Text>
                    <View style={styles.tapPillMini}>
                      <Text style={styles.tapPillMiniText}>Ketuk untuk Buka 👆</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* =================================================================== */}
      {/* KONTEN TAB 4: LOG ALUR */}
      {/* =================================================================== */}
      {activeTab === 'logs' && (
        <View style={styles.logsContainer}>
          <Text style={styles.sectionSmallTitle}>Log Eksekusi Server & Pipeline:</Text>
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
    fontSize: 10,
    fontWeight: '800',
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
  deepLinkActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  deepLinkActionText: {
    fontSize: 11,
    color: '#1E40AF',
    marginLeft: 4,
    fontWeight: '600',
  },
  deepLinkPath: {
    fontWeight: '700',
    color: Colors.primary,
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
    marginBottom: 14,
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginHorizontal: 1,
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
    paddingVertical: 7,
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
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 4,
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
    fontSize: 11,
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
  targetScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetPillRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    marginBottom: 4,
  },
  targetPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  targetPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  targetPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  targetPillTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  actionButtonsCol: {
    marginTop: 6,
    gap: 8,
  },
  primarySendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
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
    fontSize: 13,
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
    paddingVertical: 11,
  },
  secondarySendBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  responseContainer: {},
  task03StepList: {
    gap: 8,
    marginTop: 4,
  },
  task03StepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  task03StepItemActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  task03NumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  task03NumberText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  task03Title: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.4,
  },
  task03Desc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  simulateBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  simulateSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  simulateTargetBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  resolvedCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resolvedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  resolvedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  resolvedLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  resolvedRoute: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#065F46',
    marginTop: 2,
  },
  resolvedDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 4,
  },
  responseHistorySection: {
    marginTop: 4,
  },
  responseLogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  responseLogIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  responseLogTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  responseLogRoute: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.primary,
    marginTop: 1,
  },
  responseLogTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
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
  historyItemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  historyItemTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  tapPillMini: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tapPillMiniText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D4ED8',
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

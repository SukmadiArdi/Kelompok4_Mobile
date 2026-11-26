import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  NotificationDataPayload,
  ResolvedRouteInfo,
  NotificationResponseLog,
  ResponsePipelineStep,
} from '@/src/types/notificationResponse';
import {
  resolveTargetRoute,
  executeNotificationNavigation,
  getResponseHistory,
  clearResponseHistory,
} from '@/src/services/notificationResponseService';

export interface UseNotificationResponseReturn {
  responseStep: ResponsePipelineStep;
  lastResolvedRoute: ResolvedRouteInfo | null;
  responseLogs: NotificationResponseLog[];
  simulateTapOnNotification: (payload: NotificationDataPayload, title?: string) => Promise<ResolvedRouteInfo>;
  refreshResponseLogs: () => Promise<void>;
  resetLogs: () => Promise<void>;
  resetStep: () => void;
}

export function useNotificationResponse(): UseNotificationResponseReturn {
  const [responseStep, setResponseStep] = useState<ResponsePipelineStep>('idle');
  const [lastResolvedRoute, setLastResolvedRoute] = useState<ResolvedRouteInfo | null>(null);
  const [responseLogs, setResponseLogs] = useState<NotificationResponseLog[]>([]);

  const isMountedRef = useRef<boolean>(true);
  const responseSubscriptionRef = useRef<Notifications.Subscription | null>(null);

  const refreshResponseLogs = useCallback(async () => {
    const logs = await getResponseHistory();
    if (isMountedRef.current) {
      setResponseLogs(logs);
    }
  }, []);

  /**
   * LANGKAH 1-5 ALUR TASK 03:
   * 1. NOTIFICATION RECEIVED -> 2. USER TAPS -> 3. READ PAYLOAD -> 4. IDENTIFY SCREEN -> 5. NAVIGATE TO PAGE
   */
  const processNotificationTap = useCallback(
    async (
      payload: NotificationDataPayload,
      sourceTitle: string = 'Notifikasi'
    ): Promise<ResolvedRouteInfo> => {
      // 2. USER TAPS
      setResponseStep('user_taps');

      // 3. READ PAYLOAD (dengan sedikit jeda agar visual pipeline terlihat jelas)
      await new Promise((res) => setTimeout(res, 250));
      setResponseStep('read_payload');

      // 4. IDENTIFY SCREEN
      await new Promise((res) => setTimeout(res, 250));
      const target = resolveTargetRoute(payload);
      setLastResolvedRoute(target);
      setResponseStep('identify_screen');

      // 5. NAVIGATE TO PAGE
      await new Promise((res) => setTimeout(res, 300));
      setResponseStep('navigate_to_page');

      await executeNotificationNavigation(payload, sourceTitle);

      setResponseStep('completed');
      void refreshResponseLogs();

      return target;
    },
    [refreshResponseLogs]
  );

  useEffect(() => {
    isMountedRef.current = true;
    void refreshResponseLogs();

    // =======================================================================
    // MENANGANI KONDISI 1: COLD START (Aplikasi dibuka dari keadaan tertutup)
    // =======================================================================
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!isMountedRef.current || !response) return;
        const data = response.notification.request.content.data as NotificationDataPayload;
        const title = response.notification.request.content.title || 'Cold Start Notifikasi';
        if (data && (data.screen || data.url || data.gemId || data.experienceId || data.productId || data.type)) {
          void processNotificationTap(data, title);
        }
      })
      .catch((err) => {
        console.warn('[useNotificationResponse] Gagal memeriksa last notification response:', err);
      });

    // =======================================================================
    // MENANGANI KONDISI 2 & 3: BACKGROUND & FOREGROUND TAP LISTENER
    // =======================================================================
    responseSubscriptionRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (!isMountedRef.current) return;
        const data = response.notification.request.content.data as NotificationDataPayload;
        const title = response.notification.request.content.title || 'Notifikasi Ditekan';
        void processNotificationTap(data, title);
      }
    );

    return () => {
      isMountedRef.current = false;
      if (responseSubscriptionRef.current) {
        responseSubscriptionRef.current.remove();
        responseSubscriptionRef.current = null;
      }
    };
  }, [processNotificationTap, refreshResponseLogs]);

  const resetLogs = useCallback(async () => {
    await clearResponseHistory();
    setResponseLogs([]);
  }, []);

  const resetStep = useCallback(() => {
    setResponseStep('idle');
  }, []);

  return {
    responseStep,
    lastResolvedRoute,
    responseLogs,
    simulateTapOnNotification: processNotificationTap,
    refreshResponseLogs,
    resetLogs,
    resetStep,
  };
}

export default useNotificationResponse;

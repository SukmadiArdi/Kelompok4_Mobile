import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { HiddenGem } from '../../types';
import { generateLeafletHtml } from './leafletHtml';

export interface ResetViewOptions {
  lat?: number;
  lng?: number;
  zoom?: number;
  id?: string;
}

export interface MapLeafletHandle {
  panBy: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: (options?: ResetViewOptions) => void;
  centerToCoordinates: (lat: number, lng: number, zoom?: number) => void;
  focusGem: (id: string) => void;
}

export interface MapLeafletProps {
  gems: HiddenGem[];
  selectedGem: HiddenGem | null;
  onSelectGem: (gem: HiddenGem) => void;
  mapType?: 'streets' | 'satellite';
  height?: number;
}

export const MapLeaflet = forwardRef<MapLeafletHandle, MapLeafletProps>(
  ({ gems, selectedGem, onSelectGem, mapType = 'streets', height = 340 }, ref) => {
    const webViewRef = useRef<WebView | null>(null);

    const htmlContent = generateLeafletHtml({
      gems,
      selectedGemId: selectedGem?.id ?? null,
      mapType,
      center: selectedGem ? [selectedGem.mapCoords.lat, selectedGem.mapCoords.lng] : [-2.5, 118.0],
      zoom: selectedGem ? 8 : 5,
    });

    const sendCommand = (type: string, payload?: Record<string, any>) => {
      const msg = { type, ...(payload || {}) };
      const jsonStr = JSON.stringify(msg);
      // 1. Kirim via postMessage standar WebView
      webViewRef.current?.postMessage(jsonStr);
      // 2. Eksekusi langsung via injectJavaScript (100% andal di Android & iOS)
      const jsCode = `
        if (typeof window.handleIncomingMapMessage === 'function') {
          window.handleIncomingMapMessage(${jsonStr});
        }
        true;
      `;
      (webViewRef.current as any)?.injectJavaScript(jsCode);
    };

    useImperativeHandle(ref, () => ({
      panBy: (x: number, y: number) => {
        sendCommand('PAN_BY', { x, y });
      },
      zoomIn: () => {
        sendCommand('ZOOM_IN');
      },
      zoomOut: () => {
        sendCommand('ZOOM_OUT');
      },
      resetView: (options?: ResetViewOptions) => {
        sendCommand('RESET_VIEW', options);
      },
      centerToCoordinates: (lat: number, lng: number, zoom = 10) => {
        sendCommand('CENTER_TO', { lat, lng, zoom });
      },
      focusGem: (id: string) => {
        sendCommand('FOCUS_GEM', { id });
      },
    }));

    const handleMessage = (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'SELECT_GEM') {
          const found = gems.find((g) => g.id === data.id);
          if (found) {
            onSelectGem(found);
          }
        }
      } catch {
        // Ignore parse error
      }
    };

    useEffect(() => {
      if (selectedGem && webViewRef.current) {
        sendCommand('FOCUS_GEM', { id: selectedGem.id });
      }
    }, [selectedGem]);

    return (
      <View style={[styles.container, { height }]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          overScrollMode="never"
        />
      </View>
    );
  }
);

MapLeaflet.displayName = 'MapLeaflet';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
});

export default MapLeaflet;

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { HiddenGem } from '../../types';
import { generateLeafletHtml } from './leafletHtml';

export interface MapLeafletHandle {
  panBy: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
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

    useImperativeHandle(ref, () => ({
      panBy: (x: number, y: number) => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'PAN_BY', x, y }));
      },
      zoomIn: () => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'ZOOM_IN' }));
      },
      zoomOut: () => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'ZOOM_OUT' }));
      },
      resetView: () => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'RESET_VIEW' }));
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
        const payload = JSON.stringify({ type: 'FOCUS_GEM', id: selectedGem.id });
        webViewRef.current.postMessage(payload);
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

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
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
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const htmlContent = generateLeafletHtml({
      gems,
      selectedGemId: selectedGem?.id ?? null,
      mapType,
      center: selectedGem ? [selectedGem.mapCoords.lat, selectedGem.mapCoords.lng] : [-2.5, 118.0],
      zoom: selectedGem ? 8 : 5,
    });

    const sendCommand = (type: string, payload?: Record<string, any>) => {
      const msg = { type, ...(payload || {}) };
      try {
        iframeRef.current?.contentWindow?.postMessage(msg, '*');
        (iframeRef.current?.contentWindow as any)?.handleIncomingMapMessage?.(msg);
      } catch {
        // Fallback or ignore
      }
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

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && typeof event.data === 'object' && event.data.type === 'SELECT_GEM') {
          const found = gems.find((g) => g.id === event.data.id);
          if (found) {
            onSelectGem(found);
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [gems, onSelectGem]);

    // Saat selectedGem berganti dari luar, fokuskan peta di dalam iframe
    useEffect(() => {
      if (selectedGem && iframeRef.current?.contentWindow) {
        sendCommand('FOCUS_GEM', { id: selectedGem.id });
      }
    }, [selectedGem]);

    return (
      <View style={[styles.container, { height }]}>
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 20,
          }}
          title="Hidden Gems Map Web"
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
});

export default MapLeaflet;

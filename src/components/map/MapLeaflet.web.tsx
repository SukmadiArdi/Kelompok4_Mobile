import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
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
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const htmlContent = generateLeafletHtml({
      gems,
      selectedGemId: selectedGem?.id ?? null,
      mapType,
      center: selectedGem ? [selectedGem.mapCoords.lat, selectedGem.mapCoords.lng] : [-2.5, 118.0],
      zoom: selectedGem ? 8 : 5,
    });

    useImperativeHandle(ref, () => ({
      panBy: (x: number, y: number) => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'PAN_BY', x, y }, '*');
      },
      zoomIn: () => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'ZOOM_IN' }, '*');
      },
      zoomOut: () => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'ZOOM_OUT' }, '*');
      },
      resetView: () => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'RESET_VIEW' }, '*');
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
        iframeRef.current.contentWindow.postMessage(
          { type: 'FOCUS_GEM', id: selectedGem.id },
          '*'
        );
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

import { Platform } from 'react-native';
import { MapLeaflet as WebMapLeaflet } from './MapLeaflet.web';
import { MapLeaflet as NativeMapLeaflet } from './MapLeaflet.native';
import type { MapLeafletHandle, MapLeafletProps, ResetViewOptions } from './MapLeaflet.web';

export const MapLeaflet = Platform.OS === 'web' ? WebMapLeaflet : NativeMapLeaflet;
export type { MapLeafletHandle, MapLeafletProps, ResetViewOptions };
export default MapLeaflet;


declare module 'react-native-maps' {
  import * as React from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface LatLng {
    latitude: number;
    longitude: number;
  }

  export interface MapViewProps extends ViewProps {
    provider?: 'google' | null;
    style?: StyleProp<ViewStyle>;
    initialRegion?: Region;
    region?: Region;
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    followsUserLocation?: boolean;
    onRegionChange?: (region: Region) => void;
    onRegionChangeComplete?: (region: Region) => void;
    onPress?: (event: any) => void;
    children?: React.ReactNode;
  }

  export default class MapView extends React.Component<MapViewProps, any> {
    animateToRegion(region: Region, duration?: number): void;
    animateCamera(camera: any, options?: { duration?: number }): void;
    fitToCoordinates(coordinates?: LatLng[], options?: any): void;
  }

  export interface MarkerProps extends ViewProps {
    coordinate: LatLng;
    title?: string;
    description?: string;
    pinColor?: string;
    zIndex?: number;
    onPress?: (event: any) => void;
    children?: React.ReactNode;
  }

  export class Marker extends React.Component<MarkerProps, any> {}

  export interface CircleProps extends ViewProps {
    center: LatLng;
    radius: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    zIndex?: number;
  }

  export class Circle extends React.Component<CircleProps, any> {}

  export interface CalloutProps extends ViewProps {
    onPress?: (event: any) => void;
    children?: React.ReactNode;
  }

  export class Callout extends React.Component<CalloutProps, any> {}
}

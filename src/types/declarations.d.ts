declare module 'react-native-webview' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface WebViewProps extends ViewProps {
    source?: { uri?: string; html?: string; baseUrl?: string };
    originWhitelist?: string[];
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    mixedContentMode?: 'always' | 'never' | 'compatibility';
    onMessage?: (event: { nativeEvent: { data: string } }) => void;
    onError?: (syntheticEvent: any) => void;
    onHttpError?: (syntheticEvent: any) => void;
    renderError?: () => React.ReactElement;
    startInLoadingState?: boolean;
    scalesPageToFit?: boolean;
    style?: any;
    scrollEnabled?: boolean;
    nestedScrollEnabled?: boolean;
    overScrollMode?: 'always' | 'never' | 'content' | string;
    [key: string]: any;
  }

  export class WebView extends Component<WebViewProps> {
    postMessage(message: string): void;
    reload(): void;
    goBack(): void;
    goForward(): void;
  }

  export default WebView;
}

declare module 'expo-location' {
  export enum Accuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
  }

  export enum PermissionStatus {
    UNDETERMINED = 'undetermined',
    GRANTED = 'granted',
    DENIED = 'denied',
  }

  export interface LocationPermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: 'never' | number;
  }

  export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  }

  export interface LocationObject {
    coords: LocationCoordinates;
    timestamp: number;
  }

  export interface LocationGeocodedAddress {
    city: string | null;
    district: string | null;
    streetNumber: string | null;
    street: string | null;
    region: string | null;
    subregion: string | null;
    country: string | null;
    postalCode: string | null;
    name: string | null;
    isoCountryCode: string | null;
    timezone: string | null;
    formattedAddress?: string | null;
  }

  export interface LocationOptions {
    accuracy?: Accuracy;
    timeInterval?: number;
    distanceInterval?: number;
    mayShowUserSettingsDialog?: boolean;
  }

  export interface LocationSubscription {
    remove(): void;
  }

  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: LocationOptions): Promise<LocationObject>;
  export function getLastKnownPositionAsync(options?: LocationOptions): Promise<LocationObject | null>;
  export function reverseGeocodeAsync(
    location: { latitude: number; longitude: number },
    options?: { useGoogleMaps?: boolean }
  ): Promise<LocationGeocodedAddress[]>;
  export function geocodeAsync(address: string): Promise<{ latitude: number; longitude: number }[]>;
  export function watchPositionAsync(
    options: LocationOptions,
    callback: (location: LocationObject) => void
  ): Promise<LocationSubscription>;
  export function hasServicesEnabledAsync(): Promise<boolean>;
  export function enableNetworkProviderAsync(): Promise<void>;
}


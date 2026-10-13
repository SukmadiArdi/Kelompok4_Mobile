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

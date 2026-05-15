import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.storeyinfra.app',
  appName: 'Storey',
  webDir: 'dist',

  // Android-specific settings
  android: {
    backgroundColor: '#B85042',   // brand terracotta — shown during cold start
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    // Status bar: dark icons on a light background
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FAF7F2',  // brand sand / off-white
    },

    // Splash screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#B85042',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },

    // Deep-link scheme for Supabase OAuth callbacks
    // storeyapp://auth/callback
    App: {
      launchUrl: 'storeyapp://auth/callback',
    },
  },

  // Allow the app to make requests to Supabase
  server: {
    // Keep undefined in production (uses file:// protocol)
    // Uncomment next line ONLY for live-reload during dev:
    // url: 'http://192.168.x.x:5174',
    cleartext: false,
  },
};

export default config;

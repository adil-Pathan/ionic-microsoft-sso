import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ionic.microsoftsso',
  appName: 'Ionic Microsoft SSO',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    App: {
      clearCache: true
    }
  }
};

export default config;
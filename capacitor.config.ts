import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.divingecologyfrosta.app',
  appName: 'Diving Ecology Education Frosta',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#062B46',
  android: {
    backgroundColor: '#062B46',
  },
  ios: {
    backgroundColor: '#062B46',
    contentInset: 'automatic',
  },
};

export default config;

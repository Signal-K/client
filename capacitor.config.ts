import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'space.starsailors.app',
  appName: 'Star Sailors',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'space.starsailors',
  appName: 'Star Sailors',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;

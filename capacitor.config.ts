import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iptrack.app',
  appName: 'IP Tracker',
  webDir: 'public',
  server: {
    url: 'http://localhost:3000',
  }
};

export default config;

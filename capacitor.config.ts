import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swadnscreens.app',
  appName: 'Swadnscreens',
  webDir: 'public',
  server: {
    url: 'https://www.swadnscreens.space',
    cleartext: true
  }
};

export default config;

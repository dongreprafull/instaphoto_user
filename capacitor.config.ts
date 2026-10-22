import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'in.instantphoto.user',
  appName: 'Instant Photo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config

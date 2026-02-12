import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PhishGuard AI',
    short_name: 'PhishGuard',
    description: 'AI-Powered Phishing Detection & Security Advisor',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/api/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}

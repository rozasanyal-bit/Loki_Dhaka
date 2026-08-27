import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { MobileBootstrap } from '@/components/mobile-bootstrap'
import { AuthProvider } from '@/lib/auth-context'

const geistSans   = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono   = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const cormorant   = Cormorant_Garamond({
  variable: '--font-serif',
  weight: ['500', '600', '700'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  applicationName: 'Loki Bar',
  title: 'Loki Bar',
  description: 'Premium portal experience for the Loki Bar in Dhaka.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Loki',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#060606',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
        <ServiceWorkerRegister />
        <MobileBootstrap />
      </body>
    </html>
  )
}

// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Public_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/ui/bottom-nav'

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'GymLog',
  description: 'Track your training progress',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${publicSans.className} bg-surface-base min-h-screen`}>
        <div className="max-w-md mx-auto relative min-h-screen">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import '../styles.css'

export const metadata: Metadata = {
  title: 'ojoxux.com',
  icons: [
    { rel: 'icon', url: '/favicon-32.ico', sizes: '32x32' },
    { rel: 'icon', url: '/favicon-16.ico', sizes: '16x16' },
  ],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


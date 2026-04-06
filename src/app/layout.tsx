import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

// All pages use auth state — disable static prerendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AlertTrader — Stock & Crypto Price Alerts',
  description:
    'Get instant email alerts when your stocks or crypto hit your target price. Set up in minutes, never miss a move.',
  keywords: ['stock alerts', 'crypto alerts', 'price notifications', 'bitcoin alerts', 'stock market'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background min-h-screen antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UniVerse — AI-Powered Academic Management',
  description: 'The future of university management. AI-enabled, role-based, and built for modern institutions.',
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
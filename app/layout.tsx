import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Manrope, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CopaTío',
  description: 'Predicciones del Mundial 2026',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CopaTío',
  },
}

export const viewport: Viewport = {
  themeColor: '#d4a017',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

// Prevent flash of wrong theme — runs before hydration
const themeScript = `
  try {
    var t = localStorage.getItem('copatio-theme');
    document.documentElement.dataset.theme = (t === 'light') ? 'light' : 'dark';
  } catch(e) {
    document.documentElement.dataset.theme = 'dark';
  }
`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body className={`${manrope.variable} ${bricolage.variable} ${jetbrains.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

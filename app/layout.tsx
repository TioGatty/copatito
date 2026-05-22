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
  metadataBase: new URL('https://copatio.vercel.app'),
  title: {
    default: 'CopaTío — Predicciones del Mundial 2026',
    template: '%s · CopaTío',
  },
  description: 'Pronosticá los 104 partidos del Mundial 2026. Competí con tus amigos en pools privados. 10/6/3 puntos × multiplicador por fase.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CopaTío',
  },
  openGraph: {
    title: 'CopaTío — Predicciones del Mundial 2026',
    description: 'Pronosticá cada partido del Mundial 2026 y competí con tus amigos en pools privados.',
    url: 'https://copatio.vercel.app',
    siteName: 'CopaTío',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CopaTío — Predicciones del Mundial 2026',
    description: 'Pronosticá cada partido del Mundial 2026. Competí con tus amigos.',
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

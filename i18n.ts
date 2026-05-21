import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'es'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: Locale = defaultLocale

  // First: explicit requestLocale (next-intl routing)
  const requested = await requestLocale
  if ((locales as readonly string[]).includes(requested ?? '')) {
    locale = requested as Locale
  } else {
    // Fall back to NEXT_LOCALE cookie (set by setLocale action)
    const ck = await cookies()
    const cookieLocale = ck.get('NEXT_LOCALE')?.value
    if ((locales as readonly string[]).includes(cookieLocale ?? '')) {
      locale = cookieLocale as Locale
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})

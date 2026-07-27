export const CONTENT_LOCALES = ['vi', 'en'] as const

export type ContentLocale = (typeof CONTENT_LOCALES)[number]

export const DEFAULT_CONTENT_LOCALE: ContentLocale = 'vi'
export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh' as const
export const LOCALE_COOKIE_NAME = 'ZI_BLOG_LOCALE' as const

export const LOCALE_METADATA = {
  vi: {
    code: 'vi',
    htmlLang: 'vi',
    intlLocale: 'vi-VN',
    label: 'Tiếng Việt',
    openGraphLocale: 'vi_VN',
  },
  en: {
    code: 'en',
    htmlLang: 'en',
    intlLocale: 'en-US',
    label: 'English',
    openGraphLocale: 'en_US',
  },
} as const satisfies Record<
  ContentLocale,
  {
    code: ContentLocale
    htmlLang: string
    intlLocale: string
    label: string
    openGraphLocale: string
  }
>

export function isContentLocale(value: unknown): value is ContentLocale {
  return typeof value === 'string' && CONTENT_LOCALES.includes(value as ContentLocale)
}

export function parseContentLocale(value: unknown): ContentLocale | null {
  return isContentLocale(value) ? value : null
}

export function alternateLocale(locale: ContentLocale): ContentLocale {
  return locale === 'vi' ? 'en' : 'vi'
}

export function detectContentLocale(input: {
  acceptLanguage?: null | string
  cookie?: null | string
}): ContentLocale {
  const cookieLocale = parseContentLocale(input.cookie)
  if (cookieLocale) return cookieLocale

  const preferences =
    input.acceptLanguage
      ?.split(',')
      .map((item) => {
        const [language, ...parameters] = item.trim().split(';')
        const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='))
        const quality = qualityParameter ? Number.parseFloat(qualityParameter.trim().slice(2)) : 1
        return {
          language: language?.toLowerCase().split('-')[0],
          quality: Number.isFinite(quality) ? quality : 0,
        }
      })
      .sort((left, right) => right.quality - left.quality) ?? []

  for (const preference of preferences) {
    const locale = parseContentLocale(preference.language)
    if (locale) return locale
  }
  return DEFAULT_CONTENT_LOCALE
}

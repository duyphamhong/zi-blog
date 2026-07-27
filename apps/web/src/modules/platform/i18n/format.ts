import { DEFAULT_TIME_ZONE, LOCALE_METADATA, type ContentLocale } from './config'

export function formatDate(value: Date | string, locale: ContentLocale): string {
  return new Intl.DateTimeFormat(LOCALE_METADATA[locale].intlLocale, {
    day: 'numeric',
    month: 'long',
    timeZone: DEFAULT_TIME_ZONE,
    year: 'numeric',
  }).format(new Date(value))
}

export function formatNumber(value: number, locale: ContentLocale): string {
  return new Intl.NumberFormat(LOCALE_METADATA[locale].intlLocale).format(value)
}

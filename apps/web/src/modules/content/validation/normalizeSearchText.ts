import type { ContentLocale } from '@/modules/platform'

export function normalizeSearchText(input: string, locale: ContentLocale): string {
  const normalized = input
    .normalize(locale === 'vi' ? 'NFD' : 'NFKC')
    .replace(locale === 'vi' ? /[\u0300-\u036f]/g : /$^/, '')
    .replace(locale === 'vi' ? /đ/g : /$^/, 'd')
    .replace(locale === 'vi' ? /Đ/g : /$^/, 'D')
    .toLocaleLowerCase(locale === 'vi' ? 'vi-VN' : 'en-US')

  return normalized
    .replace(/[^\p{L}\p{N}\s.+#-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

import { APIError, type Payload } from 'payload'

import {
  CONTENT_LOCALES,
  LOCALE_METADATA,
  parseContentLocale,
  type ContentLocale,
} from '@/modules/platform'

export const REQUIRED_TRANSLATION_FIELDS = ['title', 'slug', 'excerpt', 'content'] as const

export type TranslationField = (typeof REQUIRED_TRANSLATION_FIELDS)[number]

export type LocaleReadiness = {
  complete: boolean
  missingFields: TranslationField[]
}

export type TranslationReadiness = Record<ContentLocale, LocaleReadiness> & {
  readyForPublication: boolean
}

type TranslationSource = Partial<Record<TranslationField, unknown>>

function hasRichText(value: unknown): boolean {
  if (!value || typeof value !== 'object' || !('root' in value)) return false
  const root = value.root
  return Boolean(
    root &&
      typeof root === 'object' &&
      'children' in root &&
      Array.isArray(root.children) &&
      root.children.length > 0,
  )
}

export function inspectTranslation(source: TranslationSource): LocaleReadiness {
  const missingFields = REQUIRED_TRANSLATION_FIELDS.filter((field) => {
    const value = source[field]
    if (field === 'content') return !hasRichText(value)
    return typeof value !== 'string' || value.trim().length === 0
  })
  return { complete: missingFields.length === 0, missingFields }
}

export async function inspectPostTranslations(input: {
  id?: number | string
  payload: Payload
  pendingData?: TranslationSource
  pendingLocale?: unknown
}): Promise<TranslationReadiness> {
  const pendingLocale = parseContentLocale(input.pendingLocale)
  const readiness = {} as Record<ContentLocale, LocaleReadiness>

  for (const locale of CONTENT_LOCALES) {
    let source: TranslationSource = {}
    if (input.id) {
      const document = await input.payload.findByID({
        collection: 'posts',
        depth: 0,
        draft: true,
        fallbackLocale: false,
        id: input.id,
        locale,
        overrideAccess: true,
      })
      source = document
    }
    if (pendingLocale === locale && input.pendingData) {
      source = { ...source, ...input.pendingData }
    }
    readiness[locale] = inspectTranslation(source)
  }

  return {
    ...readiness,
    readyForPublication: CONTENT_LOCALES.every((locale) => readiness[locale].complete),
  }
}

export function assertTranslationReady(
  readiness: TranslationReadiness,
  messageLocale: unknown,
): void {
  if (readiness.readyForPublication) return
  const locale = parseContentLocale(messageLocale) ?? 'en'
  const incomplete = CONTENT_LOCALES.filter((code) => !readiness[code].complete)
  const details = incomplete.map((code) => ({
    locale: code,
    missingFields: readiness[code].missingFields,
  }))
  const languageNames = incomplete.map((code) => LOCALE_METADATA[code].label).join(', ')
  const message =
    locale === 'vi'
      ? `Bản dịch chưa hoàn chỉnh: ${languageNames}.`
      : `Translations are incomplete: ${languageNames}.`
  throw new APIError(
    message,
    400,
    {
      code: 'TRANSLATION_INCOMPLETE',
      details,
    },
    true,
  )
}

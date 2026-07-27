import type { ContentLocale } from './config'
import { enDictionary } from './dictionaries/en'

export type AppDictionary = {
  [Section in keyof typeof enDictionary]: {
    [Key in keyof (typeof enDictionary)[Section]]: string
  }
}

const dictionaries = {
  en: enDictionary,
  vi: () => import('./dictionaries/vi').then(({ viDictionary }) => viDictionary),
} as const

export async function getDictionary(locale: ContentLocale): Promise<AppDictionary> {
  return locale === 'en' ? dictionaries.en : dictionaries.vi()
}

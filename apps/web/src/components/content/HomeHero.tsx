import { ButtonLink } from '@/components/ui/Button'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { localePath, type AppDictionary, type ContentLocale } from '@/modules/platform'

import { HeroArtwork } from './HeroArtwork'

export function HomeHero({
  description,
  dictionary,
  locale,
  seriesHref,
}: {
  description: string
  dictionary: AppDictionary
  locale: ContentLocale
  seriesHref?: string
}) {
  return (
    <section className="grid items-center gap-10 py-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 lg:py-18">
      <div className="relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-brand sm:text-sm">
          {dictionary.home.eyebrow}
        </p>
        <h1 className="zi-text-balance mt-5 max-w-3xl text-4xl font-black leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[3.75rem]">
          {dictionary.home.heading}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
          {description || dictionary.home.intro}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={localePath(locale, '/posts')}>
            {dictionary.home.primaryCta}
            <ArrowRightIcon />
          </ButtonLink>
          {seriesHref ? (
            <ButtonLink href={seriesHref} variant="secondary">
              {dictionary.home.secondaryCta}
              <span aria-hidden="true">⌘</span>
            </ButtonLink>
          ) : null}
        </div>
      </div>
      <HeroArtwork />
    </section>
  )
}

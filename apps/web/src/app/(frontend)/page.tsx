import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { detectContentLocale, LOCALE_COOKIE_NAME, localePath } from '@/modules/platform'

export default async function LocaleRedirectPage() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
  const locale = detectContentLocale({
    acceptLanguage: headerStore.get('accept-language'),
    cookie: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
  })
  redirect(localePath(locale))
}

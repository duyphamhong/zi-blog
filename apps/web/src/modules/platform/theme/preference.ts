export const THEME_COOKIE_NAME = 'zi-blog-theme'

export type ThemePreference = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

export function resolveThemePreference(input: {
  preference: ThemePreference
  prefersDark: boolean
}): ResolvedTheme {
  if (input.preference === 'system') return input.prefersDark ? 'dark' : 'light'
  return input.preference
}

import { env } from '@/config/env'

export function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/api/media/file/')) {
      return `${parsed.pathname}${parsed.search}`
    }
    return url
  }
  return new URL(url, env.SERVER_URL).toString()
}

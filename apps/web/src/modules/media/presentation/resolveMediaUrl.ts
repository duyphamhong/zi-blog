import { env } from '@/config/env'

export function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return new URL(url, env.SERVER_URL).toString()
}

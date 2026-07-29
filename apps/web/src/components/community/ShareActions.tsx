'use client'

type Props = { canonicalUrl: string; linkedInLabel: string; postId: number | string; title: string; xLabel: string }

function sessionId(): string {
  const key = 'zi-blog-analytics-session'
  const value = window.sessionStorage.getItem(key)
  if (value) return value
  const created = crypto.randomUUID()
  window.sessionStorage.setItem(key, created)
  return created
}

function record(postId: number | string, channel: 'linkedin' | 'x'): void {
  void fetch('/api/analytics/events', { body: JSON.stringify({ eventType: 'share', metadata: { channel }, postId: String(postId), sessionId: sessionId() }), headers: { 'content-type': 'application/json' }, keepalive: true, method: 'POST' })
}

export function ShareActions({ canonicalUrl, linkedInLabel, postId, title, xLabel }: Props) {
  return <div className="mt-10 flex flex-wrap gap-4 text-sm"><a className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`} onClick={() => record(postId, 'linkedin')}>{linkedInLabel}</a><a className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300" href={`https://x.com/intent/post?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(title)}`} onClick={() => record(postId, 'x')}>{xLabel}</a></div>
}

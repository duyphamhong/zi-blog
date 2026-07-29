'use client'

import { useEffect } from 'react'

type Props = { postId: number | string }
const MINIMUM_VIEW_MS = 5000

export function ArticleViewTracker({ postId }: Props) {
  useEffect(() => {
    let interacted = false
    const sessionKey = 'zi-blog-analytics-session'
    const sessionId = window.sessionStorage.getItem(sessionKey) ?? crypto.randomUUID()
    window.sessionStorage.setItem(sessionKey, sessionId)
    const markInteraction = () => { interacted = true }
    window.addEventListener('scroll', markInteraction, { once: true, passive: true })
    window.addEventListener('pointerdown', markInteraction, { once: true })
    const timer = window.setTimeout(() => { if (interacted && document.visibilityState === 'visible') void fetch('/api/analytics/events', { body: JSON.stringify({ eventType: 'article_view', postId: String(postId), sessionId }), headers: { 'content-type': 'application/json' }, keepalive: true, method: 'POST' }) }, MINIMUM_VIEW_MS)
    return () => { window.clearTimeout(timer); window.removeEventListener('scroll', markInteraction); window.removeEventListener('pointerdown', markInteraction) }
  }, [postId])
  return null
}

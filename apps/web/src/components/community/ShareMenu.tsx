'use client'

import { useEffect, useRef, useState } from 'react'

type Channel = 'linkedin' | 'facebook' | 'x' | 'copy_link' | 'native'
type Props = {
  canonicalUrl: string
  labels: {
    copiedLink: string
    copyLink: string
    nativeShare: string
    share: string
    shareArticle: string
    shareFacebook: string
    shareLinkedIn: string
    shareX: string
  }
  postId: number | string
  title: string
}

function getSessionId(): string {
  const key = 'zi-blog-analytics-session'
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const value = crypto.randomUUID()
  window.sessionStorage.setItem(key, value)
  return value
}

function record(postId: number | string, channel: Channel): void {
  void fetch('/api/analytics/events', {
    body: JSON.stringify({
      eventType: 'share',
      metadata: { channel },
      postId: String(postId),
      sessionId: getSessionId(),
    }),
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    method: 'POST',
  })
}

export function ShareMenu({ canonicalUrl, labels, postId, title }: Props) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const nativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(canonicalUrl)
    record(postId, 'copy_link')
    setCopied(true)
    setOpen(false)
  }
  async function native(): Promise<void> {
    await navigator.share({ title, url: canonicalUrl })
    record(postId, 'native')
    setOpen(false)
  }
  const action = (label: string, handler: () => void | Promise<void>) => (
    <button
      className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      onClick={() => void handler()}
      role="menuitem"
      type="button"
    >
      {label}
    </button>
  )
  return (
    <div className="relative" ref={container}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border-strong bg-surface px-4 text-sm font-bold text-text-primary transition hover:border-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span aria-hidden="true">↗</span>
        {labels.share}
      </button>
      {copied ? (
        <p
          className="absolute right-0 top-12 z-10 whitespace-nowrap rounded-lg bg-text-primary px-3 py-2 text-sm text-white"
          role="status"
        >
          {labels.copiedLink}
        </p>
      ) : null}
      {open ? (
        <div
          aria-label={labels.shareArticle}
          className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl"
          role="menu"
        >
          {action(labels.shareLinkedIn, () => {
            record(postId, 'linkedin')
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
              '_blank',
              'noopener,noreferrer',
            )
            setOpen(false)
          })}
          {action(labels.shareFacebook, () => {
            record(postId, 'facebook')
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
              '_blank',
              'noopener,noreferrer',
            )
            setOpen(false)
          })}
          {action(labels.shareX, () => {
            record(postId, 'x')
            window.open(
              `https://x.com/intent/post?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(title)}`,
              '_blank',
              'noopener,noreferrer',
            )
            setOpen(false)
          })}
          {action(labels.copyLink, copy)}
          {nativeShare ? action(labels.nativeShare, native) : null}
        </div>
      ) : null}
    </div>
  )
}

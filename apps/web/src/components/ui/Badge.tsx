import type { ComponentPropsWithoutRef } from 'react'

export function Badge({
  className = '',
  tone = 'brand',
  ...props
}: ComponentPropsWithoutRef<'span'> & { tone?: 'brand' | 'neutral' }) {
  const toneClass =
    tone === 'brand' ? 'bg-brand-soft text-brand' : 'bg-canvas-subtle text-text-secondary'
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[0.6875rem] font-black uppercase tracking-[0.08em] ${toneClass} ${className}`}
      {...props}
    />
  )
}

import type { ComponentPropsWithoutRef } from 'react'

export function Surface({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={`rounded-card border border-border-subtle bg-surface shadow-card ${className}`}
      {...props}
    />
  )
}

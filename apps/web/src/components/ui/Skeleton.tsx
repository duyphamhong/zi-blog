import type { ComponentPropsWithoutRef } from 'react'

export function Skeleton({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-border-subtle motion-reduce:animate-none ${className}`}
      {...props}
    />
  )
}

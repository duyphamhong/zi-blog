import type { ComponentPropsWithoutRef } from 'react'

export function Container({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`} {...props} />
}

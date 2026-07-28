import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-sm hover:bg-brand-hover hover:shadow-md active:translate-y-px',
  quiet: 'text-brand hover:bg-brand-soft active:bg-brand-soft-strong',
  secondary:
    'border border-border-strong bg-surface text-text-primary hover:border-brand hover:text-brand active:bg-brand-soft',
}

export function buttonClassName(variant: ButtonVariant = 'primary', className = ''): string {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-extrabold transition duration-200 motion-reduce:transition-none ${variants[variant]} ${className}`
}

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant }) {
  return <button className={buttonClassName(variant, className)} {...props} />
}

export function ButtonLink({
  className = '',
  variant = 'primary',
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClassName(variant, className)} {...props} />
}

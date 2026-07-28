import { forwardRef, type ComponentPropsWithoutRef } from 'react'

export const IconButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function IconButton({ className = '', ...props }, ref) {
    return (
      <button
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-control border border-border-subtle bg-surface text-text-primary transition hover:border-brand hover:bg-brand-soft hover:text-brand motion-reduce:transition-none ${className}`}
        ref={ref}
        {...props}
      />
    )
  },
)

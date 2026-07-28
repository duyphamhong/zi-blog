import Link from 'next/link'
import type { ReactNode } from 'react'

export function SectionHeading({
  action,
  eyebrow,
  href,
  id,
  icon,
  title,
}: {
  action?: string
  eyebrow?: string
  href?: string
  id?: string
  icon?: ReactNode
  title: string
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5">
      <div>
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
        ) : null}
        <h2
          className={`${eyebrow ? 'mt-2' : ''} flex items-center gap-3 text-2xl font-black sm:text-3xl`}
          id={id}
        >
          {icon}
          {title}
        </h2>
      </div>
      {action && href ? (
        <Link className="shrink-0 text-sm font-extrabold text-brand hover:underline" href={href}>
          {action} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  )
}

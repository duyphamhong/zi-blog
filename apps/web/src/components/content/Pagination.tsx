import Link from 'next/link'
import type { AppDictionary } from '@/modules/platform'

export function Pagination({
  basePath,
  hasNextPage,
  hasPrevPage,
  page,
  query,
  totalPages,
  dictionary,
}: {
  basePath: string
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  query?: Record<string, string>
  totalPages: number
  dictionary: AppDictionary
}) {
  if (totalPages <= 1) return null
  const href = (target: number) => {
    const search = new URLSearchParams({ ...query, page: String(target) })
    return `${basePath}?${search.toString()}`
  }

  return (
    <nav
      aria-label={dictionary.pagination.label}
      className="mt-10 flex items-center justify-between"
    >
      {hasPrevPage ? (
        <Link
          className="rounded-lg border px-4 py-2 font-semibold hover:bg-slate-100"
          href={href(page - 1)}
        >
          {dictionary.pagination.previous}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-slate-600 dark:text-slate-300">
        {dictionary.common.page} {page} {dictionary.pagination.of} {totalPages}
      </span>
      {hasNextPage ? (
        <Link
          className="rounded-lg border px-4 py-2 font-semibold hover:bg-slate-100"
          href={href(page + 1)}
        >
          {dictionary.pagination.next}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

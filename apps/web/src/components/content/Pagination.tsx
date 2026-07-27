import Link from 'next/link'

export function Pagination({
  basePath,
  hasNextPage,
  hasPrevPage,
  page,
  query,
  totalPages,
}: {
  basePath: string
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  query?: Record<string, string>
  totalPages: number
}) {
  if (totalPages <= 1) return null
  const href = (target: number) => {
    const search = new URLSearchParams({ ...query, page: String(target) })
    return `${basePath}?${search.toString()}`
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
      {hasPrevPage ? (
        <Link
          className="rounded-lg border px-4 py-2 font-semibold hover:bg-slate-100"
          href={href(page - 1)}
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Page {page} of {totalPages}
      </span>
      {hasNextPage ? (
        <Link
          className="rounded-lg border px-4 py-2 font-semibold hover:bg-slate-100"
          href={href(page + 1)}
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

export function EmptyState({
  description,
  title = 'Nothing here yet',
}: {
  description: string
  title?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
      <h2 className="text-xl font-extrabold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  )
}

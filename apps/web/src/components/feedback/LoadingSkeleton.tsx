export function LoadingSkeleton({ label = 'Loading content' }: { label?: string }) {
  return (
    <div aria-label={label} className="grid animate-pulse gap-6 md:grid-cols-3" role="status">
      {[1, 2, 3].map((item) => (
        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" key={item} />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  )
}

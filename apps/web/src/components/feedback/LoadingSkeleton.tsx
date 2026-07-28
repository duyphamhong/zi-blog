import { Skeleton } from '@/components/ui/Skeleton'

export function LoadingSkeleton({ label = 'Loading content' }: { label?: string }) {
  return (
    <div aria-label={label} role="status">
      <div className="grid items-center gap-8 py-8 lg:grid-cols-2">
        <div>
          <Skeleton className="h-4 w-52" />
          <Skeleton className="mt-6 h-14 w-full max-w-lg" />
          <Skeleton className="mt-3 h-14 w-4/5 max-w-md" />
          <Skeleton className="mt-7 h-6 w-full max-w-xl" />
          <Skeleton className="mt-3 h-6 w-3/4 max-w-lg" />
        </div>
        <Skeleton className="aspect-[1.3/1] w-full" />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton className="h-80" key={item} />
        ))}
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  )
}

import { Surface } from '@/components/ui/Surface'

export function EmptyState({ description, title }: { description: string; title?: string }) {
  return (
    <Surface className="border-dashed px-6 py-14 text-center shadow-none">
      {title ? <h2 className="text-xl font-extrabold">{title}</h2> : null}
      <p className="mx-auto mt-3 max-w-xl text-text-secondary">{description}</p>
    </Surface>
  )
}

import Image from 'next/image'

import type { PublicMedia } from '@/modules/content'
import { resolveMediaUrl } from '@/modules/media'

export function ResponsiveMedia({
  className = '',
  media,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: {
  className?: string
  media: PublicMedia
  priority?: boolean
  sizes?: string
}) {
  return (
    <Image
      alt={media.alt}
      className={className}
      height={media.height || 720}
      priority={priority}
      sizes={sizes}
      src={resolveMediaUrl(media.url)}
      width={media.width || 1280}
    />
  )
}

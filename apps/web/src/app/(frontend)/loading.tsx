import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Container } from '@/components/layout/Container'

export default function Loading() {
  return (
    <Container className="py-12">
      <LoadingSkeleton />
    </Container>
  )
}

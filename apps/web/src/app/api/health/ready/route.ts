import { getPayloadClient } from '@/shared/payload/client'

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadClient()
    await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    })
    return Response.json({ checks: { configuration: 'ok', database: 'ok' }, status: 'ready' })
  } catch (error) {
    console.error(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown readiness error',
        operation: 'health.ready',
      }),
    )
    return Response.json(
      { checks: { configuration: 'ok', database: 'failed' }, status: 'not_ready' },
      { status: 503 },
    )
  }
}

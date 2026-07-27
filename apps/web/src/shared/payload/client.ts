import config from '@payload-config'
import { getPayload } from 'payload'

let payloadPromise: ReturnType<typeof getPayload> | null = null

export function getPayloadClient(): ReturnType<typeof getPayload> {
  payloadPromise ??= getPayload({ config })
  return payloadPromise
}

import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './index'

const payload = await getPayload({ config })
let exitCode = 0

try {
  await seed(payload)
} catch (error) {
  payload.logger.error({
    err: error,
    msg: 'Seed failed',
  })
  exitCode = 1
} finally {
  await Promise.race([
    payload.destroy(),
    new Promise<void>((resolve) => {
      setTimeout(resolve, 2000)
    }),
  ])
  process.exit(exitCode)
}

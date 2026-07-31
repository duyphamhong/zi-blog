import { readFile } from 'node:fs/promises'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { BilingualPostImportService } from '@/modules/content/application/import-bilingual-post.service'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  await payload.destroy()
})

describe('bilingual Markdown import', () => {
  it('converts the supplied Solution Architect articles', async () => {
    const [vietnamese, english] = await Promise.all([
      readFile('G:/Projects/Blogs/contents/solution-architect-thuc-thu-v4-vi.md', 'utf8'),
      readFile('G:/Projects/Blogs/contents/real-solution-architect-v4-en.md', 'utf8'),
    ])
    const preview = await new BilingualPostImportService(payload).validate({
      english: { fileName: 'real-solution-architect-v4-en.md', locale: 'en', source: english },
      vietnamese: { fileName: 'solution-architect-thuc-thu-v4-vi.md', locale: 'vi', source: vietnamese },
    })
    expect(preview.vi.title).toContain('Solution Architect')
    expect(preview.en.title).toContain('Real Solution Architect')
  })
})

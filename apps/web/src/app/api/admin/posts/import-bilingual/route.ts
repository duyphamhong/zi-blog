import { NextResponse } from 'next/server'

import { BilingualPostImportService, type MarkdownImportFile } from '@/modules/content/application/import-bilingual-post.service'
import { MarkdownImportError } from '@/modules/content/markdown-import/markdown-import.errors'
import { getActor, type Actor } from '@/modules/identity'
import { getPayloadClient } from '@/shared/payload/client'
import type { User } from '@/payload-types'

const MAX_FILE_BYTES = 2 * 1024 * 1024

function isMarkdownName(name: string): boolean {
  return /\.(?:md|markdown)$/iu.test(name)
}

async function readFile(file: FormDataEntryValue | null, locale: 'vi' | 'en'): Promise<MarkdownImportFile> {
  if (!(file instanceof File) || !isMarkdownName(file.name)) throw new MarkdownImportError('INVALID_SOURCE_TYPE')
  if (file.size === 0 || file.size > MAX_FILE_BYTES) throw new MarkdownImportError('INVALID_SOURCE_TYPE')
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes.includes(0)) throw new MarkdownImportError('INVALID_SOURCE_TYPE')
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  return { fileName: file.name, locale, source }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: request.headers })
    const actor = getActor(user)
    if (!actor) throw new MarkdownImportError('UNAUTHORIZED_IMPORT')
    const form = await request.formData()
    const operation = form.get('operation')
    if (operation !== 'validate' && operation !== 'import') throw new MarkdownImportError('INVALID_SOURCE_TYPE')
    const [vietnamese, english] = await Promise.all([
      readFile(form.get('viFile'), 'vi'),
      readFile(form.get('enFile'), 'en'),
    ])
    const service = new BilingualPostImportService(payload)
    if (operation === 'validate') return NextResponse.json({ success: true, preview: await service.validate({ english, vietnamese }) })
    const result = await service.createDraft({ actor: user as User & Actor, english, vietnamese })
    return NextResponse.json({ success: true, postId: result.postId, status: result.status, preview: result.preview, editUrl: `/admin/collections/posts/${result.postId}` })
  } catch (error) {
    if (error instanceof MarkdownImportError) {
      const payload = await getPayloadClient()
      payload.logger.error({
        category: error.code,
        cause: error.cause instanceof Error ? error.cause.message : undefined,
        msg: 'Bilingual Markdown import failed',
      })
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.code === 'UNAUTHORIZED_IMPORT' ? 403 : 400 })
    }
    return NextResponse.json({ error: { code: 'DRAFT_CREATION_FAILED', message: 'Bilingual draft import failed.' } }, { status: 500 })
  }
}

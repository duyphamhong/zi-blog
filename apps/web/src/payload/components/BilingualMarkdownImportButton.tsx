'use client'

import { Button, Drawer, useFormFields, useModal, useFormModified } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const modalSlug = 'bilingual-markdown-import'

type Preview = { title: string; slug: string; excerpt: string; wordCount: number; readingTimeMinutes: number; headingCount: number; codeBlockCount: number }
type Response = { error?: { message: string }; preview?: { vi: Preview; en: Preview }; editUrl?: string }

export function BilingualMarkdownImportButton({ id }: { id?: number | string }) {
  const { openModal, closeModal } = useModal()
  const router = useRouter()
  const modified = useFormModified()
  const viRef = useRef<HTMLInputElement>(null)
  const enRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Response['preview']>()
  const isBlankDraft = useFormFields(([fields]) => {
    const values = ['title', 'slug', 'excerpt', 'content'].map((path) => fields[path]?.value)
    return values.every((value) => value === null || value === undefined || value === '')
  })
  // Payload autosave turns a create URL into a blank temporary draft. Keep the
  // action available for that untouched draft but hide it on normal edit pages.
  if (id && !isBlankDraft) return null

  async function submit(operation: 'validate' | 'import') {
    const viFile = viRef.current?.files?.[0]
    const enFile = enRef.current?.files?.[0]
    if (!viFile || !enFile) { setError('Select one Vietnamese and one English Markdown file.'); return }
    setBusy(true); setError(null)
    const form = new FormData(); form.set('operation', operation); form.set('viFile', viFile); form.set('enFile', enFile)
    const response = await fetch('/api/admin/posts/import-bilingual', { body: form, method: 'POST' })
    const body = await response.json() as Response
    setBusy(false)
    if (!response.ok) { setError(body.error?.message ?? 'Import failed.'); return }
    if (operation === 'validate') setPreview(body.preview)
    else if (body.editUrl) router.push(body.editUrl)
  }

  function open() {
    if (modified && !window.confirm('Unsaved Create Post changes will not be included in this import. Continue?')) return
    openModal(modalSlug)
  }

  return <>
    <Button buttonStyle="secondary" onClick={open} type="button">Import VI + EN Markdown</Button>
    <Drawer slug={modalSlug} title="Import bilingual Markdown">
      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '44rem', padding: '1.5rem 0' }}>
        <p style={{ color: 'var(--theme-elevation-600)', margin: 0 }}>Upload one Markdown article for each locale. Both files are validated before a draft is created.</p>
        {error ? <p id="bilingual-import-error" role="alert" style={{ color: 'var(--theme-error-500)', margin: 0 }}>{error}</p> : null}
        <label style={{ display: 'grid', fontWeight: 600, gap: '0.5rem' }}>Vietnamese Markdown
          <input ref={viRef} accept=".md,.markdown,text/markdown,text/plain" style={{ fontWeight: 400 }} type="file" onChange={() => { setPreview(undefined); setError(null) }} />
        </label>
        <label style={{ display: 'grid', fontWeight: 600, gap: '0.5rem' }}>English Markdown
          <input ref={enRef} accept=".md,.markdown,text/markdown,text/plain" style={{ fontWeight: 400 }} type="file" onChange={() => { setPreview(undefined); setError(null) }} />
        </label>
        {preview ? <div style={{ display: 'grid', gap: '0.75rem' }}>{(['vi', 'en'] as const).map(locale => <section key={locale} style={{ background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-150)', borderRadius: '4px', padding: '1rem' }}><h3 style={{ margin: '0 0 0.5rem' }}>{locale === 'vi' ? 'Vietnamese' : 'English'}</h3><p style={{ margin: '0 0 0.5rem' }}>{preview[locale].title} · {preview[locale].slug}</p><p style={{ color: 'var(--theme-elevation-600)', margin: 0 }}>{preview[locale].wordCount} words · {preview[locale].readingTimeMinutes} min · {preview[locale].headingCount} headings · {preview[locale].codeBlockCount} code blocks</p></section>)}</div> : null}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}><Button buttonStyle="secondary" disabled={busy} onClick={() => closeModal(modalSlug)} type="button">Cancel</Button>{preview ? <Button disabled={busy} onClick={() => void submit('import')} type="button">Import as Draft</Button> : <Button disabled={busy} onClick={() => void submit('validate')} type="button">{busy ? 'Validating…' : 'Validate and Preview'}</Button>}</div>
      </div>
    </Drawer>
  </>
}

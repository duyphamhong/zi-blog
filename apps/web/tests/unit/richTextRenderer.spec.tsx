// @vitest-environment jsdom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { RichTextRenderer } from '@/components/content/RichTextRenderer'
import type { Post } from '@/payload-types'

const textNode = (text: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

describe('RichTextRenderer', () => {
  it('renders paragraph, heading, link, upload, and code nodes safely', () => {
    const content = {
      root: {
        children: [
          {
            children: [textNode('Paragraph text')],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            children: [textNode('Heading text')],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            type: 'heading',
            version: 1,
          },
          {
            children: [
              {
                children: [textNode('Payload docs')],
                direction: 'ltr',
                fields: {
                  linkType: 'custom',
                  newTab: false,
                  url: 'https://payloadcms.com',
                },
                format: '',
                indent: 0,
                type: 'link',
                version: 3,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            relationTo: 'media',
            type: 'upload',
            value: {
              alt: 'Payload logo',
              createdAt: '2026-07-28T00:00:00.000Z',
              height: 400,
              id: 1,
              filename: 'payload.webp',
              mimeType: 'image/webp',
              updatedAt: '2026-07-28T00:00:00.000Z',
              url: '/api/media/file/payload.webp',
              width: 800,
            },
            version: 3,
          },
          {
            fields: {
              blockType: 'code',
              code: 'const safe = true',
              language: 'typescript',
            },
            format: '',
            type: 'block',
            version: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as Post['content']

    const markup = renderToStaticMarkup(<RichTextRenderer content={content} />)
    expect(markup).toContain('Paragraph text')
    expect(markup).toContain('<h2')
    expect(markup).toContain('https://payloadcms.com')
    expect(markup).toContain('Payload logo')
    expect(markup).toContain('const')
    expect(markup).not.toContain('<script')
  })
})

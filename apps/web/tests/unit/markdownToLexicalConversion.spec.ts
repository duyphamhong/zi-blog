import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { describe, expect, it } from 'vitest'

import { postContentEditor } from '@/payload/fields/postContentEditor'

type NodeRecord = {
  [key: string]: unknown
  children?: unknown[]
  type?: unknown
}

function collectNodes(value: unknown): NodeRecord[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  const node = Object.fromEntries(Object.entries(value))
  const children = Array.isArray(node.children) ? node.children.flatMap(collectNodes) : []
  return [node, ...children]
}

describe('Payload Markdown to Lexical conversion', () => {
  it('uses the post editor configuration for representative Markdown nodes', async () => {
    const sanitizedConfig = await config
    const editorConfig = await editorConfigFactory.fromEditor({
      config: sanitizedConfig,
      editor: postContentEditor,
      parentIsLocalized: true,
    })
    const result = convertMarkdownToLexical({
      editorConfig,
      markdown: [
        'Paragraph with **bold**, *italic*, `inline code`, and [a link](https://example.com).',
        '',
        '## Heading two',
        '### Heading three',
        '#### Heading four',
        '',
        '- Unordered',
        '    - Nested',
        '',
        '1. Ordered',
        '2. Second',
        '',
        '> Quoted text',
        '',
        '---',
        '',
        '```typescript',
        'const imported: boolean = true',
        '```',
      ].join('\n'),
    })

    expect(result.root).toMatchObject({
      children: expect.any(Array),
      type: 'root',
    })

    const nodes = collectNodes(result.root)
    expect(nodes.some(({ type }) => type === 'paragraph')).toBe(true)
    expect(nodes.filter(({ type }) => type === 'heading').map(({ tag }) => tag)).toEqual([
      'h2',
      'h3',
      'h4',
    ])
    expect(nodes.some(({ type }) => type === 'link')).toBe(true)
    expect(nodes.some(({ type }) => type === 'quote')).toBe(true)
    expect(nodes.some(({ type }) => type === 'horizontalrule')).toBe(true)
    expect(
      nodes.some(
        ({ fields, type }) =>
          type === 'block' &&
          fields &&
          typeof fields === 'object' &&
          'blockType' in fields &&
          fields.blockType === 'code' &&
          'language' in fields &&
          fields.language === 'typescript' &&
          'code' in fields &&
          fields.code === 'const imported: boolean = true',
      ),
    ).toBe(true)

    const lists = nodes.filter(({ type }) => type === 'list')
    expect(lists.some(({ listType }) => listType === 'bullet')).toBe(true)
    expect(lists.some(({ listType }) => listType === 'number')).toBe(true)
    expect(lists.length).toBeGreaterThanOrEqual(3)

    const formattedText = nodes.filter(({ type }) => type === 'text')
    expect(
      formattedText.some(({ format }) => typeof format === 'number' && (format & 1) === 1),
    ).toBe(true)
    expect(
      formattedText.some(({ format }) => typeof format === 'number' && (format & 2) === 2),
    ).toBe(true)
    expect(
      formattedText.some(({ format }) => typeof format === 'number' && (format & 16) === 16),
    ).toBe(true)
  })
})

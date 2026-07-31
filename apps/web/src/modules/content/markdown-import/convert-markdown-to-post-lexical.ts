import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { RichTextField, SanitizedConfig } from 'payload'

import { postContentEditor } from '@/payload/fields/postContentEditor'

function isPostContentField(field: unknown): field is RichTextField {
  return Boolean(field && typeof field === 'object' && 'type' in field && field.type === 'richText' && 'name' in field && field.name === 'content')
}

export function convertMarkdownToPostLexical(markdown: string, config?: SanitizedConfig): unknown {
  const contentField = config?.collections.find(({ slug }) => slug === 'posts')?.fields.find(isPostContentField) ?? {
    editor: postContentEditor, name: 'content', type: 'richText',
  }
  return convertMarkdownToLexical({
    editorConfig: editorConfigFactory.fromField({ field: contentField }),
    markdown,
  })
}

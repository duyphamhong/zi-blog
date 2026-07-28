import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import {
  APIError,
  type CollectionBeforeChangeHook,
  type RichTextField,
  type SanitizedConfig,
} from 'payload'

import {
  importMarkdownIntoPost,
  MarkdownImportError,
  type MarkdownImportPostData,
} from '@/modules/content/markdown-import'

function isPostContentField(field: unknown): field is RichTextField {
  return Boolean(
    field &&
      typeof field === 'object' &&
      'type' in field &&
      field.type === 'richText' &&
      'name' in field &&
      field.name === 'content',
  )
}

function asMarkdownImportPostData(value: unknown): MarkdownImportPostData | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : null
}

function getPostContentEditorConfig(config: SanitizedConfig) {
  const posts = config.collections.find(({ slug }) => slug === 'posts')
  const contentField = posts?.fields.find(isPostContentField)

  if (!contentField) {
    throw new MarkdownImportError('LEXICAL_CONVERSION_FAILED')
  }

  return editorConfigFactory.fromField({ field: contentField })
}

export const importPostMarkdown: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  try {
    const editorConfig = getPostContentEditorConfig(req.payload.config)
    const result = importMarkdownIntoPost({
      convertMarkdown: (markdown) =>
        convertMarkdownToLexical({
          editorConfig,
          markdown,
        }),
      data,
      operation,
      originalDoc: asMarkdownImportPostData(originalDoc),
    })

    return result.data
  } catch (error) {
    if (!(error instanceof MarkdownImportError)) throw error

    req.payload.logger.error({
      actorId: req.user?.id,
      category: error.code,
      collection: 'posts',
      documentId: originalDoc?.id,
      err: error,
      msg: 'Post Markdown import failed',
      operation,
    })

    throw new APIError(
      error.message,
      400,
      {
        code: error.code,
      },
      true,
    )
  }
}

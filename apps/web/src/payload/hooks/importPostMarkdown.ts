import {
  APIError,
  type CollectionBeforeChangeHook,
} from 'payload'

import {
  importMarkdownIntoPost,
  MarkdownImportError,
  type MarkdownImportPostData,
} from '@/modules/content/markdown-import'
import { convertMarkdownToPostLexical } from '@/modules/content/markdown-import/convert-markdown-to-post-lexical'

function asMarkdownImportPostData(value: unknown): MarkdownImportPostData | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : null
}

export const importPostMarkdown: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  try {
    const result = importMarkdownIntoPost({
      convertMarkdown: (markdown) => convertMarkdownToPostLexical(markdown, req.payload.config),
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

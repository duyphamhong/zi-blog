export type MarkdownImportErrorCode =
  | 'EMPTY_CONTENT'
  | 'EMPTY_REQUIRED_METADATA'
  | 'H1_NOT_ALLOWED'
  | 'INVALID_LEXICAL_DOCUMENT'
  | 'INVALID_SOURCE_TYPE'
  | 'LEXICAL_CONVERSION_FAILED'
  | 'MISSING_CONTENT_DELIMITER'

const errorMessages: Record<MarkdownImportErrorCode, string> = {
  EMPTY_CONTENT: 'add Markdown content after the standalone CONTENT: line.',
  EMPTY_REQUIRED_METADATA: 'provide a value for each included TITLE, SLUG, and EXCERPT key.',
  H1_NOT_ALLOWED: 'use headings H2 through H4 in article content; the post title is the H1.',
  INVALID_LEXICAL_DOCUMENT: 'the Markdown converter returned an invalid document.',
  INVALID_SOURCE_TYPE: 'paste the article as text in the Markdown source field.',
  LEXICAL_CONVERSION_FAILED: 'the Markdown could not be converted to Content.',
  MISSING_CONTENT_DELIMITER: 'add a standalone CONTENT: line before the article body.',
}

export class MarkdownImportError extends Error {
  readonly code: MarkdownImportErrorCode

  constructor(code: MarkdownImportErrorCode, options?: ErrorOptions) {
    super(`Markdown import failed: ${errorMessages[code]}`, options)
    this.name = 'MarkdownImportError'
    this.code = code
  }
}

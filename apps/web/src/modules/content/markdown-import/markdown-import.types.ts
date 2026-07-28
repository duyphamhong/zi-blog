export type ParsedZiBlogMarkdown = {
  content: string
  excerpt?: string
  seoDescription?: string
  seoTitle?: string
  slug?: string
  title?: string
}

export type MarkdownImportPostData = {
  [key: string]: unknown
  importMarkdownIntoContent?: unknown
  lastImportedMarkdownHash?: unknown
  markdownSource?: unknown
  seo?: unknown
}

export type LexicalDocument = {
  [key: string]: unknown
  root: {
    [key: string]: unknown
    children: unknown[]
    type: 'root'
  }
}

export type ConvertMarkdownToLexical = (markdown: string) => unknown

export type ImportMarkdownIntoPostInput = {
  convertMarkdown: ConvertMarkdownToLexical
  data: MarkdownImportPostData
  operation: 'create' | 'update'
  originalDoc?: MarkdownImportPostData | null
}

export type MarkdownImportSkipReason = 'empty-source' | 'not-requested'

export type ImportMarkdownIntoPostResult = {
  data: MarkdownImportPostData
  imported: boolean
  reason?: MarkdownImportSkipReason
}

import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { CodeBlock as CodeBlockData, Post } from '@/payload-types'
import type { ContentLocale } from '@/modules/platform'
import { enDictionary } from '@/modules/platform/i18n/dictionaries/en'
import { viDictionary } from '@/modules/platform/i18n/dictionaries/vi'

import { CodeBlock } from './CodeBlock'

type BlogNodeTypes = DefaultNodeTypes | SerializedBlockNode<CodeBlockData>

export function RichTextRenderer({
  content,
  locale = 'en',
}: {
  content: Post['content']
  locale?: ContentLocale
}) {
  const dictionary = locale === 'vi' ? viDictionary : enDictionary
  const converters: JSXConvertersFunction<BlogNodeTypes> = ({ defaultConverters }) => ({
    ...defaultConverters,
    blocks: {
      code: ({ node }) => (
        <CodeBlock
          code={node.fields.code}
          copiedLabel={dictionary.code.copied}
          copyLabel={dictionary.code.copy}
          filename={node.fields.filename}
          language={node.fields.language}
        />
      ),
    },
  })
  return (
    <RichText
      className="prose prose-slate max-w-none dark:prose-invert prose-a:text-cyan-700 dark:prose-a:text-cyan-300"
      converters={converters}
      data={content}
    />
  )
}

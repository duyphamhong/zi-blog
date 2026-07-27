import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { CodeBlock as CodeBlockData, Post } from '@/payload-types'

import { CodeBlock } from './CodeBlock'

type BlogNodeTypes = DefaultNodeTypes | SerializedBlockNode<CodeBlockData>

const converters: JSXConvertersFunction<BlogNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    code: ({ node }) => (
      <CodeBlock
        code={node.fields.code}
        filename={node.fields.filename}
        language={node.fields.language}
      />
    ),
  },
})

export function RichTextRenderer({ content }: { content: Post['content'] }) {
  return (
    <RichText
      className="prose prose-slate max-w-none dark:prose-invert prose-a:text-cyan-700 dark:prose-a:text-cyan-300"
      converters={converters}
      data={content}
    />
  )
}

import { CodeBlock as createPayloadCodeBlock } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

const payloadCodeBlock = createPayloadCodeBlock()

export const CodeBlock: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: {
    plural: 'Code blocks',
    singular: 'Code block',
  },
  fields: [
    {
      name: 'language',
      type: 'text',
      defaultValue: 'text',
      required: true,
    },
    {
      name: 'filename',
      type: 'text',
    },
    {
      name: 'code',
      type: 'code',
      required: true,
    },
  ],
  jsx: payloadCodeBlock.jsx,
}

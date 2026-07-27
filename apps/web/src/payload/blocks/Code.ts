import type { Block } from 'payload'

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
}

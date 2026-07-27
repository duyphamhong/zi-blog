import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: false,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'next-env.d.ts',
    'src/app/(payload)/admin/importMap.js',
    'src/payload/migrations/**',
    'src/payload-types.ts',
  ]),
])

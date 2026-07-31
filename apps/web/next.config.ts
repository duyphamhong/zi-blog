import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { env } from './src/config/env'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const mediaOrigin = new URL(env.SERVER_URL)
const mediaProtocol = mediaOrigin.protocol === 'https:' ? 'https' : 'http'
const mediaUsesLoopbackHost = ['localhost', '127.0.0.1', '[::1]'].includes(mediaOrigin.hostname)

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'standalone',
  // Payload's Markdown converter and the configured editor must share the same
  // Lexical module instance. Externalize the base package without bypassing
  // Payload's own server-side CSS handling.
  serverExternalPackages: ['lexical'],
  images: {
    dangerouslyAllowLocalIP: mediaUsesLoopbackHost,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: [
      {
        hostname: mediaOrigin.hostname,
        pathname: '/api/media/file/**',
        port: mediaOrigin.port,
        protocol: mediaProtocol,
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname, '../..'),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

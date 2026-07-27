import { config as loadDotEnv } from 'dotenv'
import path from 'node:path'

const workspaceEnv = path.resolve(process.cwd(), '../../.env')
const packageEnv = path.resolve(process.cwd(), '.env')

loadDotEnv({ path: [packageEnv, workspaceEnv], quiet: true })

type NodeEnvironment = 'development' | 'production' | 'test'

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback
}

function booleanValue(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase()
  if (!value) return fallback
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`${name} must be "true" or "false"`)
}

function nodeEnvironment(): NodeEnvironment {
  const value = optional('NODE_ENV', 'development')
  if (value === 'development' || value === 'production' || value === 'test') return value
  throw new Error('NODE_ENV must be development, production, or test')
}

const serverUrl = new URL(required('NEXT_PUBLIC_SERVER_URL'))
const databaseUri = required('DATABASE_URI')
const payloadSecret = required('PAYLOAD_SECRET')

if (payloadSecret.length < 32) {
  throw new Error('PAYLOAD_SECRET must contain at least 32 characters')
}

export const env = Object.freeze({
  NODE_ENV: nodeEnvironment(),
  DATABASE_URI: databaseUri,
  PAYLOAD_SECRET: payloadSecret,
  SERVER_URL: serverUrl.origin,
  PORT: Number(optional('PORT', '3000')),
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
  ENABLE_SEED_SAMPLE_CONTENT: booleanValue('ENABLE_SEED_SAMPLE_CONTENT', true),
  SEED_ADMIN_EMAIL: optional('SEED_ADMIN_EMAIL', 'admin@example.com'),
  SEED_ADMIN_PASSWORD: optional('SEED_ADMIN_PASSWORD', 'change-me-locally'),
  SEED_ADMIN_NAME: optional('SEED_ADMIN_NAME', 'Administrator'),
})

export type AppEnvironment = typeof env

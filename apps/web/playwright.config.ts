import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import './src/config/env'

const testPort = process.env.PLAYWRIGHT_PORT ?? '3000'
const testBaseUrl = `http://localhost:${testPort}`
const testDistDir =
  process.env.PLAYWRIGHT_DIST_DIR ??
  (testPort === '3000' ? '.next' : `.next-playwright-${testPort}`)
const testServerCommand =
  process.env.PLAYWRIGHT_SERVER_MODE === 'production'
    ? 'corepack pnpm seed && corepack pnpm start'
    : 'corepack pnpm seed && corepack pnpm dev'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: testBaseUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: testServerCommand,
    env: {
      NEXT_DIST_DIR: testDistDir,
      NEXT_PUBLIC_SERVER_URL: testBaseUrl,
      PORT: testPort,
    },
    reuseExistingServer: true,
    stdout: 'pipe',
    timeout: 120_000,
    url: testBaseUrl,
  },
})

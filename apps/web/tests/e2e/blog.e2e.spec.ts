import { expect, test } from '@playwright/test'

test('homepage and published post render', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Build better systems')
  await expect(
    page.getByRole('link', { name: 'Start with a Modular Monolith' }).first(),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Start with a Modular Monolith' }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Start with a Modular Monolith')
})

test('draft URL is not publicly accessible', async ({ page }) => {
  await page.goto('/posts/draft-publication-boundary')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})

test('Payload Admin login and health endpoints load', async ({ page, request }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()

  const live = await request.get('/api/health/live')
  expect(live.ok()).toBe(true)
  expect(await live.json()).toEqual({ status: 'ok' })

  const ready = await request.get('/api/health/ready')
  expect(ready.ok()).toBe(true)
  await expect(ready.json()).resolves.toMatchObject({ status: 'ready' })
})

test('homepage remains usable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ height: 812, width: 375 })
  await page.goto('/')
  await expect(page.getByRole('link', { exact: true, name: 'Zi-Blog' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
})

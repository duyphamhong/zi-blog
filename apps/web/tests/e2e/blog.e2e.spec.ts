import { expect, test } from '@playwright/test'

test('homepage and published post render', async ({ page }) => {
  await page.goto('/vi')
  await expect(page).toHaveURL(/\/vi$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Xây dựng hệ thống')
  await expect(
    page.getByRole('link', { name: 'Bắt đầu với Modular Monolith' }).first(),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Bắt đầu với Modular Monolith' }).first().click()
  await expect(page).toHaveURL(/\/vi\/posts\/bat-dau-voi-modular-monolith$/, {
    timeout: 15_000,
  })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bắt đầu với Modular Monolith')
  await page.getByRole('button', { name: /English/ }).click()
  await expect(page).toHaveURL(/\/en\/posts\/modular-monolith-first$/, { timeout: 15_000 })
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Start with a Modular Monolith')
})

test('draft URL is not publicly accessible', async ({ page }) => {
  await page.goto('/vi/posts/kiem-thu-ranh-gioi-xuat-ban-ban-nhap')
  await expect(page.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeVisible()
})

test('Payload Admin login and health endpoints load', async ({ page, request }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: /login|đăng nhập/i })).toBeVisible({
    timeout: 15_000,
  })

  const live = await request.get('/api/health/live')
  expect(live.ok()).toBe(true)
  expect(await live.json()).toEqual({ status: 'ok' })

  const ready = await request.get('/api/health/ready')
  expect(ready.ok()).toBe(true)
  await expect(ready.json()).resolves.toMatchObject({ status: 'ready' })
})

test('homepage remains usable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ height: 812, width: 375 })
  await page.goto('/vi')
  await expect(page.getByRole('link', { exact: true, name: 'Zi-Blog' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible()
})

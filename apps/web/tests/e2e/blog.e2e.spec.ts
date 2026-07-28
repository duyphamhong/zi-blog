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

test('language switch tolerates browser-added root attributes', async ({ page }) => {
  const hydrationErrors: string[] = []
  page.on('console', (message) => {
    if (
      (message.type() === 'error' || message.type() === 'warning') &&
      message.text().includes('A tree hydrated but some attributes')
    ) {
      hydrationErrors.push(message.text())
    }
  })
  await page.addInitScript(() => {
    const markRoot = () => {
      document.documentElement?.setAttribute('data-browser-extension', 'enabled')
    }
    markRoot()
    if (!document.documentElement) {
      const observer = new MutationObserver(() => {
        markRoot()
        if (document.documentElement) observer.disconnect()
      })
      observer.observe(document, { childList: true })
    }
  })

  await page.goto('/en')
  await page.getByRole('button', { name: 'Change language: Tiếng Việt' }).click()
  await expect(page).toHaveURL(/\/vi$/, { timeout: 15_000 })
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  expect(hydrationErrors).toEqual([])
})

test('Payload Admin tolerates browser-added root attributes', async ({ page }) => {
  const hydrationErrors: string[] = []
  page.on('console', (message) => {
    if (
      (message.type() === 'error' || message.type() === 'warning') &&
      message.text().includes('A tree hydrated but some attributes')
    ) {
      hydrationErrors.push(message.text())
    }
  })

  await page.addInitScript(() => {
    const markRoot = () => {
      document.documentElement?.setAttribute('data-browser-extension', 'enabled')
    }
    markRoot()
    if (!document.documentElement) {
      const observer = new MutationObserver(() => {
        markRoot()
        if (document.documentElement) observer.disconnect()
      })
      observer.observe(document, { childList: true })
    }
  })

  await page.goto('/admin/login')
  await expect(page.getByRole('textbox', { name: 'Email *' })).toBeVisible({ timeout: 15_000 })
  expect(hydrationErrors).toEqual([])
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
  await page.setViewportSize({ height: 844, width: 390 })
  await page.goto('/vi')
  await expect(page.getByRole('link', { exact: true, name: 'Zi-Blog' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Mở trình đơn' }).click()
  await expect(page.getByRole('dialog', { name: 'Trình đơn' })).toBeVisible()
  await expect(
    page.getByRole('dialog', { name: 'Trình đơn' }).getByRole('navigation'),
  ).toBeVisible()
  await page
    .getByRole('dialog', { name: 'Trình đơn' })
    .getByRole('button', { name: 'Đóng' })
    .click()
  await expect(page.getByRole('dialog', { name: 'Trình đơn' })).not.toBeVisible()
})

test('header search reaches the localized search experience', async ({ page }) => {
  await page.goto('/vi')
  await page.getByRole('button', { name: 'Tìm theo tiêu đề hoặc tóm tắt' }).click()
  const dialog = page.getByRole('dialog', { name: 'Tìm kiếm' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('searchbox', { name: 'Tìm bài viết đã xuất bản' }).fill('modular')
  await dialog.getByRole('button', { name: 'Tìm kiếm' }).click()
  await expect(page).toHaveURL(/\/vi\/search\?q=modular$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Tìm kiếm' })).toBeVisible()
})

test('theme preference toggles and persists', async ({ page }) => {
  await page.goto('/vi')
  const root = page.locator('html')
  const startedDark = await root.evaluate((element) => element.classList.contains('dark'))
  await page.getByRole('button', { name: 'Đổi giao diện màu' }).click()
  await expect
    .poll(() => root.evaluate((element) => element.classList.contains('dark')))
    .toBe(!startedDark)
  await page.reload()
  await expect
    .poll(() => root.evaluate((element) => element.classList.contains('dark')))
    .toBe(!startedDark)
})

import { test, expect } from '@playwright/test'

test('React connects to the real FastAPI server across origins', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('BuildLog · 나의 학습 기록')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('배운 오늘을,')
  await expect(page.getByRole('status')).toHaveText('서버에 정상적으로 연결되었습니다.')
  await expect(page.getByRole('article')).toHaveCount(3)
  await expect(page.getByRole('button')).toHaveCount(0)
})

test('failed API request shows guidance and retry recovers', async ({ page }) => {
  await page.route('**/api/health', (route) => route.abort('connectionrefused'))
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('서버에 연결하지 못했습니다.')
  await page.unroute('**/api/health')
  await page.getByRole('button', { name: '다시 확인' }).click()
  await expect(page.getByRole('status')).toHaveText('서버에 정상적으로 연결되었습니다.')
})

test('unexpected API responses show failure rather than a false connection', async ({ page }) => {
  await page.route('**/api/health', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'ok', service: 'Other API' }),
  }))
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('서버에 연결하지 못했습니다.')
})

test('360px screen has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveText('서버에 정상적으로 연결되었습니다.')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true })
})

test('desktop home renders correctly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 960 })
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveText('서버에 정상적으로 연결되었습니다.')
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true })
})

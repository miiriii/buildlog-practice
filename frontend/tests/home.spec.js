import { test, expect } from '@playwright/test'

test('landing page connects to the real FastAPI server', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('BuildLog · 나의 학습 기록')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('배운 오늘을,')
  await expect(page.getByRole('status')).toHaveText('서버에 정상적으로 연결되었습니다.')
  await expect(page.getByRole('article')).toHaveCount(3)
  await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible()
})

test('failed health request shows guidance and retry recovers', async ({ page }) => {
  await page.route('**/api/health', (route) => route.abort('connectionrefused'))
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('서버에 연결하지 못했습니다.')
  await page.unroute('**/api/health')
  await page.getByRole('button', { name: '다시 확인' }).click()
  await expect(page.getByRole('status')).toHaveText('서버에 정상적으로 연결되었습니다.')
})

test('signup, login, protected home and nickname update work together', async ({ page }) => {
  await page.goto('/signup')
  await page.getByLabel('이메일').fill(' learner@example.com ')
  await page.getByLabel('닉네임').fill(' 학습자_1 ')
  await page.getByLabel('비밀번호').fill('password123')
  await page.getByRole('button', { name: '가입하기' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('status')).toHaveText('회원가입이 완료되었습니다. 로그인해 주세요.')
  await page.getByLabel('이메일').fill('learner@example.com')
  await page.getByLabel('비밀번호').fill('password123')
  await page.getByRole('button', { name: '로그인' }).click()

  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('학습자_1님의')
  await page.getByRole('link', { name: '계정 설정' }).click()
  await page.getByLabel('닉네임').fill('새닉네임_2')
  await page.getByRole('button', { name: '닉네임 변경' }).click()
  await expect(page.getByRole('status')).toHaveText('닉네임을 변경했습니다.')
  await page.getByRole('link', { name: '내 기록' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('새닉네임_2님의')
})

test('signup failure keeps email and nickname but clears password', async ({ page }) => {
  await page.goto('/signup')
  await page.getByLabel('이메일').fill('duplicate@example.com')
  await page.getByLabel('닉네임').fill('중복검사사용자')
  await page.getByLabel('비밀번호').fill('password123')
  await page.getByRole('button', { name: '가입하기' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/signup')
  await page.getByLabel('이메일').fill('duplicate@example.com')
  await page.getByLabel('닉네임').fill('다른닉네임')
  await page.getByLabel('비밀번호').fill('password123')
  await page.getByRole('button', { name: '가입하기' }).click()
  await expect(page.getByRole('alert')).toHaveText('이미 사용 중인 이메일입니다.')
  await expect(page.getByLabel('이메일')).toHaveValue('duplicate@example.com')
  await expect(page.getByLabel('닉네임')).toHaveValue('다른닉네임')
  await expect(page.getByLabel('비밀번호')).toHaveValue('')
})

test('login failure keeps email and clears password', async ({ page }) => {
  await page.request.post('http://127.0.0.1:8000/api/auth/signup', {
    data: { email: 'login-failure@example.com', nickname: '로그인실패검사', password: 'password123' },
  })
  await page.goto('/login')
  await page.getByLabel('이메일').fill('login-failure@example.com')
  await page.getByLabel('비밀번호').fill('wrong-password')
  await page.getByRole('button', { name: '로그인' }).click()
  await expect(page.getByRole('alert')).toHaveText('이메일 또는 비밀번호가 맞지 않습니다.')
  await expect(page.getByLabel('이메일')).toHaveValue('login-failure@example.com')
  await expect(page.getByLabel('비밀번호')).toHaveValue('')
})

test('protected pages redirect unauthenticated users to login', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
  await context.close()
})

test('360px signup screen has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/signup')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
  await page.screenshot({ path: 'test-results/signup-mobile.png', fullPage: true })
})

test('desktop account screen renders after login', async ({ page }) => {
  await page.request.post('http://127.0.0.1:8000/api/auth/signup', {
    data: { email: 'account-view@example.com', nickname: '계정화면검사', password: 'password123' },
  })
  await page.goto('/login')
  await page.getByLabel('이메일').fill('account-view@example.com')
  await page.getByLabel('비밀번호').fill('password123')
  await page.getByRole('button', { name: '로그인' }).click()
  await page.getByRole('link', { name: '계정 설정' }).click()
  await page.setViewportSize({ width: 1280, height: 960 })
  await page.screenshot({ path: 'test-results/account-desktop.png', fullPage: true })
  await expect(page.getByText('account-view@example.com')).toBeVisible()
})

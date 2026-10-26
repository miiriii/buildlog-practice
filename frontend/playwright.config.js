import { defineConfig } from '@playwright/test'

const python = process.platform === 'win32'
  ? '../backend/.venv/Scripts/python.exe'
  : '../backend/.venv/bin/python'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    channel: 'msedge',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: `"${python}" ../backend/tests/run_e2e_server.py`,
      url: 'http://127.0.0.1:8000/api/health',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
})

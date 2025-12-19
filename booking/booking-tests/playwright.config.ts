import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { BASE_URL  } from "./utils/const"

dotenv.config();

export default defineConfig({
  timeout: 120000, // 2 phút 
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'always' }]
  ],

  use: {
    headless: true,
    baseURL: BASE_URL,
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry',

  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});




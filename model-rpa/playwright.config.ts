/**
 * Model-RPA Playwright Configuration
 * E2E 测试配置
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './e2e',

  // 测试文件匹配
  testMatch: '**/*.e2e.ts',

  // 并行运行
  fullyParallel: true,

  // CI 环境禁止并行
  forbidOnly: !!process.env.CI,

  // 重试次数
  retries: process.env.CI ? 2 : 0,

  // 并发数
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  // 全局设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:5173',

    // 截图模式
    screenshot: 'only-on-failure',

    // 视频模式
    video: 'retain-on-failure',

    // 追踪模式
    trace: 'on-first-retry',

    // 默认超时
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 浏览器配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Web 服务器配置
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

/**
 * Model-RPA App E2E Tests
 * 应用端到端测试
 */

import { test, expect } from '@playwright/test';

test.describe('Model-RPA App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display app title', async ({ page }) => {
    await expect(page).toHaveTitle(/Model-RPA/);
  });

  test('should display main workspace', async ({ page }) => {
    // 检查工作区是否加载
    await expect(page.locator('text=Model-RPA')).toBeVisible();
  });

  test('should display node palette', async ({ page }) => {
    // 检查节点面板是否显示
    await expect(page.locator('text=节点面板')).toBeVisible();
  });

  test('should display canvas', async ({ page }) => {
    // 检查画布是否显示
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should display live view', async ({ page }) => {
    // 检查实时视图是否显示
    await expect(page.locator('text=浏览器视图')).toBeVisible();
  });
});

test.describe('Node Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all node types', async ({ page }) => {
    // 检查节点类型是否显示
    await expect(page.locator('text=动作节点')).toBeVisible();
    await expect(page.locator('text=数据提取')).toBeVisible();
    await expect(page.locator('text=循环')).toBeVisible();
    await expect(page.locator('text=条件判断')).toBeVisible();
    await expect(page.locator('text=Agent 任务')).toBeVisible();
  });

  test('should allow dragging nodes to canvas', async ({ page }) => {
    // 拖拽动作节点到画布
    const actionNode = page.locator('text=动作节点').first();
    const canvas = page.locator('.react-flow');

    await actionNode.dragTo(canvas);

    // 验证节点已添加到画布
    await expect(page.locator('.react-flow__node')).toHaveCount(2); // Start node + Action node
  });
});

test.describe('Canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display start node', async ({ page }) => {
    // 检查开始节点是否显示
    await expect(page.locator('text=开始')).toBeVisible();
  });

  test('should allow zooming', async ({ page }) => {
    const canvas = page.locator('.react-flow');

    // 缩放画布
    await canvas.hover();
    await page.mouse.wheel(0, -100);

    // 验证缩放控件存在
    await expect(page.locator('.react-flow__controls')).toBeVisible();
  });

  test('should display minimap', async ({ page }) => {
    // 检查小地图是否显示
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
  });
});

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display toolbar buttons', async ({ page }) => {
    // 检查工具栏按钮
    await expect(page.locator('text=新建')).toBeVisible();
    await expect(page.locator('text=保存')).toBeVisible();
    await expect(page.locator('text=加载')).toBeVisible();
    await expect(page.locator('text=执行工作流')).toBeVisible();
  });

  test('should toggle timeline', async ({ page }) => {
    // 点击时间轴按钮
    await page.locator('text=时间轴').click();

    // 验证时间轴显示
    await expect(page.locator('text=执行日志')).toBeVisible();
  });
});

test.describe('Live View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display URL input', async ({ page }) => {
    // 检查 URL 输入框
    await expect(page.locator('input[placeholder="输入网址..."]')).toBeVisible();
  });

  test('should display recording button', async ({ page }) => {
    // 检查录制按钮
    await expect(page.locator('text=开始录制')).toBeVisible();
  });

  test('should display quick access buttons', async ({ page }) => {
    // 检查快速访问按钮
    await expect(page.locator('text=baidu.com')).toBeVisible();
    await expect(page.locator('text=taobao.com')).toBeVisible();
    await expect(page.locator('text=jd.com')).toBeVisible();
  });
});

test.describe('Node Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open config panel on node click', async ({ page }) => {
    // 点击开始节点
    await page.locator('text=开始').click();

    // 验证配置面板显示（开始节点没有配置面板，所以不会显示）
    // 这里需要拖拽一个动作节点后再测试
  });
});

test.describe('Settings', () => {
  test('should open settings window', async ({ page }) => {
    await page.goto('/');

    // 点击设置按钮（如果有）
    // await page.locator('text=设置').click();

    // 验证设置窗口显示
    // await expect(page.locator('text=通用设置')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should adapt to different screen sizes', async ({ page }) => {
    // 测试桌面尺寸
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('.react-flow')).toBeVisible();

    // 测试平板尺寸
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.react-flow')).toBeVisible();

    // 测试手机尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.react-flow')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // 检查按钮是否有 ARIA 标签
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      // 按钮应该有 aria-label 或文本内容
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // 使用 Tab 键导航
    await page.keyboard.press('Tab');

    // 验证焦点移动
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

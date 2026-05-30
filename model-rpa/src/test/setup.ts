/**
 * Model-RPA Test Setup
 * 测试环境配置
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// 模拟 Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
  emit: vi.fn(),
}));

vi.mock('@tauri-apps/api/window', () => ({
  appWindow: {
    show: vi.fn(),
    hide: vi.fn(),
    close: vi.fn(),
    setFocus: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    isMaximized: vi.fn(),
    isMinimized: vi.fn(),
    isVisible: vi.fn(),
    onResized: vi.fn(),
    onMoved: vi.fn(),
    onCloseRequested: vi.fn(),
  },
}));

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 scrollTo
window.scrollTo = vi.fn();

// 模拟 console 方法（避免测试输出过多）
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // 忽略 React 测试库的警告
  if (args[0]?.includes?.('Warning:')) return;
  originalConsoleError(...args);
};

console.warn = (...args: any[]) => {
  // 忽略 React 测试库的警告
  if (args[0]?.includes?.('Warning:')) return;
  originalConsoleWarn(...args);
};

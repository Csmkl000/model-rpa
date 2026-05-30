/**
 * Model-RPA Structured Logger
 * 结构化日志系统 - 输出标准化单行 JSON
 */

import { invoke } from '@tauri-apps/api/core';

// 日志级别
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// 日志类别
export type LogCategory = 'system' | 'action' | 'extract' | 'loop' | 'agent' | 'cache' | 'network' | 'ui';

// 日志条目
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  nodeId?: string;
  workflowId?: string;
  duration?: number;
  cached?: boolean;
  meta?: Record<string, any>;
  stack?: string;
}

// 日志配置
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableIPC: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
}

// 日志级别优先级
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

/**
 * 结构化日志器
 * 输出标准化单行 JSON，支持 IPC 传输到 Rust 后端
 */
export class StructuredLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private listeners: Array<(entry: LogEntry) => void> = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: 'info',
      enableConsole: true,
      enableIPC: true,
      enableStorage: true,
      maxStorageEntries: 10000,
      ...config,
    };
  }

  /**
   * 记录日志
   */
  log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    meta?: Record<string, any>
  ): void {
    // 检查日志级别
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      ...meta,
    };

    // 输出到控制台
    if (this.config.enableConsole) {
      this.consoleOutput(entry);
    }

    // 存储到内存
    if (this.config.enableStorage) {
      this.storeEntry(entry);
    }

    // 发送到 IPC
    if (this.config.enableIPC) {
      this.sendToIPC(entry);
    }

    // 通知监听器
    this.notifyListeners(entry);
  }

  /**
   * Trace 级别日志
   */
  trace(category: LogCategory, message: string, meta?: Record<string, any>): void {
    this.log('trace', category, message, meta);
  }

  /**
   * Debug 级别日志
   */
  debug(category: LogCategory, message: string, meta?: Record<string, any>): void {
    this.log('debug', category, message, meta);
  }

  /**
   * Info 级别日志
   */
  info(category: LogCategory, message: string, meta?: Record<string, any>): void {
    this.log('info', category, message, meta);
  }

  /**
   * Warn 级别日志
   */
  warn(category: LogCategory, message: string, meta?: Record<string, any>): void {
    this.log('warn', category, message, meta);
  }

  /**
   * Error 级别日志
   */
  error(category: LogCategory, message: string, error?: Error, meta?: Record<string, any>): void {
    this.log('error', category, message, {
      ...meta,
      stack: error?.stack,
      errorMessage: error?.message,
    });
  }

  /**
   * Fatal 级别日志
   */
  fatal(category: LogCategory, message: string, error?: Error, meta?: Record<string, any>): void {
    this.log('fatal', category, message, {
      ...meta,
      stack: error?.stack,
      errorMessage: error?.message,
    });
  }

  /**
   * 记录节点执行开始
   */
  nodeStart(nodeId: string, nodeType: string, instruction: string): void {
    this.info('action', `节点开始执行: ${instruction}`, {
      nodeId,
      nodeType,
      instruction,
    });
  }

  /**
   * 记录节点执行完成
   */
  nodeComplete(nodeId: string, duration: number, cached: boolean = false): void {
    const message = cached
      ? `⚡️ 节点执行完成 (缓存命中，${duration}ms)`
      : `✅ 节点执行完成 (${duration}ms)`;

    this.info('action', message, {
      nodeId,
      duration,
      cached,
    });
  }

  /**
   * 记录节点执行错误
   */
  nodeError(nodeId: string, error: Error, duration: number): void {
    this.error('action', `❌ 节点执行失败: ${error.message}`, error, {
      nodeId,
      duration,
    });
  }

  /**
   * 记录缓存命中
   */
  cacheHit(key: string, duration: number): void {
    this.debug('cache', `缓存命中: ${key}`, {
      cacheKey: key,
      duration,
    });
  }

  /**
   * 记录缓存未命中
   */
  cacheMiss(key: string): void {
    this.debug('cache', `缓存未命中: ${key}`, {
      cacheKey: key,
    });
  }

  /**
   * 记录网络请求
   */
  networkRequest(url: string, method: string, duration: number, status: number): void {
    this.debug('network', `${method} ${url} ${status} (${duration}ms)`, {
      url,
      method,
      duration,
      status,
    });
  }

  /**
   * 添加日志监听器
   */
  addListener(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 获取指定级别的日志
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((entry) => entry.level === level);
  }

  /**
   * 获取指定类别的日志
   */
  getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter((entry) => entry.category === category);
  }

  /**
   * 清除日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 导出日志
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 控制台输出
   */
  private consoleOutput(entry: LogEntry): void {
    const { timestamp, level, category, message, nodeId, duration, cached } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
    const nodeInfo = nodeId ? ` [${nodeId}]` : '';
    const durationInfo = duration !== undefined ? ` (${duration}ms)` : '';
    const cachedInfo = cached ? ' ⚡️' : '';

    const logMessage = `${prefix}${nodeInfo} ${message}${durationInfo}${cachedInfo}`;

    switch (level) {
      case 'trace':
      case 'debug':
        console.debug(logMessage, entry.meta);
        break;
      case 'info':
        console.info(logMessage, entry.meta);
        break;
      case 'warn':
        console.warn(logMessage, entry.meta);
        break;
      case 'error':
      case 'fatal':
        console.error(logMessage, entry.meta);
        break;
    }
  }

  /**
   * 存储日志条目
   */
  private storeEntry(entry: LogEntry): void {
    this.logs.push(entry);

    // 限制存储数量
    if (this.logs.length > this.config.maxStorageEntries) {
      this.logs = this.logs.slice(-this.config.maxStorageEntries);
    }
  }

  /**
   * 发送到 IPC
   */
  private async sendToIPC(entry: LogEntry): Promise<void> {
    try {
      await invoke('log_message', {
        level: entry.level,
        category: entry.category,
        message: entry.message,
        meta: entry,
      });
    } catch (error) {
      // 静默失败，避免日志记录本身导致错误
      console.error('发送日志到 IPC 失败:', error);
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(entry: LogEntry): void {
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (error) {
        console.error('日志监听器错误:', error);
      }
    });
  }
}

// 全局日志实例
export const logger = new StructuredLogger();

// 便捷函数
export const log = {
  trace: (category: LogCategory, message: string, meta?: Record<string, any>) =>
    logger.trace(category, message, meta),
  debug: (category: LogCategory, message: string, meta?: Record<string, any>) =>
    logger.debug(category, message, meta),
  info: (category: LogCategory, message: string, meta?: Record<string, any>) =>
    logger.info(category, message, meta),
  warn: (category: LogCategory, message: string, meta?: Record<string, any>) =>
    logger.warn(category, message, meta),
  error: (category: LogCategory, message: string, error?: Error, meta?: Record<string, any>) =>
    logger.error(category, message, error, meta),
  fatal: (category: LogCategory, message: string, error?: Error, meta?: Record<string, any>) =>
    logger.fatal(category, message, error, meta),
};

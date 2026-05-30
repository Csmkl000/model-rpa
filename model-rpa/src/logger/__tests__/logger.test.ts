/**
 * Logger Tests
 * 日志模块单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StructuredLogger, logger } from '../structured-logger';

describe('StructuredLogger', () => {
  let testLogger: StructuredLogger;

  beforeEach(() => {
    testLogger = new StructuredLogger({
      minLevel: 'debug',
      enableConsole: false,
      enableIPC: false,
      enableStorage: true,
    });
  });

  describe('log levels', () => {
    it('should log trace messages', () => {
      testLogger.trace('system', 'trace message');
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('trace');
    });

    it('should log debug messages', () => {
      testLogger.debug('system', 'debug message');
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('debug');
    });

    it('should log info messages', () => {
      testLogger.info('action', 'info message');
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
    });

    it('should log warn messages', () => {
      testLogger.warn('cache', 'warn message');
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
    });

    it('should log error messages', () => {
      const error = new Error('test error');
      testLogger.error('network', 'error message', error);
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].stack).toBeDefined();
    });

    it('should log fatal messages', () => {
      const error = new Error('fatal error');
      testLogger.fatal('system', 'fatal message', error);
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('fatal');
    });
  });

  describe('log filtering', () => {
    it('should filter by minimum level', () => {
      const warnLogger = new StructuredLogger({
        minLevel: 'warn',
        enableConsole: false,
        enableIPC: false,
        enableStorage: true,
      });

      warnLogger.debug('system', 'debug');
      warnLogger.info('system', 'info');
      warnLogger.warn('system', 'warn');
      warnLogger.error('system', 'error');

      const logs = warnLogger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe('warn');
      expect(logs[1].level).toBe('error');
    });

    it('should filter by level', () => {
      testLogger.info('system', 'info');
      testLogger.warn('system', 'warn');
      testLogger.error('system', 'error');

      const errorLogs = testLogger.getLogsByLevel('error');
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe('error');
    });

    it('should filter by category', () => {
      testLogger.info('action', 'action log');
      testLogger.info('cache', 'cache log');
      testLogger.info('action', 'another action log');

      const actionLogs = testLogger.getLogsByCategory('action');
      expect(actionLogs).toHaveLength(2);
    });
  });

  describe('metadata', () => {
    it('should include metadata in log entry', () => {
      testLogger.info('action', 'test message', {
        nodeId: 'action-1',
        duration: 150,
      });

      const logs = testLogger.getLogs();
      expect(logs[0].nodeId).toBe('action-1');
      expect(logs[0].duration).toBe(150);
    });

    it('should include timestamp', () => {
      testLogger.info('system', 'test');
      const logs = testLogger.getLogs();
      expect(logs[0].timestamp).toBeDefined();
      expect(new Date(logs[0].timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('convenience methods', () => {
    it('should log node start', () => {
      testLogger.nodeStart('action-1', 'click', '点击按钮');
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].nodeId).toBe('action-1');
    });

    it('should log node complete', () => {
      testLogger.nodeComplete('action-1', 150, false);
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].duration).toBe(150);
      expect(logs[0].cached).toBe(false);
    });

    it('should log node complete with cache', () => {
      testLogger.nodeComplete('action-1', 12, true);
      const logs = testLogger.getLogs();
      expect(logs[0].cached).toBe(true);
      expect(logs[0].message).toContain('⚡️');
    });

    it('should log node error', () => {
      const error = new Error('test error');
      testLogger.nodeError('action-1', error, 100);
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
    });

    it('should log cache hit', () => {
      testLogger.cacheHit('action-hash', 12);
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe('cache');
    });

    it('should log cache miss', () => {
      testLogger.cacheMiss('action-hash');
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
    });

    it('should log network request', () => {
      testLogger.networkRequest('https://example.com', 'GET', 150, 200);
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe('network');
    });
  });

  describe('listeners', () => {
    it('should notify listeners', () => {
      const listener = vi.fn();
      testLogger.addListener(listener);

      testLogger.info('system', 'test');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        level: 'info',
        message: 'test',
      }));
    });

    it('should unsubscribe listener', () => {
      const listener = vi.fn();
      const unsubscribe = testLogger.addListener(listener);

      testLogger.info('system', 'test1');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      testLogger.info('system', 'test2');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear and export', () => {
    it('should clear logs', () => {
      testLogger.info('system', 'test1');
      testLogger.info('system', 'test2');

      expect(testLogger.getLogs()).toHaveLength(2);

      testLogger.clearLogs();
      expect(testLogger.getLogs()).toHaveLength(0);
    });

    it('should export logs as JSON', () => {
      testLogger.info('system', 'test');
      const exported = testLogger.exportLogs();
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });
});

describe('global logger', () => {
  it('should be a StructuredLogger instance', () => {
    expect(logger).toBeInstanceOf(StructuredLogger);
  });
});

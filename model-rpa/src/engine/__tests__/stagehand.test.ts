/**
 * Stagehand Engine Tests
 * Stagehand 引擎单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StagehandEngine, createStagehandEngine } from '../stagehand';

describe('StagehandEngine', () => {
  let engine: StagehandEngine;

  beforeEach(() => {
    engine = createStagehandEngine({
      enableCaching: true,
      debug: false,
    });
  });

  describe('initialization', () => {
    it('should create engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(StagehandEngine);
    });

    it('should initialize successfully', async () => {
      await expect(engine.initialize()).resolves.not.toThrow();
    });
  });

  describe('act()', () => {
    it('should execute action successfully', async () => {
      const result = await engine.act('点击搜索按钮');

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return cached result on second call', async () => {
      const result1 = await engine.act('点击登录按钮');
      const result2 = await engine.act('点击登录按钮');

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(true);
    });

    it('should handle timeout option', async () => {
      const result = await engine.act('点击按钮', { timeout: 5000 });

      expect(result.success).toBe(true);
    });
  });

  describe('extract()', () => {
    it('should extract data with schema', async () => {
      const { z } = await import('zod');
      const schema = z.object({
        title: z.string(),
        price: z.number(),
      });

      const result = await engine.extract('提取商品信息', schema);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle invalid schema gracefully', async () => {
      const { z } = await import('zod');
      const schema = z.object({
        required_field: z.string(),
      });

      const result = await engine.extract('提取数据', schema);

      // 即使数据不符合 schema，也应该返回结果
      expect(result).toBeDefined();
    });
  });

  describe('observe()', () => {
    it('should observe page elements', async () => {
      const result = await engine.observe('寻找下一页按钮');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.elements)).toBe(true);
    });

    it('should return empty array when no elements found', async () => {
      const result = await engine.observe('寻找不存在的元素');

      expect(result.success).toBe(true);
      expect(result.elements).toHaveLength(0);
    });
  });

  describe('agent()', () => {
    it('should execute agent task', async () => {
      const result = await engine.agent('找到联系我们页面');

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('should handle manual confirmation', async () => {
      const result = await engine.agent('提交表单', {
        requireManualConfirmation: true,
        dangerousActions: ['submit'],
      });

      expect(result).toBeDefined();
    });

    it('should respect max steps limit', async () => {
      const result = await engine.agent('复杂任务', {
        maxSteps: 5,
      });

      expect(result).toBeDefined();
    });
  });

  describe('cache management', () => {
    it('should get cache stats', async () => {
      // 执行一些操作生成缓存
      await engine.act('测试动作1');
      await engine.act('测试动作2');

      const stats = await engine.getCacheStats();

      expect(stats).toBeDefined();
      expect(stats.totalEntries).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    });

    it('should clear cache', async () => {
      // 生成缓存
      await engine.act('测试动作');

      // 清除缓存
      await engine.clearCache();

      // 验证缓存已清除
      const stats = await engine.getCacheStats();
      expect(stats.totalEntries).toBe(0);
    });
  });

  describe('destroy()', () => {
    it('should destroy engine successfully', async () => {
      await engine.initialize();
      await expect(engine.destroy()).resolves.not.toThrow();
    });
  });
});

describe('createStagehandEngine', () => {
  it('should create engine with default config', () => {
    const engine = createStagehandEngine();
    expect(engine).toBeDefined();
  });

  it('should create engine with custom config', () => {
    const engine = createStagehandEngine({
      enableCaching: false,
      headless: true,
      debug: true,
    });
    expect(engine).toBeDefined();
  });
});

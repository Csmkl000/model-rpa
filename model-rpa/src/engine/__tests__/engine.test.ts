/**
 * Model-RPA Engine Tests
 * 引擎单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StagehandEngine, createStagehandEngine } from '../stagehand';
import { CacheManager } from '../cache/cache-manager';
import { DOMHasher } from '../cache/dom-hasher';
import {
  ArticleSchema,
  ProductSchema,
  compileDynamicSchema,
} from '../schemas/extraction';

describe('StagehandEngine', () => {
  let engine: StagehandEngine;

  beforeEach(async () => {
    engine = createStagehandEngine({
      enableCaching: true,
      debug: false,
    });
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.destroy();
  });

  describe('act()', () => {
    it('should execute action successfully', async () => {
      const result = await engine.act('点击搜索按钮');
      expect(result.success).toBe(true);
      expect(result.cached).toBe(false);
    });

    it('should return cached result on second call', async () => {
      const result1 = await engine.act('点击登录按钮');
      const result2 = await engine.act('点击登录按钮');

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(true);
    });
  });

  describe('extract()', () => {
    it('should extract data with schema', async () => {
      const result = await engine.extract(
        '提取文章内容',
        ArticleSchema
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('observe()', () => {
    it('should observe page elements', async () => {
      const result = await engine.observe('寻找下一页按钮');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.elements)).toBe(true);
    });
  });

  describe('agent()', () => {
    it('should execute agent task', async () => {
      const result = await engine.agent('找到联系我们页面并留言');
      expect(result.success).toBe(true);
    });
  });
});

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  afterEach(async () => {
    await cacheManager.clear();
  });

  it('should set and get cache', async () => {
    await cacheManager.set('test-key', { data: 'test' });
    const result = await cacheManager.get('test-key');
    expect(result).toEqual({ data: 'test' });
  });

  it('should return null for non-existent key', async () => {
    const result = await cacheManager.get('non-existent');
    expect(result).toBeNull();
  });

  it('should delete cache', async () => {
    await cacheManager.set('test-key', { data: 'test' });
    await cacheManager.delete('test-key');
    const result = await cacheManager.get('test-key');
    expect(result).toBeNull();
  });

  it('should clear all cache', async () => {
    await cacheManager.set('key1', { data: '1' });
    await cacheManager.set('key2', { data: '2' });
    await cacheManager.clear();

    const result1 = await cacheManager.get('key1');
    const result2 = await cacheManager.get('key2');

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('should return cache stats', async () => {
    await cacheManager.set('key1', { data: '1' });
    await cacheManager.set('key2', { data: '2' });

    const stats = await cacheManager.getStats();
    expect(stats.totalEntries).toBe(2);
  });
});

describe('DOMHasher', () => {
  let hasher: DOMHasher;

  beforeEach(() => {
    hasher = new DOMHasher();
  });

  it('should hash action', () => {
    const hash1 = hasher.hashAction('点击按钮');
    const hash2 = hasher.hashAction('点击按钮');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different actions', () => {
    const hash1 = hasher.hashAction('点击按钮A');
    const hash2 = hasher.hashAction('点击按钮B');
    expect(hash1).not.toBe(hash2);
  });

  it('should hash element', () => {
    const hash = hasher.hashElement({
      tag: 'button',
      id: 'submit',
      text: '提交',
    });
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
  });

  it('should detect changes', () => {
    const hash1 = hasher.hashAction('test');
    const hash2 = hasher.hashAction('test');
    const hash3 = hasher.hashAction('different');

    expect(hasher.detectChanges(hash1, hash2)).toBe(false);
    expect(hasher.detectChanges(hash1, hash3)).toBe(true);
  });
});

describe('Extraction Schemas', () => {
  it('should validate article data', () => {
    const article = {
      title: '测试文章',
      content: '这是内容',
    };

    const result = ArticleSchema.safeParse(article);
    expect(result.success).toBe(true);
  });

  it('should validate product data', () => {
    const product = {
      name: '测试商品',
      price: 99.99,
      currency: 'CNY',
    };

    const result = ProductSchema.safeParse(product);
    expect(result.success).toBe(true);
  });

  it('should compile dynamic schema', () => {
    const schema = compileDynamicSchema([
      { name: 'title', type: 'string', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'tags', type: 'array', required: false },
    ]);

    const validData = {
      title: '测试',
      price: 99,
      tags: ['tag1', 'tag2'],
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

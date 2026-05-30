/**
 * Cache Manager Tests
 * 缓存管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../cache/cache-manager';
import { DOMHasher } from '../cache/dom-hasher';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  const testCacheDir = join(__dirname, '.test-cache');

  beforeEach(() => {
    // 清理测试缓存目录
    if (existsSync(testCacheDir)) {
      rmSync(testCacheDir, { recursive: true, force: true });
    }

    cacheManager = new CacheManager(testCacheDir);
  });

  afterEach(() => {
    // 清理测试缓存目录
    if (existsSync(testCacheDir)) {
      rmSync(testCacheDir, { recursive: true, force: true });
    }
  });

  describe('set() and get()', () => {
    it('should store and retrieve data', async () => {
      const data = { action: 'click', selector: '#button' };

      await cacheManager.set('test-key', data);
      const result = await cacheManager.get('test-key');

      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('should overwrite existing data', async () => {
      await cacheManager.set('key', { value: 1 });
      await cacheManager.set('key', { value: 2 });

      const result = await cacheManager.get('key');
      expect(result).toEqual({ value: 2 });
    });
  });

  describe('delete()', () => {
    it('should delete cache entry', async () => {
      await cacheManager.set('key', { data: 'test' });
      await cacheManager.delete('key');

      const result = await cacheManager.get('key');
      expect(result).toBeNull();
    });

    it('should handle deleting non-existent key', async () => {
      await expect(cacheManager.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('clear()', () => {
    it('should clear all cache entries', async () => {
      await cacheManager.set('key1', { data: 1 });
      await cacheManager.set('key2', { data: 2 });
      await cacheManager.set('key3', { data: 3 });

      await cacheManager.clear();

      const result1 = await cacheManager.get('key1');
      const result2 = await cacheManager.get('key2');
      const result3 = await cacheManager.get('key3');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });
  });

  describe('getStats()', () => {
    it('should return correct stats', async () => {
      await cacheManager.set('key1', { data: 1 });
      await cacheManager.set('key2', { data: 2 });

      // 访问一次生成命中
      await cacheManager.get('key1');

      const stats = await cacheManager.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should return zero stats for empty cache', async () => {
      const stats = await cacheManager.getStats();

      expect(stats.totalEntries).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('evict()', () => {
    it('should evict old entries when exceeding limit', async () => {
      // 创建多个缓存条目
      for (let i = 0; i < 10; i++) {
        await cacheManager.set(`key-${i}`, { index: i });
      }

      // 执行淘汰，保留 5 个
      await cacheManager.evict(5);

      const stats = await cacheManager.getStats();
      expect(stats.totalEntries).toBeLessThanOrEqual(5);
    });
  });
});

describe('DOMHasher', () => {
  let hasher: DOMHasher;

  beforeEach(() => {
    hasher = new DOMHasher();
  });

  describe('hashAction()', () => {
    it('should generate consistent hash for same input', () => {
      const hash1 = hasher.hashAction('点击按钮');
      const hash2 = hasher.hashAction('点击按钮');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different input', () => {
      const hash1 = hasher.hashAction('点击按钮A');
      const hash2 = hasher.hashAction('点击按钮B');

      expect(hash1).not.toBe(hash2);
    });

    it('should include context in hash', () => {
      const hash1 = hasher.hashAction('点击按钮', 'context1');
      const hash2 = hasher.hashAction('点击按钮', 'context2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hashPage()', () => {
    it('should generate hash from HTML content', () => {
      const html = '<button id="btn">Click</button>';
      const hash = hasher.hashPage(html);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hash for different HTML', () => {
      const hash1 = hasher.hashPage('<button>Click 1</button>');
      const hash2 = hasher.hashPage('<button>Click 2</button>');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hashElement()', () => {
    it('should hash element properties', () => {
      const hash = hasher.hashElement({
        tag: 'button',
        id: 'submit',
        text: '提交',
      });

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should generate different hash for different elements', () => {
      const hash1 = hasher.hashElement({ tag: 'button', id: 'btn1' });
      const hash2 = hasher.hashElement({ tag: 'button', id: 'btn2' });

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare()', () => {
    it('should return true for same hashes', () => {
      const hash = hasher.hashAction('test');
      expect(hasher.compare(hash, hash)).toBe(true);
    });

    it('should return false for different hashes', () => {
      const hash1 = hasher.hashAction('test1');
      const hash2 = hasher.hashAction('test2');
      expect(hasher.compare(hash1, hash2)).toBe(false);
    });
  });

  describe('detectChanges()', () => {
    it('should detect no changes for same hash', () => {
      const hash = hasher.hashAction('test');
      expect(hasher.detectChanges(hash, hash)).toBe(false);
    });

    it('should detect changes for different hash', () => {
      const hash1 = hasher.hashAction('test1');
      const hash2 = hasher.hashAction('test2');
      expect(hasher.detectChanges(hash1, hash2)).toBe(true);
    });
  });
});

/**
 * Model-RPA Cache Manager
 * 管理 DOM 哈希缓存，实现毫秒级极速执行
 */

import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';

// 缓存条目接口
interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  hitCount: number;
  lastHit: number;
}

// 缓存统计接口
interface CacheStats {
  totalEntries: number;
  hitRate: number;
  size: number;
}

/**
 * 缓存管理器
 * 使用文件系统存储缓存，支持 LRU 淘汰策略
 */
export class CacheManager {
  private cacheDir: string;
  private indexPath: string;
  private index: Map<string, CacheEntry> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir || join(process.cwd(), '.cache', 'actions');
    this.indexPath = join(this.cacheDir, 'index.json');

    // 确保缓存目录存在
    this.ensureCacheDir();

    // 加载索引
    this.loadIndex();
  }

  /**
   * 确保缓存目录存在
   */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 加载缓存索引
   */
  private loadIndex(): void {
    try {
      if (existsSync(this.indexPath)) {
        const data = readFileSync(this.indexPath, 'utf-8');
        const entries = JSON.parse(data) as CacheEntry[];
        this.index = new Map(entries.map(entry => [entry.key, entry]));
        console.log(`[缓存] 加载 ${this.index.size} 个缓存条目`);
      }
    } catch (error) {
      console.warn('[缓存] 加载索引失败，创建新索引');
      this.index = new Map();
    }
  }

  /**
   * 保存缓存索引
   */
  private saveIndex(): void {
    try {
      const entries = Array.from(this.index.values());
      writeFileSync(this.indexPath, JSON.stringify(entries, null, 2));
    } catch (error) {
      console.error('[缓存] 保存索引失败:', error);
    }
  }

  /**
   * 获取缓存
   */
  async get(key: string): Promise<any | null> {
    const entry = this.index.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // 检查缓存文件是否存在
    const cachePath = this.getCachePath(key);
    if (!existsSync(cachePath)) {
      this.index.delete(key);
      this.misses++;
      return null;
    }

    // 更新命中统计
    entry.hitCount++;
    entry.lastHit = Date.now();
    this.index.set(key, entry);
    this.hits++;

    // 读取缓存数据
    try {
      const data = readFileSync(cachePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.index.delete(key);
      this.misses++;
      return null;
    }
  }

  /**
   * 设置缓存
   */
  async set(key: string, data: any): Promise<void> {
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      hitCount: 0,
      lastHit: Date.now(),
    };

    // 保存缓存文件
    const cachePath = this.getCachePath(key);
    writeFileSync(cachePath, JSON.stringify(data));

    // 更新索引
    this.index.set(key, entry);
    this.saveIndex();

    console.log(`[缓存] 保存缓存: ${key}`);
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    const cachePath = this.getCachePath(key);

    if (existsSync(cachePath)) {
      unlinkSync(cachePath);
    }

    this.index.delete(key);
    this.saveIndex();

    console.log(`[缓存] 删除缓存: ${key}`);
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    // 删除所有缓存文件
    for (const entry of this.index.values()) {
      const cachePath = this.getCachePath(entry.key);
      if (existsSync(cachePath)) {
        unlinkSync(cachePath);
      }
    }

    // 清空索引
    this.index.clear();
    this.saveIndex();

    // 重置统计
    this.hits = 0;
    this.misses = 0;

    console.log('[缓存] 已清除所有缓存');
  }

  /**
   * 获取缓存统计
   */
  async getStats(): Promise<CacheStats> {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    // 计算缓存大小
    let size = 0;
    for (const entry of this.index.values()) {
      const cachePath = this.getCachePath(entry.key);
      if (existsSync(cachePath)) {
        try {
          const stat = require('fs').statSync(cachePath);
          size += stat.size;
        } catch {
          // 忽略错误
        }
      }
    }

    return {
      totalEntries: this.index.size,
      hitRate,
      size,
    };
  }

  /**
   * 获取缓存文件路径
   */
  private getCachePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  /**
   * 淘汰旧缓存（LRU 策略）
   */
  async evict(maxEntries: number = 1000): Promise<void> {
    if (this.index.size <= maxEntries) {
      return;
    }

    // 按最后命中时间排序
    const entries = Array.from(this.index.values())
      .sort((a, b) => a.lastHit - b.lastHit);

    // 删除最旧的条目
    const toDelete = entries.slice(0, this.index.size - maxEntries);
    for (const entry of toDelete) {
      await this.delete(entry.key);
    }

    console.log(`[缓存] 淘汰 ${toDelete.length} 个旧缓存条目`);
  }
}

/**
 * Model-RPA Multi-Branch Cache
 * 多分支缓存 - 支持 A/B 测试和备选方案
 */

import { CacheManager } from './cache-manager';

// 缓存分支
interface CacheBranch {
  key: string;
  data: any;
  hash: string;
  successCount: number;
  failCount: number;
  lastUsed: number;
  createdAt: number;
}

// 多分支缓存条目
interface MultiBranchEntry {
  actionKey: string;
  branches: CacheBranch[];
  activeBranchIndex: number;
}

/**
 * 多分支缓存管理器
 * 支持同一动作的多个备选方案，用于 A/B 测试和缓存污染防护
 */
export class MultiBranchCache {
  private cacheManager: CacheManager;
  private maxBranches: number;
  private entries: Map<string, MultiBranchEntry> = new Map();

  constructor(cacheManager: CacheManager, maxBranches: number = 5) {
    this.cacheManager = cacheManager;
    this.maxBranches = maxBranches;
  }

  /**
   * 获取缓存
   * 优先返回活跃分支，如果失败则尝试其他分支
   */
  async get(actionKey: string, domHash: string): Promise<any | null> {
    const entry = this.entries.get(actionKey);

    if (!entry || entry.branches.length === 0) {
      return null;
    }

    // 尝试活跃分支
    const activeBranch = entry.branches[entry.activeBranchIndex];
    if (activeBranch && activeBranch.hash === domHash) {
      activeBranch.lastUsed = Date.now();
      activeBranch.successCount++;
      return activeBranch.data;
    }

    // 尝试其他分支
    for (let i = 0; i < entry.branches.length; i++) {
      if (i === entry.activeBranchIndex) continue;

      const branch = entry.branches[i];
      if (branch.hash === domHash) {
        // 切换到此分支
        entry.activeBranchIndex = i;
        branch.lastUsed = Date.now();
        branch.successCount++;
        return branch.data;
      }
    }

    return null;
  }

  /**
   * 设置缓存
   */
  async set(actionKey: string, domHash: string, data: any): Promise<void> {
    let entry = this.entries.get(actionKey);

    if (!entry) {
      entry = {
        actionKey,
        branches: [],
        activeBranchIndex: 0,
      };
      this.entries.set(actionKey, entry);
    }

    // 检查是否已存在相同哈希的分支
    const existingIndex = entry.branches.findIndex((b) => b.hash === domHash);

    if (existingIndex !== -1) {
      // 更新现有分支
      entry.branches[existingIndex].data = data;
      entry.branches[existingIndex].lastUsed = Date.now();
      entry.activeBranchIndex = existingIndex;
    } else {
      // 添加新分支
      const newBranch: CacheBranch = {
        key: `${actionKey}-${domHash}`,
        data,
        hash: domHash,
        successCount: 0,
        failCount: 0,
        lastUsed: Date.now(),
        createdAt: Date.now(),
      };

      // 如果超过最大分支数，移除最旧的分支
      if (entry.branches.length >= this.maxBranches) {
        const oldestIndex = this.findOldestBranch(entry);
        entry.branches.splice(oldestIndex, 1);

        // 调整活跃分支索引
        if (entry.activeBranchIndex >= oldestIndex) {
          entry.activeBranchIndex = Math.max(0, entry.activeBranchIndex - 1);
        }
      }

      entry.branches.push(newBranch);
      entry.activeBranchIndex = entry.branches.length - 1;
    }

    // 同时保存到基础缓存管理器
    await this.cacheManager.set(`${actionKey}-${domHash}`, data);
  }

  /**
   * 标记分支失败
   */
  markFailure(actionKey: string, domHash: string): void {
    const entry = this.entries.get(actionKey);
    if (!entry) return;

    const branch = entry.branches.find((b) => b.hash === domHash);
    if (branch) {
      branch.failCount++;

      // 如果失败次数过多，尝试切换到其他分支
      if (branch.failCount > 3) {
        this.switchToAlternativeBranch(entry, domHash);
      }
    }
  }

  /**
   * 切换到备选分支
   */
  private switchToAlternativeBranch(entry: MultiBranchEntry, failedHash: string): void {
    const failedIndex = entry.branches.findIndex((b) => b.hash === failedHash);
    if (failedIndex === -1) return;

    // 找到成功率最高的分支
    let bestIndex = -1;
    let bestScore = -1;

    for (let i = 0; i < entry.branches.length; i++) {
      if (i === failedIndex) continue;

      const branch = entry.branches[i];
      const total = branch.successCount + branch.failCount;
      const score = total > 0 ? branch.successCount / total : 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) {
      entry.activeBranchIndex = bestIndex;
    }
  }

  /**
   * 找到最旧的分支
   */
  private findOldestBranch(entry: MultiBranchEntry): number {
    let oldestIndex = 0;
    let oldestTime = Infinity;

    for (let i = 0; i < entry.branches.length; i++) {
      const branch = entry.branches[i];
      if (branch.lastUsed < oldestTime) {
        oldestTime = branch.lastUsed;
        oldestIndex = i;
      }
    }

    return oldestIndex;
  }

  /**
   * 获取分支统计信息
   */
  getStats(actionKey: string): {
    branchCount: number;
    activeBranch: number;
    branches: Array<{
      hash: string;
      successCount: number;
      failCount: number;
      successRate: number;
    }>;
  } | null {
    const entry = this.entries.get(actionKey);
    if (!entry) return null;

    return {
      branchCount: entry.branches.length,
      activeBranch: entry.activeBranchIndex,
      branches: entry.branches.map((b) => ({
        hash: b.hash,
        successCount: b.successCount,
        failCount: b.failCount,
        successRate: b.successCount + b.failCount > 0
          ? b.successCount / (b.successCount + b.failCount)
          : 0,
      })),
    };
  }

  /**
   * 清除指定动作的缓存
   */
  async clear(actionKey: string): Promise<void> {
    const entry = this.entries.get(actionKey);
    if (!entry) return;

    // 清除基础缓存
    for (const branch of entry.branches) {
      await this.cacheManager.delete(branch.key);
    }

    this.entries.delete(actionKey);
  }

  /**
   * 清除所有缓存
   */
  async clearAll(): Promise<void> {
    for (const [key] of this.entries) {
      await this.clear(key);
    }
  }

  /**
   * 获取所有缓存键
   */
  getKeys(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * 获取缓存条目数
   */
  getEntryCount(): number {
    return this.entries.size;
  }

  /**
   * 获取总分支数
   */
  getBranchCount(): number {
    let count = 0;
    for (const entry of this.entries.values()) {
      count += entry.branches.length;
    }
    return count;
  }
}

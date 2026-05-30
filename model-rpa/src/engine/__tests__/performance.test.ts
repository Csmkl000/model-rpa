/**
 * Model-RPA Performance Tests
 * 性能基准测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StagehandEngine, createStagehandEngine } from '../stagehand';
import { CacheManager } from '../cache/cache-manager';
import { DOMHasher } from '../cache/dom-hasher';
import { MultiBranchCache } from '../cache/multi-branch-cache';
import { WorkflowExecutor, createWorkflowExecutor } from '../executor/workflow-executor';
import { Node, Edge } from 'reactflow';

// 性能测试工具
function measureTime(fn: () => void | Promise<void>): Promise<number> {
  return new Promise(async (resolve) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    resolve(end - start);
  });
}

function measureMemory(): { used: number; total: number } {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      used: usage.heapUsed,
      total: usage.heapTotal,
    };
  }
  return { used: 0, total: 0 };
}

describe('Performance Benchmarks', () => {
  describe('Cache Performance', () => {
    let cacheManager: CacheManager;

    beforeEach(() => {
      cacheManager = new CacheManager();
    });

    afterEach(async () => {
      await cacheManager.clear();
    });

    it('should measure cache write performance', async () => {
      const iterations = 1000;
      const data = { action: 'click', selector: '#button', timestamp: Date.now() };

      const duration = await measureTime(async () => {
        for (let i = 0; i < iterations; i++) {
          await cacheManager.set(`key-${i}`, data);
        }
      });

      const opsPerSecond = (iterations / duration) * 1000;
      console.log(`Cache Write: ${iterations} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 1 秒内完成 1000 次写入
      expect(duration).toBeLessThan(1000);
    });

    it('should measure cache read performance', async () => {
      const iterations = 1000;
      const data = { action: 'click', selector: '#button' };

      // 预填充缓存
      for (let i = 0; i < iterations; i++) {
        await cacheManager.set(`key-${i}`, data);
      }

      const duration = await measureTime(async () => {
        for (let i = 0; i < iterations; i++) {
          await cacheManager.get(`key-${i}`);
        }
      });

      const opsPerSecond = (iterations / duration) * 1000;
      console.log(`Cache Read: ${iterations} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 500ms 内完成 1000 次读取
      expect(duration).toBeLessThan(500);
    });

    it('should measure cache hit rate', async () => {
      const iterations = 1000;
      const cacheKeys = 100; // 100 个不同的键
      let hits = 0;
      let misses = 0;

      // 预填充缓存
      for (let i = 0; i < cacheKeys; i++) {
        await cacheManager.set(`key-${i}`, { index: i });
      }

      // 模拟随机访问（80% 命中率）
      for (let i = 0; i < iterations; i++) {
        const key = Math.random() < 0.8
          ? `key-${Math.floor(Math.random() * cacheKeys)}`  // 命中
          : `key-${cacheKeys + Math.floor(Math.random() * 100)}`;  // 未命中

        const result = await cacheManager.get(key);
        if (result) {
          hits++;
        } else {
          misses++;
        }
      }

      const hitRate = (hits / iterations) * 100;
      console.log(`Cache Hit Rate: ${hitRate.toFixed(1)}% (${hits} hits, ${misses} misses)`);

      // 命中率应该接近 80%
      expect(hitRate).toBeGreaterThan(70);
    });
  });

  describe('DOM Hasher Performance', () => {
    let hasher: DOMHasher;

    beforeEach(() => {
      hasher = new DOMHasher();
    });

    it('should measure hash generation performance', async () => {
      const iterations = 10000;
      const instruction = '点击搜索按钮';

      const duration = await measureTime(() => {
        for (let i = 0; i < iterations; i++) {
          hasher.hashAction(instruction);
        }
      });

      const opsPerSecond = (iterations / duration) * 1000;
      console.log(`Hash Generation: ${iterations} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 100ms 内完成 10000 次哈希
      expect(duration).toBeLessThan(100);
    });

    it('should measure page hash performance', async () => {
      const iterations = 100;
      const html = `
        <html>
          <body>
            <div class="container">
              <button id="btn1">Button 1</button>
              <button id="btn2">Button 2</button>
              <input type="text" placeholder="Search" />
              <a href="/link">Link</a>
              ${'<p>Content paragraph</p>'.repeat(100)}
            </div>
          </body>
        </html>
      `;

      const duration = await measureTime(() => {
        for (let i = 0; i < iterations; i++) {
          hasher.hashPage(html);
        }
      });

      const opsPerSecond = (iterations / duration) * 1000;
      console.log(`Page Hash: ${iterations} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 1 秒内完成 100 次页面哈希
      expect(duration).toBeLessThan(1000);
    });

    it('should measure hash comparison performance', async () => {
      const iterations = 100000;
      const hash1 = hasher.hashAction('test1');
      const hash2 = hasher.hashAction('test2');

      const duration = await measureTime(() => {
        for (let i = 0; i < iterations; i++) {
          hasher.compare(hash1, hash2);
        }
      });

      const opsPerSecond = (iterations / duration) * 1000;
      console.log(`Hash Comparison: ${iterations} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 50ms 内完成 100000 次比较
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Multi-Branch Cache Performance', () => {
    let cacheManager: CacheManager;
    let multiBranchCache: MultiBranchCache;

    beforeEach(() => {
      cacheManager = new CacheManager();
      multiBranchCache = new MultiBranchCache(cacheManager, 5);
    });

    it('should measure multi-branch cache performance', async () => {
      const iterations = 100;
      const branchesPerAction = 5;

      const duration = await measureTime(async () => {
        for (let i = 0; i < iterations; i++) {
          const actionKey = `action-${i}`;

          // 设置多个分支
          for (let j = 0; j < branchesPerAction; j++) {
            await multiBranchCache.set(actionKey, `hash-${j}`, { branch: j });
          }

          // 随机获取一个分支
          const randomBranch = `hash-${Math.floor(Math.random() * branchesPerAction)}`;
          await multiBranchCache.get(actionKey, randomBranch);
        }
      });

      console.log(`Multi-Branch Cache: ${iterations} actions × ${branchesPerAction} branches in ${duration.toFixed(2)}ms`);

      // 应该能在 2 秒内完成
      expect(duration).toBeLessThan(2000);
    });

    it('should measure branch switching performance', async () => {
      const iterations = 1000;
      const actionKey = 'test-action';

      // 预填充缓存
      for (let i = 0; i < 5; i++) {
        await multiBranchCache.set(actionKey, `hash-${i}`, { branch: i });
      }

      const duration = await measureTime(async () => {
        for (let i = 0; i < iterations; i++) {
          const randomBranch = `hash-${Math.floor(Math.random() * 5)}`;
          await multiBranchCache.get(actionKey, randomBranch);
        }
      });

      const opsPerSecond = (iterations / duration) * 1000;
      console.log(`Branch Switching: ${iterations} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 500ms 内完成
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Workflow Executor Performance', () => {
    let engine: StagehandEngine;
    let executor: WorkflowExecutor;

    beforeEach(() => {
      engine = createStagehandEngine({ enableCaching: false });
      executor = createWorkflowExecutor(engine, {
        enableCache: false,
        retryCount: 0,
      });
    });

    it('should measure topological sort performance', async () => {
      const nodeCount = 100;
      const edgeCount = 150;

      // 创建节点
      const nodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          id: `node-${i}`,
          type: 'action',
          position: { x: 0, y: i * 100 },
          data: { label: `Node ${i}`, instruction: `Action ${i}`, actionType: 'click', status: 'idle' },
        });
      }

      // 创建边（确保无环）
      const edges: Edge[] = [];
      for (let i = 0; i < edgeCount; i++) {
        const source = Math.floor(Math.random() * (nodeCount - 1));
        const target = source + 1 + Math.floor(Math.random() * Math.min(5, nodeCount - source - 1));
        edges.push({
          id: `edge-${i}`,
          source: `node-${source}`,
          target: `node-${target}`,
        });
      }

      const duration = await measureTime(async () => {
        await executor.execute(nodes, edges);
      });

      console.log(`Topological Sort: ${nodeCount} nodes, ${edgeCount} edges in ${duration.toFixed(2)}ms`);

      // 应该能在 1 秒内完成
      expect(duration).toBeLessThan(1000);
    });

    it('should measure execution overhead', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        {
          id: 'action1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: { label: '动作', instruction: '点击', actionType: 'click', status: 'idle' },
        },
        { id: 'end', type: 'end', position: { x: 0, y: 200 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'end' },
      ];

      const iterations = 10;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const duration = await measureTime(async () => {
          await executor.execute(nodes, edges);
        });
        durations.push(duration);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      console.log(`Execution Overhead: avg=${avgDuration.toFixed(2)}ms, min=${minDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      // 平均执行时间应该在 500ms 以内
      expect(avgDuration).toBeLessThan(500);
    });
  });

  describe('Memory Performance', () => {
    it('should measure memory usage for cache', async () => {
      const cacheManager = new CacheManager();
      const iterations = 1000;
      const dataSize = 1024; // 1KB per entry

      const memoryBefore = measureMemory();

      // 填充缓存
      const data = 'x'.repeat(dataSize);
      for (let i = 0; i < iterations; i++) {
        await cacheManager.set(`key-${i}`, { data, index: i });
      }

      const memoryAfter = measureMemory();
      const memoryUsed = memoryAfter.used - memoryBefore.used;

      console.log(`Memory Usage: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB for ${iterations} entries (${(memoryUsed / iterations / 1024).toFixed(2)}KB per entry)`);

      // 内存使用应该在合理范围内（< 50MB）
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024);

      await cacheManager.clear();
    });

    it('should measure memory cleanup', async () => {
      const cacheManager = new CacheManager();
      const iterations = 1000;

      // 填充缓存
      for (let i = 0; i < iterations; i++) {
        await cacheManager.set(`key-${i}`, { data: 'x'.repeat(1024) });
      }

      const statsBefore = await cacheManager.getStats();
      console.log(`Before cleanup: ${statsBefore.totalEntries} entries`);

      // 清除缓存
      await cacheManager.clear();

      const statsAfter = await cacheManager.getStats();
      console.log(`After cleanup: ${statsAfter.totalEntries} entries`);

      // 应该清除所有条目
      expect(statsAfter.totalEntries).toBe(0);
      expect(statsBefore.totalEntries).toBe(iterations);
    });
  });

  describe('Concurrent Performance', () => {
    it('should measure concurrent cache operations', async () => {
      const cacheManager = new CacheManager();
      const iterations = 100;
      const concurrency = 10;

      const duration = await measureTime(async () => {
        const promises = [];
        for (let i = 0; i < concurrency; i++) {
          promises.push(
            (async () => {
              for (let j = 0; j < iterations; j++) {
                await cacheManager.set(`key-${i}-${j}`, { data: j });
                await cacheManager.get(`key-${i}-${j}`);
              }
            })()
          );
        }
        await Promise.all(promises);
      });

      const totalOps = concurrency * iterations * 2; // 读 + 写
      const opsPerSecond = (totalOps / duration) * 1000;

      console.log(`Concurrent Cache: ${totalOps} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 5 秒内完成
      expect(duration).toBeLessThan(5000);

      await cacheManager.clear();
    });

    it('should measure concurrent hash operations', async () => {
      const hasher = new DOMHasher();
      const iterations = 1000;
      const concurrency = 10;

      const duration = await measureTime(() => {
        const promises = [];
        for (let i = 0; i < concurrency; i++) {
          promises.push(
            (async () => {
              for (let j = 0; j < iterations; j++) {
                hasher.hashAction(`instruction-${i}-${j}`);
              }
            })()
          );
        }
        return Promise.all(promises);
      });

      const totalOps = concurrency * iterations;
      const opsPerSecond = (totalOps / duration) * 1000;

      console.log(`Concurrent Hash: ${totalOps} ops in ${duration.toFixed(2)}ms (${opsPerSecond.toFixed(0)} ops/s)`);

      // 应该能在 500ms 内完成
      expect(duration).toBeLessThan(500);
    });
  });
});

/**
 * Model-RPA Performance Monitor
 * 性能监控工具
 */

// 性能指标类型
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
  tags?: Record<string, string>;
}

// 性能监控配置
export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // 0-1
  maxMetrics: number;
  reportInterval: number; // ms
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private reportTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxMetrics: 1000,
      reportInterval: 60000, // 1 minute
      ...config,
    };
  }

  /**
   * 启动监控
   */
  start(): void {
    if (!this.config.enabled) return;

    // 监控页面加载性能
    this.observePageLoad();

    // 监控长任务
    this.observeLongTasks();

    // 监控内存使用
    this.observeMemory();

    // 定期上报
    this.reportTimer = setInterval(() => {
      this.report();
    }, this.config.reportInterval);
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
  }

  /**
   * 记录指标
   */
  record(metric: PerformanceMetric): void {
    if (!this.config.enabled) return;
    if (Math.random() > this.config.sampleRate) return;

    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    // 限制存储数量
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  /**
   * 开始计时
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * 结束计时
   */
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.record({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags,
    });

    return duration;
  }

  /**
   * 计数器递增
   */
  increment(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  /**
   * 计数器递减
   */
  decrement(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, Math.max(0, current - value));
  }

  /**
   * 获取计数器值
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * 记录页面加载性能
   */
  private observePageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (timing) {
        // DNS 查询时间
        this.record({
          name: 'page.dns',
          value: timing.domainLookupEnd - timing.domainLookupStart,
          unit: 'ms',
          timestamp: Date.now(),
        });

        // TCP 连接时间
        this.record({
          name: 'page.tcp',
          value: timing.connectEnd - timing.connectStart,
          unit: 'ms',
          timestamp: Date.now(),
        });

        // 请求响应时间
        this.record({
          name: 'page.request',
          value: timing.responseEnd - timing.requestStart,
          unit: 'ms',
          timestamp: Date.now(),
        });

        // DOM 解析时间
        this.record({
          name: 'page.domParse',
          value: timing.domInteractive - timing.responseEnd,
          unit: 'ms',
          timestamp: Date.now(),
        });

        // DOMContentLoaded 时间
        this.record({
          name: 'page.domContentLoaded',
          value: timing.domContentLoadedEventEnd - timing.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        });

        // 页面加载时间
        this.record({
          name: 'page.load',
          value: timing.loadEventEnd - timing.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }
    });
  }

  /**
   * 监控长任务
   */
  private observeLongTasks(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.record({
            name: 'longtask',
            value: entry.duration,
            unit: 'ms',
            timestamp: Date.now(),
            tags: {
              attribution: (entry as any).attribution?.[0]?.name || 'unknown',
            },
          });
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  /**
   * 监控内存使用
   */
  private observeMemory(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    setInterval(() => {
      const memory = (performance as any).memory;

      if (memory) {
        this.record({
          name: 'memory.usedJSHeapSize',
          value: memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
        });

        this.record({
          name: 'memory.totalJSHeapSize',
          value: memory.totalJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
        });

        this.record({
          name: 'memory.jsHeapSizeLimit',
          value: memory.jsHeapSizeLimit,
          unit: 'bytes',
          timestamp: Date.now(),
        });
      }
    }, 30000); // 每 30 秒检查一次
  }

  /**
   * 上报指标
   */
  private report(): void {
    if (this.metrics.length === 0) return;

    // 计算统计信息
    const stats = this.calculateStats();

    // 输出到控制台（开发模式）
    if (process.env.NODE_ENV === 'development') {
      console.group('Performance Metrics');
      console.table(stats);
      console.groupEnd();
    }

    // TODO: 上报到后端
    // await invoke('report_performance', { metrics: this.metrics });

    // 清除已上报的指标
    this.metrics = [];
  }

  /**
   * 计算统计信息
   */
  private calculateStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    // 按名称分组
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // 计算统计值
    for (const [name, values] of Object.entries(grouped)) {
      stats[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p50: this.percentile(values, 50),
        p90: this.percentile(values, 90),
        p99: this.percentile(values, 99),
      };
    }

    return stats;
  }

  /**
   * 计算百分位数
   */
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 清除指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

// 全局性能监控实例
export const perfMonitor = new PerformanceMonitor({
  enabled: true,
  sampleRate: 1.0,
  maxMetrics: 1000,
  reportInterval: 60000,
});

// 便捷函数
export const perf = {
  start: () => perfMonitor.start(),
  stop: () => perfMonitor.stop(),
  record: (metric: PerformanceMetric) => perfMonitor.record(metric),
  startTimer: (name: string) => perfMonitor.startTimer(name),
  endTimer: (name: string, tags?: Record<string, string>) => perfMonitor.endTimer(name, tags),
  increment: (name: string, value?: number) => perfMonitor.increment(name, value),
  decrement: (name: string, value?: number) => perfMonitor.decrement(name, value),
  getCounter: (name: string) => perfMonitor.getCounter(name),
};

// React Hook
import { useEffect, useRef } from 'react';

export function usePerformanceTimer(name: string) {
  const timerRef = useRef<string>(name);

  useEffect(() => {
    perfMonitor.startTimer(timerRef.current);

    return () => {
      perfMonitor.endTimer(timerRef.current);
    };
  }, []);
}

export function usePerformanceCounter(name: string) {
  useEffect(() => {
    perfMonitor.increment(name);

    return () => {
      perfMonitor.decrement(name);
    };
  }, []);
}

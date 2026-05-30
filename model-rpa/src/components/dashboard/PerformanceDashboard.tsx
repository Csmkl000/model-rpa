/**
 * Model-RPA Performance Dashboard
 * 性能监控仪表盘
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface PerformanceMetrics {
  // 系统指标
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;

  // 应用指标
  uptime: number;
  activeWorkflows: number;
  totalExecutions: number;

  // 缓存指标
  cacheHitRate: number;
  cacheSize: number;
  cacheEntries: number;

  // 性能指标
  avgExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;

  // 错误指标
  errorRate: number;
  totalErrors: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 秒

  useEffect(() => {
    loadMetrics();
    loadAlerts();

    const interval = setInterval(() => {
      loadMetrics();
      loadAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadMetrics = async () => {
    try {
      // 模拟数据（实际应从后端获取）
      const mockMetrics: PerformanceMetrics = {
        cpuUsage: Math.random() * 30 + 10,
        memoryUsage: Math.random() * 200 + 100,
        memoryTotal: 8192,
        uptime: Date.now() - 1000000,
        activeWorkflows: Math.floor(Math.random() * 5),
        totalExecutions: Math.floor(Math.random() * 1000),
        cacheHitRate: 80 + Math.random() * 15,
        cacheSize: Math.random() * 100,
        cacheEntries: Math.floor(Math.random() * 1000),
        avgExecutionTime: Math.random() * 500 + 100,
        p95ExecutionTime: Math.random() * 1000 + 500,
        p99ExecutionTime: Math.random() * 2000 + 1000,
        errorRate: Math.random() * 5,
        totalErrors: Math.floor(Math.random() * 50),
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('加载性能指标失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      // 模拟告警数据
      const mockAlerts: Alert[] = [];

      if (metrics && metrics.cpuUsage > 80) {
        mockAlerts.push({
          id: 'cpu-high',
          type: 'warning',
          message: 'CPU 使用率过高',
          timestamp: new Date().toISOString(),
          metric: 'cpuUsage',
          value: metrics.cpuUsage,
          threshold: 80,
        });
      }

      if (metrics && metrics.memoryUsage > 500) {
        mockAlerts.push({
          id: 'memory-high',
          type: 'warning',
          message: '内存使用过高',
          timestamp: new Date().toISOString(),
          metric: 'memoryUsage',
          value: metrics.memoryUsage,
          threshold: 500,
        });
      }

      if (metrics && metrics.errorRate > 10) {
        mockAlerts.push({
          id: 'error-rate-high',
          type: 'error',
          message: '错误率过高',
          timestamp: new Date().toISOString(),
          metric: 'errorRate',
          value: metrics.errorRate,
          threshold: 10,
        });
      }

      setAlerts(mockAlerts);
    } catch (error) {
      console.error('加载告警失败:', error);
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天 ${hours % 24}小时`;
    if (hours > 0) return `${hours}小时 ${minutes % 60}分钟`;
    return `${minutes}分钟`;
  };

  const formatBytes = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-500 py-8">
        加载性能指标失败
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">性能监控</h1>
            <p className="text-sm text-gray-500 mt-1">
              运行时间: {formatUptime(metrics.uptime)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={1000}>1 秒</option>
              <option value={5000}>5 秒</option>
              <option value={10000}>10 秒</option>
              <option value={30000}>30 秒</option>
            </select>
          </div>
        </div>

        {/* 告警 */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <span className="text-sm opacity-75">
                    {alert.value?.toFixed(1)} / {alert.threshold}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* CPU 使用率 */}
          <MetricCard
            title="CPU 使用率"
            value={`${metrics.cpuUsage.toFixed(1)}%`}
            icon="💻"
            status={metrics.cpuUsage > 80 ? 'warning' : metrics.cpuUsage > 90 ? 'error' : 'normal'}
          />

          {/* 内存使用 */}
          <MetricCard
            title="内存使用"
            value={formatBytes(metrics.memoryUsage)}
            icon="🧠"
            status={metrics.memoryUsage > 500 ? 'warning' : 'normal'}
            subtitle={`${((metrics.memoryUsage / metrics.memoryTotal) * 100).toFixed(1)}%`}
          />

          {/* 缓存命中率 */}
          <MetricCard
            title="缓存命中率"
            value={`${metrics.cacheHitRate.toFixed(1)}%`}
            icon="⚡️"
            status={metrics.cacheHitRate < 80 ? 'warning' : 'normal'}
            subtitle={`${metrics.cacheEntries} 条目`}
          />

          {/* 错误率 */}
          <MetricCard
            title="错误率"
            value={`${metrics.errorRate.toFixed(1)}%`}
            icon="📊"
            status={metrics.errorRate > 10 ? 'error' : metrics.errorRate > 5 ? 'warning' : 'normal'}
            subtitle={`${metrics.totalErrors} 错误`}
          />
        </div>

        {/* 详细指标 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 执行性能 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">执行性能</h3>
            <div className="space-y-4">
              <MetricRow label="平均执行时间" value={`${metrics.avgExecutionTime.toFixed(0)}ms`} />
              <MetricRow label="P95 执行时间" value={`${metrics.p95ExecutionTime.toFixed(0)}ms`} />
              <MetricRow label="P99 执行时间" value={`${metrics.p99ExecutionTime.toFixed(0)}ms`} />
              <MetricRow label="总执行次数" value={metrics.totalExecutions.toString()} />
              <MetricRow label="活跃工作流" value={metrics.activeWorkflows.toString()} />
            </div>
          </div>

          {/* 缓存统计 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">缓存统计</h3>
            <div className="space-y-4">
              <MetricRow label="缓存大小" value={formatBytes(metrics.cacheSize)} />
              <MetricRow label="缓存条目" value={`${metrics.cacheEntries} 条`} />
              <MetricRow label="命中率" value={`${metrics.cacheHitRate.toFixed(1)}%`} />
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>命中率进度</span>
                  <span>{metrics.cacheHitRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metrics.cacheHitRate >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, metrics.cacheHitRate)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 指标卡片组件
function MetricCard({
  title,
  value,
  icon,
  status,
  subtitle,
}: {
  title: string;
  value: string;
  icon: string;
  status: 'normal' | 'warning' | 'error';
  subtitle?: string;
}) {
  const statusColors = {
    normal: 'border-gray-200',
    warning: 'border-yellow-300',
    error: 'border-red-300',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

// 指标行组件
function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

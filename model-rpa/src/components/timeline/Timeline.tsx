/**
 * Model-RPA Timeline
 * 日志时间轴组件
 */

import { useState, useEffect } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  category: string;
  message: string;
  nodeId?: string;
  duration?: number;
  cached?: boolean;
}

const levelIcons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const levelColors: Record<string, string> = {
  info: 'text-blue-600 bg-blue-50',
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50',
};

export function Timeline() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // 模拟日志数据
  useEffect(() => {
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        category: '系统',
        message: '工作流开始执行',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        level: 'success',
        category: '动作',
        message: '⚡️ [点击搜索] 极速免流执行成功',
        nodeId: 'action-1',
        duration: 12,
        cached: true,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() + 2000).toISOString(),
        level: 'info',
        category: '数据提取',
        message: '正在提取商品列表...',
        nodeId: 'extract-1',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() + 3000).toISOString(),
        level: 'success',
        category: '数据提取',
        message: '成功提取 20 条商品数据',
        nodeId: 'extract-1',
        duration: 1500,
      },
      {
        id: '5',
        timestamp: new Date(Date.now() + 4000).toISOString(),
        level: 'warning',
        category: '循环',
        message: '正在翻页 (2/5)...',
        nodeId: 'loop-1',
      },
    ];

    setLogs(mockLogs);
  }, []);

  // 过滤日志
  const filteredLogs =
    filter === 'all' ? logs : logs.filter((log) => log.level === filter);

  // 清除日志
  const clearLogs = () => {
    setLogs([]);
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">执行日志</h3>
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 过滤器 */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">全部</option>
            <option value="info">信息</option>
            <option value="success">成功</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
          </select>

          {/* 自动滚动 */}
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              isAutoScroll
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isAutoScroll ? '📌 自动滚动' : '📌 手动滚动'}
          </button>

          {/* 清除 */}
          <button
            onClick={clearLogs}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            清除
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm">暂无日志</p>
              <p className="text-xs mt-1">执行工作流后将显示日志</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* 时间轴线 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* 日志条目 */}
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="relative flex gap-4">
                  {/* 时间轴节点 */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      levelColors[log.level]
                    }`}
                  >
                    {levelIcons[log.level]}
                  </div>

                  {/* 日志内容 */}
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">
                          {log.category}
                        </span>
                        {log.nodeId && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                            {log.nodeId}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900">{log.message}</p>

                    {/* 额外信息 */}
                    <div className="flex items-center gap-3 mt-2">
                      {log.duration !== undefined && (
                        <span className="text-xs text-gray-500">
                          耗时: {log.duration < 1000 ? `${log.duration}ms` : `${(log.duration / 1000).toFixed(1)}s`}
                        </span>
                      )}
                      {log.cached && (
                        <span className="cache-badge text-xs">⚡️ 极速</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 text-xs text-gray-500">
        <span>
          显示 {filteredLogs.length}/{logs.length} 条日志
        </span>
        <span>
          最后更新: {logs.length > 0 ? formatTime(logs[logs.length - 1].timestamp) : '--:--:--'}
        </span>
      </div>
    </div>
  );
}

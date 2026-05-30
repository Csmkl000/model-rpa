/**
 * Model-RPA Dev Console
 * 开发者控制台 - 双重视角 UI
 */

import { useState, useEffect, useRef } from 'react';
import { LogEntry, LogLevel, LogCategory } from '../../logger';

interface DevConsoleProps {
  logs: LogEntry[];
  onClear?: () => void;
  onExport?: () => void;
}

type ViewMode = 'timeline' | 'terminal';

const levelColors: Record<LogLevel, string> = {
  trace: 'text-gray-400',
  debug: 'text-blue-400',
  info: 'text-green-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  fatal: 'text-red-600',
};

const levelBgColors: Record<LogLevel, string> = {
  trace: 'bg-gray-50',
  debug: 'bg-blue-50',
  info: 'bg-green-50',
  warn: 'bg-yellow-50',
  error: 'bg-red-50',
  fatal: 'bg-red-100',
};

const categoryIcons: Record<LogCategory, string> = {
  system: '⚙️',
  action: '🖱️',
  extract: '📊',
  loop: '🔄',
  agent: '🤖',
  cache: '⚡️',
  network: '🌐',
  ui: '🎨',
};

export function DevConsole({ logs, onClear, onExport }: DevConsoleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // 过滤日志
  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (filterCategory !== 'all' && log.category !== filterCategory) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // 自动滚动
  useEffect(() => {
    if (isAutoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [filteredLogs, isAutoScroll]);

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold">开发者控制台</h3>

          {/* 视图切换 */}
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'timeline' ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              📊 时间轴
            </button>
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'terminal' ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              💻 终端
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 搜索 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索日志..."
            className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />

          {/* 级别过滤 */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
            className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">所有级别</option>
            <option value="trace">Trace</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="fatal">Fatal</option>
          </select>

          {/* 类别过滤 */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as LogCategory | 'all')}
            className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">所有类别</option>
            <option value="system">系统</option>
            <option value="action">动作</option>
            <option value="extract">提取</option>
            <option value="loop">循环</option>
            <option value="agent">Agent</option>
            <option value="cache">缓存</option>
            <option value="network">网络</option>
            <option value="ui">UI</option>
          </select>

          {/* 自动滚动 */}
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`px-2 py-1 text-xs rounded ${
              isAutoScroll ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {isAutoScroll ? '📌 自动' : '📌 手动'}
          </button>

          {/* 操作按钮 */}
          <button
            onClick={onClear}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            清除
          </button>
          <button
            onClick={onExport}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            导出
          </button>
        </div>
      </div>

      {/* 日志内容 */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <p>暂无日志</p>
              <p className="text-xs mt-1">执行工作流后将显示日志</p>
            </div>
          </div>
        ) : viewMode === 'timeline' ? (
          <TimelineView logs={filteredLogs} formatTime={formatTime} />
        ) : (
          <TerminalView logs={filteredLogs} formatTime={formatTime} />
        )}
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <span>
          显示 {filteredLogs.length}/{logs.length} 条日志
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Info: {logs.filter((l) => l.level === 'info').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Warn: {logs.filter((l) => l.level === 'warn').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            Error: {logs.filter((l) => l.level === 'error').length}
          </span>
        </div>
      </div>
    </div>
  );
}

// 时间轴视图（小白视角）
function TimelineView({
  logs,
  formatTime,
}: {
  logs: LogEntry[];
  formatTime: (timestamp: string) => string;
}) {
  return (
    <div className="relative">
      {/* 时间轴线 */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />

      {/* 日志条目 */}
      <div className="space-y-4">
        {logs.map((log, index) => (
          <div key={index} className="relative flex gap-4">
            {/* 时间轴节点 */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                levelBgColors[log.level]
              }`}
            >
              {categoryIcons[log.category]}
            </div>

            {/* 日志内容 */}
            <div className={`flex-1 rounded-lg p-3 ${levelBgColors[log.level]} bg-opacity-10`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${levelColors[log.level]}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{log.category}</span>
                  {log.nodeId && (
                    <span className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-400 rounded">
                      {log.nodeId}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
              </div>

              <p className="text-sm text-gray-200">{log.message}</p>

              {/* 额外信息 */}
              <div className="flex items-center gap-3 mt-2">
                {log.duration !== undefined && (
                  <span className="text-xs text-gray-500">
                    耗时: {log.duration < 1000 ? `${log.duration}ms` : `${(log.duration / 1000).toFixed(1)}s`}
                  </span>
                )}
                {log.cached && (
                  <span className="text-xs text-green-400">⚡️ 极速</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 终端视图（极客视角）
function TerminalView({
  logs,
  formatTime,
}: {
  logs: LogEntry[];
  formatTime: (timestamp: string) => string;
}) {
  return (
    <div className="space-y-1">
      {logs.map((log, index) => (
        <div
          key={index}
          className="flex items-start gap-2 hover:bg-gray-800 px-2 py-1 rounded"
        >
          <span className="text-xs text-gray-500 w-20 flex-shrink-0">
            {formatTime(log.timestamp)}
          </span>
          <span className={`text-xs font-medium w-12 flex-shrink-0 ${levelColors[log.level]}`}>
            [{log.level.toUpperCase()}]
          </span>
          <span className="text-xs text-gray-400 w-16 flex-shrink-0">
            [{log.category}]
          </span>
          {log.nodeId && (
            <span className="text-xs text-gray-500 w-24 flex-shrink-0">
              [{log.nodeId}]
            </span>
          )}
          <span className="text-xs text-gray-200 break-all">
            {log.message}
            {log.duration !== undefined && (
              <span className="text-gray-500 ml-2">({log.duration}ms)</span>
            )}
            {log.cached && <span className="text-green-400 ml-2">⚡️</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

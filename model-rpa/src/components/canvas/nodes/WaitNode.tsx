/**
 * Model-RPA Wait Node
 * 等待节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface WaitNodeData {
  label: string;
  waitType: 'fixed' | 'element' | 'condition' | 'random';
  waitTime: number; // 毫秒
  elementSelector?: string;
  condition?: string;
  minTime?: number;
  maxTime?: number;
  status: 'idle' | 'waiting' | 'completed' | 'timeout';
  remainingTime?: number;
}

const waitTypeLabels: Record<string, string> = {
  fixed: '固定时间',
  element: '等待元素',
  condition: '等待条件',
  random: '随机时间',
};

const waitTypeIcons: Record<string, string> = {
  fixed: '⏱️',
  element: '🔍',
  condition: '📋',
  random: '🎲',
};

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  waiting: 'border-blue-400 bg-blue-50',
  completed: 'border-green-400 bg-green-50',
  timeout: 'border-red-400 bg-red-50',
};

export const WaitNode = memo(({ data, selected }: NodeProps<WaitNodeData>) => {
  const { label, waitType, waitTime, condition, minTime, maxTime, status, remainingTime } = data;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  return (
    <div
      className={`relative min-w-[200px] rounded-xl border-2 shadow-sm transition-all ${
        statusColors[status]
      } ${selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
    >
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* 节点头部 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-blue-50 rounded-t-xl">
        <span className="text-lg">{waitTypeIcons[waitType]}</span>
        <span className="text-sm font-medium text-blue-700">等待</span>

        {/* 状态指示器 */}
        {status === 'waiting' && (
          <div className="ml-auto flex items-center gap-1">
            <div className="animate-pulse rounded-full h-4 w-4 bg-blue-400"></div>
            {remainingTime !== undefined && (
              <span className="text-xs text-blue-600">
                {formatTime(remainingTime)}
              </span>
            )}
          </div>
        )}
        {status === 'completed' && (
          <span className="ml-auto text-green-600 text-sm">✓ 完成</span>
        )}
        {status === 'timeout' && (
          <span className="ml-auto text-red-600 text-sm">⏰ 超时</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>

        {/* 等待类型 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <span>{waitTypeIcons[waitType]}</span>
          <span>{waitTypeLabels[waitType]}</span>
        </div>

        {/* 等待时间 */}
        {waitType === 'fixed' && (
          <div className="text-xs text-gray-500">
            等待时间: {formatTime(waitTime)}
          </div>
        )}

        {/* 随机时间范围 */}
        {waitType === 'random' && minTime !== undefined && maxTime !== undefined && (
          <div className="text-xs text-gray-500">
            范围: {formatTime(minTime)} - {formatTime(maxTime)}
          </div>
        )}

        {/* 条件 */}
        {waitType === 'condition' && condition && (
          <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 mt-1">
            条件: {condition}
          </div>
        )}

        {/* 进度条 */}
        {status === 'waiting' && remainingTime !== undefined && (
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, (1 - remainingTime / waitTime) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
});

WaitNode.displayName = 'WaitNode';

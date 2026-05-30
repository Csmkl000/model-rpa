/**
 * Model-RPA Error Handle Node
 * 错误处理节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ErrorHandleNodeData {
  label: string;
  strategy: 'retry' | 'skip' | 'fallback' | 'stop';
  maxRetries: number;
  retryDelay: number;
  fallbackAction?: string;
  status: 'idle' | 'handling' | 'resolved' | 'failed';
  errorMessage?: string;
  retryCount?: number;
}

const strategyLabels: Record<string, string> = {
  retry: '重试',
  skip: '跳过',
  fallback: '备选方案',
  stop: '停止',
};

const strategyIcons: Record<string, string> = {
  retry: '🔄',
  skip: '⏭️',
  fallback: '🔀',
  stop: '🛑',
};

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  handling: 'border-orange-400 bg-orange-50',
  resolved: 'border-green-400 bg-green-50',
  failed: 'border-red-400 bg-red-50',
};

export const ErrorHandleNode = memo(({ data, selected }: NodeProps<ErrorHandleNodeData>) => {
  const { label, strategy, maxRetries, retryDelay, status, errorMessage, retryCount } = data;

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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-orange-50 rounded-t-xl">
        <span className="text-lg">🛡️</span>
        <span className="text-sm font-medium text-orange-700">错误处理</span>

        {/* 状态指示器 */}
        {status === 'handling' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
          </div>
        )}
        {status === 'resolved' && (
          <span className="ml-auto text-green-600 text-sm">✓ 已解决</span>
        )}
        {status === 'failed' && (
          <span className="ml-auto text-red-600 text-sm">✕ 失败</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>

        {/* 策略信息 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <span>{strategyIcons[strategy]}</span>
          <span>策略: {strategyLabels[strategy]}</span>
        </div>

        {/* 重试信息 */}
        {strategy === 'retry' && (
          <div className="text-xs text-gray-500">
            <span>最大重试: {maxRetries} 次</span>
            <span className="ml-2">延迟: {retryDelay}ms</span>
          </div>
        )}

        {/* 当前重试次数 */}
        {retryCount !== undefined && retryCount > 0 && (
          <div className="text-xs text-orange-600 mt-1">
            已重试: {retryCount} 次
          </div>
        )}

        {/* 错误信息 */}
        {errorMessage && (
          <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-2 truncate">
            {errorMessage}
          </div>
        )}
      </div>

      {/* 输出连接点 - 成功 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className="!w-3 !h-3 !bg-green-400 !border-2 !border-white"
        style={{ left: '30%' }}
      />
      <div className="absolute bottom-[-20px] left-[30%] transform -translate-x-1/2 text-xs text-green-600">
        成功
      </div>

      {/* 输出连接点 - 失败 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="failure"
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-white"
        style={{ left: '70%' }}
      />
      <div className="absolute bottom-[-20px] left-[70%] transform -translate-x-1/2 text-xs text-red-600">
        失败
      </div>
    </div>
  );
});

ErrorHandleNode.displayName = 'ErrorHandleNode';

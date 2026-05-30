/**
 * Model-RPA Loop Node
 * 循环节点组件（翻页、重复执行）
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface LoopNodeData {
  label: string;
  instruction: string;
  maxIterations: number;
  currentIteration?: number;
  status: 'idle' | 'running' | 'success' | 'error' | 'completed';
}

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  running: 'border-amber-400 bg-amber-50',
  success: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
  completed: 'border-green-400 bg-green-50',
};

export const LoopNode = memo(({ data, selected }: NodeProps<LoopNodeData>) => {
  const { label, instruction, maxIterations, currentIteration, status } = data;

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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-amber-50 rounded-t-xl">
        <span className="text-lg">🔄</span>
        <span className="text-sm font-medium text-amber-700">循环</span>

        {/* 状态指示器 */}
        {status === 'running' && (
          <div className="ml-auto flex items-center gap-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
            {currentIteration !== undefined && (
              <span className="text-xs text-amber-600">
                {currentIteration}/{maxIterations}
              </span>
            )}
          </div>
        )}
        {status === 'completed' && (
          <span className="ml-auto text-green-600 text-sm">✓ 完成</span>
        )}
        {status === 'error' && (
          <span className="ml-auto text-red-600 text-sm">✕</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
        {instruction && (
          <div className="text-xs text-gray-500 truncate mb-2">{instruction}</div>
        )}

        {/* 循环信息 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>最大次数: {maxIterations}</span>
          {currentIteration !== undefined && status === 'running' && (
            <span className="text-amber-600">
              当前: {currentIteration}
            </span>
          )}
        </div>

        {/* 进度条 */}
        {status === 'running' && currentIteration !== undefined && (
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentIteration / maxIterations) * 100}%` }}
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

LoopNode.displayName = 'LoopNode';

/**
 * Model-RPA Agent Node
 * Agent 自主托管节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface AgentNodeData {
  label: string;
  task: string;
  requireConfirmation: boolean;
  status: 'idle' | 'running' | 'waiting' | 'success' | 'error';
  currentStep?: string;
  progress?: number;
}

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  running: 'border-red-400 bg-red-50',
  waiting: 'border-yellow-400 bg-yellow-50',
  success: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
};

export const AgentNode = memo(({ data, selected }: NodeProps<AgentNodeData>) => {
  const { label, task, requireConfirmation, status, currentStep, progress } = data;

  return (
    <div
      className={`relative min-w-[220px] rounded-xl border-2 shadow-sm transition-all ${
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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-red-50 rounded-t-xl">
        <span className="text-lg">🤖</span>
        <span className="text-sm font-medium text-red-700">Agent</span>

        {/* 状态指示器 */}
        {status === 'running' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          </div>
        )}
        {status === 'waiting' && (
          <span className="ml-auto text-yellow-600 text-sm">⏳ 等待确认</span>
        )}
        {status === 'success' && (
          <span className="ml-auto text-green-600 text-sm">✓</span>
        )}
        {status === 'error' && (
          <span className="ml-auto text-red-600 text-sm">✕</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
        {task && (
          <div className="text-xs text-gray-500 truncate mb-2">{task}</div>
        )}

        {/* 人工确认标识 */}
        {requireConfirmation && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 rounded px-2 py-1 mb-2">
            <span>⚠️</span>
            <span>需要人工确认</span>
          </div>
        )}

        {/* 当前步骤 */}
        {currentStep && status === 'running' && (
          <div className="text-xs text-red-600 mb-2">
            当前: {currentStep}
          </div>
        )}

        {/* 进度条 */}
        {status === 'running' && progress !== undefined && (
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
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

AgentNode.displayName = 'AgentNode';

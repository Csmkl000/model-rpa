/**
 * Model-RPA Action Node
 * 动作节点组件（点击、输入、选择）
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ActionNodeData {
  label: string;
  instruction: string;
  actionType: 'click' | 'input' | 'select' | 'hover' | 'scroll';
  status: 'idle' | 'running' | 'success' | 'error' | 'cached';
  cached?: boolean;
}

const actionTypeIcons: Record<string, string> = {
  click: '🖱️',
  input: '⌨️',
  select: '📋',
  hover: '👆',
  scroll: '📜',
};

const actionTypeLabels: Record<string, string> = {
  click: '点击',
  input: '输入',
  select: '选择',
  hover: '悬停',
  scroll: '滚动',
};

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  running: 'border-blue-400 bg-blue-50',
  success: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
  cached: 'border-green-400 bg-green-50',
};

export const ActionNode = memo(({ data, selected }: NodeProps<ActionNodeData>) => {
  const { label, instruction, actionType, status, cached } = data;

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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <span className="text-lg">{actionTypeIcons[actionType]}</span>
        <span className="text-sm font-medium text-gray-700">{actionTypeLabels[actionType]}</span>

        {/* 状态指示器 */}
        {status === 'running' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        {status === 'success' && (
          <span className="ml-auto text-green-600 text-sm">✓</span>
        )}
        {status === 'cached' && (
          <span className="ml-auto cache-badge text-xs">⚡️ 极速</span>
        )}
        {status === 'error' && (
          <span className="ml-auto text-red-600 text-sm">✕</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
        {instruction && (
          <div className="text-xs text-gray-500 truncate">{instruction}</div>
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

ActionNode.displayName = 'ActionNode';

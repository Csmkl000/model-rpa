/**
 * Model-RPA End Node
 * 结束节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface EndNodeData {
  label: string;
  status?: 'idle' | 'success' | 'error';
}

const statusColors: Record<string, string> = {
  idle: 'border-gray-400 bg-gray-50',
  success: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
};

export const EndNode = memo(({ data, selected }: NodeProps<EndNodeData>) => {
  const { label, status = 'idle' } = data;

  return (
    <div
      className={`relative min-w-[120px] rounded-full border-2 shadow-sm transition-all ${
        statusColors[status]
      } ${selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
    >
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* 节点内容 */}
      <div className="px-4 py-2 text-center">
        <span className="text-lg">⏹️</span>
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';

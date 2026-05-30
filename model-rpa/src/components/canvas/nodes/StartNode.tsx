/**
 * Model-RPA Start Node
 * 开始节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface StartNodeData {
  label: string;
}

export const StartNode = memo(({ data, selected }: NodeProps<StartNodeData>) => {
  const { label } = data;

  return (
    <div
      className={`relative min-w-[120px] rounded-full border-2 border-green-400 bg-green-50 shadow-sm transition-all ${
        selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
      }`}
    >
      {/* 节点内容 */}
      <div className="px-4 py-2 text-center">
        <span className="text-lg">▶️</span>
        <div className="text-sm font-medium text-green-700">{label}</div>
      </div>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-400 !border-2 !border-white"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';

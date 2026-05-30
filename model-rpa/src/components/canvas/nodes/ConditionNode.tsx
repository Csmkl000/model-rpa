/**
 * Model-RPA Condition Node
 * 条件判断节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ConditionNodeData {
  label: string;
  condition: string;
  status: 'idle' | 'running' | 'true' | 'false' | 'error';
}

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  running: 'border-purple-400 bg-purple-50',
  true: 'border-green-400 bg-green-50',
  false: 'border-orange-400 bg-orange-50',
  error: 'border-red-400 bg-red-50',
};

export const ConditionNode = memo(({ data, selected }: NodeProps<ConditionNodeData>) => {
  const { label, condition, status } = data;

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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-purple-50 rounded-t-xl">
        <span className="text-lg">🔀</span>
        <span className="text-sm font-medium text-purple-700">条件判断</span>

        {/* 状态指示器 */}
        {status === 'running' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
        {status === 'true' && (
          <span className="ml-auto text-green-600 text-sm">✓ True</span>
        )}
        {status === 'false' && (
          <span className="ml-auto text-orange-600 text-sm">○ False</span>
        )}
        {status === 'error' && (
          <span className="ml-auto text-red-600 text-sm">✕</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
        {condition && (
          <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 font-mono">
            {condition}
          </div>
        )}
      </div>

      {/* 输出连接点 - True */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-3 !h-3 !bg-green-400 !border-2 !border-white"
        style={{ left: '30%' }}
      />
      <div className="absolute bottom-[-20px] left-[30%] transform -translate-x-1/2 text-xs text-green-600">
        True
      </div>

      {/* 输出连接点 - False */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white"
        style={{ left: '70%' }}
      />
      <div className="absolute bottom-[-20px] left-[70%] transform -translate-x-1/2 text-xs text-orange-600">
        False
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

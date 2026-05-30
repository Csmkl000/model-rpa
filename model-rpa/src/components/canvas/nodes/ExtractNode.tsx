/**
 * Model-RPA Extract Node
 * 数据提取节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ExtractNodeData {
  label: string;
  instruction: string;
  fields: string[];
  status: 'idle' | 'running' | 'success' | 'error';
  extractedCount?: number;
}

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  running: 'border-blue-400 bg-blue-50',
  success: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
};

export const ExtractNode = memo(({ data, selected }: NodeProps<ExtractNodeData>) => {
  const { label, instruction, fields, status, extractedCount } = data;

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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-emerald-50 rounded-t-xl">
        <span className="text-lg">📊</span>
        <span className="text-sm font-medium text-emerald-700">数据提取</span>

        {/* 状态指示器 */}
        {status === 'running' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
          </div>
        )}
        {status === 'success' && (
          <span className="ml-auto text-emerald-600 text-sm">✓</span>
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

        {/* 字段列表 */}
        {fields.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {fields.slice(0, 3).map((field, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full"
              >
                {field}
              </span>
            ))}
            {fields.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                +{fields.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 提取数量 */}
        {extractedCount !== undefined && extractedCount > 0 && (
          <div className="text-xs text-emerald-600 mt-2">
            已提取 {extractedCount} 条数据
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

ExtractNode.displayName = 'ExtractNode';

/**
 * Model-RPA Variable Node
 * 变量节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface VariableNodeData {
  label: string;
  variableName: string;
  variableType: 'string' | 'number' | 'boolean' | 'array' | 'object';
  operation: 'set' | 'get' | 'increment' | 'decrement' | 'append' | 'concat';
  value?: any;
  expression?: string;
  status: 'idle' | 'executing' | 'completed' | 'error';
  currentValue?: any;
}

const variableTypeLabels: Record<string, string> = {
  string: '字符串',
  number: '数字',
  boolean: '布尔',
  array: '数组',
  object: '对象',
};

const operationLabels: Record<string, string> = {
  set: '设置',
  get: '获取',
  increment: '递增',
  decrement: '递减',
  append: '追加',
  concat: '拼接',
};

const operationIcons: Record<string, string> = {
  set: '📝',
  get: '📖',
  increment: '➕',
  decrement: '➖',
  append: '📎',
  concat: '🔗',
};

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  executing: 'border-blue-400 bg-blue-50',
  completed: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
};

export const VariableNode = memo(({ data, selected }: NodeProps<VariableNodeData>) => {
  const { label, variableName, variableType, operation, value, status, currentValue } = data;

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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-teal-50 rounded-t-xl">
        <span className="text-lg">{operationIcons[operation]}</span>
        <span className="text-sm font-medium text-teal-700">变量</span>

        {/* 状态指示器 */}
        {status === 'executing' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
          </div>
        )}
        {status === 'completed' && (
          <span className="ml-auto text-green-600 text-sm">✓</span>
        )}
        {status === 'error' && (
          <span className="ml-auto text-red-600 text-sm">✕</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>

        {/* 变量信息 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <span className="font-mono bg-gray-100 px-1 rounded">{variableName}</span>
          <span className="text-gray-400">:</span>
          <span>{variableTypeLabels[variableType]}</span>
        </div>

        {/* 操作信息 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{operationIcons[operation]}</span>
          <span>{operationLabels[operation]}</span>
          {value !== undefined && (
            <span className="text-gray-400 truncate">= {JSON.stringify(value)}</span>
          )}
        </div>

        {/* 当前值 */}
        {currentValue !== undefined && (
          <div className="text-xs text-teal-600 bg-teal-50 rounded px-2 py-1 mt-2">
            当前值: {JSON.stringify(currentValue)}
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

VariableNode.displayName = 'VariableNode';

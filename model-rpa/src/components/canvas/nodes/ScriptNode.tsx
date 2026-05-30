/**
 * Model-RPA Script Node
 * 脚本节点组件
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ScriptNodeData {
  label: string;
  language: 'javascript' | 'python' | 'shell';
  code: string;
  timeout: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  output?: string;
  error?: string;
  executionTime?: number;
}

const languageLabels: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  shell: 'Shell',
};

const languageIcons: Record<string, string> = {
  javascript: '📜',
  python: '🐍',
  shell: '💻',
};

const statusColors: Record<string, string> = {
  idle: 'border-gray-300 bg-white',
  running: 'border-blue-400 bg-blue-50',
  completed: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
};

export const ScriptNode = memo(({ data, selected }: NodeProps<ScriptNodeData>) => {
  const { label, language, code, status, output, error, executionTime } = data;

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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-800 rounded-t-xl">
        <span className="text-lg">{languageIcons[language]}</span>
        <span className="text-sm font-medium text-gray-200">脚本</span>

        {/* 状态指示器 */}
        {status === 'running' && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        )}
        {status === 'completed' && (
          <span className="ml-auto text-green-400 text-sm">✓</span>
        )}
        {status === 'error' && (
          <span className="ml-auto text-red-400 text-sm">✕</span>
        )}
      </div>

      {/* 节点内容 */}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>

        {/* 语言信息 */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <span>{languageIcons[language]}</span>
          <span>{languageLabels[language]}</span>
        </div>

        {/* 代码预览 */}
        {code && (
          <div className="text-xs font-mono bg-gray-900 text-green-400 rounded px-2 py-1.5 mb-2 max-h-20 overflow-hidden">
            <pre className="whitespace-pre-wrap break-all">{code.substring(0, 100)}{code.length > 100 ? '...' : ''}</pre>
          </div>
        )}

        {/* 执行时间 */}
        {executionTime !== undefined && (
          <div className="text-xs text-gray-500">
            执行时间: {executionTime}ms
          </div>
        )}

        {/* 输出 */}
        {output && status === 'completed' && (
          <div className="text-xs text-green-600 bg-green-50 rounded px-2 py-1 mt-1 max-h-16 overflow-hidden">
            输出: {output.substring(0, 100)}{output.length > 100 ? '...' : ''}
          </div>
        )}

        {/* 错误 */}
        {error && status === 'error' && (
          <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-1 max-h-16 overflow-hidden">
            错误: {error.substring(0, 100)}{error.length > 100 ? '...' : ''}
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

ScriptNode.displayName = 'ScriptNode';

/**
 * Model-RPA Node Palette
 * 节点面板 - 可拖拽节点到画布
 */

import { useState } from 'react';

interface NodeItem {
  type: string;
  label: string;
  icon: string;
  description: string;
  category: string;
}

const nodes: NodeItem[] = [
  // 基础节点
  {
    type: 'action',
    label: '动作节点',
    icon: '🖱️',
    description: '点击、输入、选择等操作',
    category: '基础',
  },
  {
    type: 'extract',
    label: '数据提取',
    icon: '📊',
    description: '提取页面数据',
    category: '基础',
  },
  {
    type: 'wait',
    label: '等待',
    icon: '⏱️',
    description: '等待时间或条件',
    category: '基础',
  },

  // 控制节点
  {
    type: 'loop',
    label: '循环',
    icon: '🔄',
    description: '重复执行或翻页',
    category: '控制',
  },
  {
    type: 'condition',
    label: '条件判断',
    icon: '🔀',
    description: '根据条件分支',
    category: '控制',
  },
  {
    type: 'errorHandle',
    label: '错误处理',
    icon: '🛡️',
    description: '处理执行错误',
    category: '控制',
  },

  // 数据节点
  {
    type: 'variable',
    label: '变量',
    icon: '📝',
    description: '变量操作',
    category: '数据',
  },
  {
    type: 'script',
    label: '脚本',
    icon: '📜',
    description: '执行自定义代码',
    category: '数据',
  },

  // 通知节点
  {
    type: 'notification',
    label: '通知',
    icon: '🔔',
    description: '发送通知',
    category: '通知',
  },

  // 高级节点
  {
    type: 'agent',
    label: 'Agent 任务',
    icon: '🤖',
    description: 'AI 自主执行复杂任务',
    category: '高级',
  },
];

const categories = ['基础', '控制', '数据', '通知', '高级'];

export function NodePalette() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('基础');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">节点面板</h2>
        <p className="text-sm text-gray-500 mt-1">拖拽节点到画布</p>
      </div>

      <div className="p-2">
        {categories.map((category) => (
          <div key={category} className="mb-2">
            <button
              onClick={() =>
                setExpandedCategory(expandedCategory === category ? null : category)
              }
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <span>{category}</span>
              <span className="text-gray-400">
                {expandedCategory === category ? '▼' : '▶'}
              </span>
            </button>

            {expandedCategory === category && (
              <div className="mt-1 space-y-1">
                {nodes
                  .filter((node) => node.category === category)
                  .map((node) => (
                    <div
                      key={node.type}
                      className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 transition-colors"
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type)}
                    >
                      <span className="text-2xl">{node.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {node.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 使用提示 */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 拖拽节点到画布创建步骤</li>
            <li>• 连接节点定义执行顺序</li>
            <li>• 点击节点配置参数</li>
            <li>• 使用循环处理重复任务</li>
            <li>• 使用错误处理增强稳定性</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

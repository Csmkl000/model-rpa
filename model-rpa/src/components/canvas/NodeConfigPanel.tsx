/**
 * Model-RPA Node Config Panel
 * 节点配置面板
 */

import { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate?: (nodeId: string, data: any) => void;
}

export function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [formData, setFormData] = useState<any>(node.data);

  useEffect(() => {
    setFormData(node.data);
  }, [node]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(node.id, formData);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {getNodeIcon(node.type)}
          </span>
          <h3 className="text-sm font-semibold text-gray-900">
            {getNodeTypeLabel(node.type)}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 配置表单 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* 节点名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              节点名称
            </label>
            <input
              type="text"
              value={formData.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 根据节点类型显示不同的配置项 */}
          {node.type === 'action' && (
            <ActionConfig formData={formData} onChange={handleChange} />
          )}
          {node.type === 'extract' && (
            <ExtractConfig formData={formData} onChange={handleChange} />
          )}
          {node.type === 'loop' && (
            <LoopConfig formData={formData} onChange={handleChange} />
          )}
          {node.type === 'condition' && (
            <ConditionConfig formData={formData} onChange={handleChange} />
          )}
          {node.type === 'agent' && (
            <AgentConfig formData={formData} onChange={handleChange} />
          )}
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  );
}

// 动作节点配置
function ActionConfig({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          动作类型
        </label>
        <select
          value={formData.actionType || 'click'}
          onChange={(e) => onChange('actionType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="click">点击</option>
          <option value="input">输入</option>
          <option value="select">选择</option>
          <option value="hover">悬停</option>
          <option value="滚动">滚动</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          指令描述
        </label>
        <textarea
          value={formData.instruction || ''}
          onChange={(e) => onChange('instruction', e.target.value)}
          placeholder="用大白话描述要执行的动作..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">
          例如：点击搜索按钮、在输入框中输入"iPhone 15"
        </p>
      </div>

      {formData.actionType === 'input' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            输入内容
          </label>
          <input
            type="text"
            value={formData.inputValue || ''}
            onChange={(e) => onChange('inputValue', e.target.value)}
            placeholder="要输入的文本"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            支持安全变量：{'{{'}变量名{'}}'}
          </p>
        </div>
      )}
    </>
  );
}

// 数据提取配置
function ExtractConfig({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          提取指令
        </label>
        <textarea
          value={formData.instruction || ''}
          onChange={(e) => onChange('instruction', e.target.value)}
          placeholder="描述要提取的数据..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">
          例如：提取商品名称、价格、评分
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          提取字段
        </label>
        <div className="space-y-2">
          {(formData.fields || []).map((field: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={field}
                onChange={(e) => {
                  const newFields = [...(formData.fields || [])];
                  newFields[index] = e.target.value;
                  onChange('fields', newFields);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  const newFields = (formData.fields || []).filter(
                    (_: any, i: number) => i !== index
                  );
                  onChange('fields', newFields);
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              onChange('fields', [...(formData.fields || []), '']);
            }}
            className="w-full px-3 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            + 添加字段
          </button>
        </div>
      </div>
    </>
  );
}

// 循环配置
function LoopConfig({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          循环指令
        </label>
        <textarea
          value={formData.instruction || ''}
          onChange={(e) => onChange('instruction', e.target.value)}
          placeholder="描述循环条件..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">
          例如：点击下一页、继续加载直到没有更多内容
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          最大循环次数
        </label>
        <input
          type="number"
          value={formData.maxIterations || 10}
          onChange={(e) => onChange('maxIterations', parseInt(e.target.value))}
          min={1}
          max={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">
          防止无限循环的安全限制
        </p>
      </div>
    </>
  );
}

// 条件判断配置
function ConditionConfig({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        条件表达式
      </label>
      <textarea
        value={formData.condition || ''}
        onChange={(e) => onChange('condition', e.target.value)}
        placeholder="描述判断条件..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <p className="text-xs text-gray-400 mt-1">
        例如：如果页面包含"已售罄"、如果价格大于 100
      </p>
    </div>
  );
}

// Agent 配置
function AgentConfig({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          任务描述
        </label>
        <textarea
          value={formData.task || ''}
          onChange={(e) => onChange('task', e.target.value)}
          placeholder="描述要完成的任务..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">
          例如：找到联系我们页面并填写表单
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">需要人工确认</p>
          <p className="text-xs text-gray-500">执行高危动作前暂停确认</p>
        </div>
        <button
          onClick={() =>
            onChange('requireConfirmation', !formData.requireConfirmation)
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.requireConfirmation ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.requireConfirmation ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </>
  );
}

// 辅助函数
function getNodeIcon(type: string | undefined): string {
  switch (type) {
    case 'action':
      return '🖱️';
    case 'extract':
      return '📊';
    case 'loop':
      return '🔄';
    case 'condition':
      return '🔀';
    case 'agent':
      return '🤖';
    case 'start':
      return '▶️';
    case 'end':
      return '⏹️';
    default:
      return '❓';
  }
}

function getNodeTypeLabel(type: string | undefined): string {
  switch (type) {
    case 'action':
      return '动作节点';
    case 'extract':
      return '数据提取';
    case 'loop':
      return '循环';
    case 'condition':
      return '条件判断';
    case 'agent':
      return 'Agent 任务';
    case 'start':
      return '开始';
    case 'end':
      return '结束';
    default:
      return '未知节点';
  }
}

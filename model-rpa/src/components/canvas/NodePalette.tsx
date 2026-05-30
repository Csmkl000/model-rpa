/**
 * Model-RPA Node Palette
 * 节点面板 - 内联样式版本
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
  { type: 'action', label: '动作节点', icon: '🖱️', description: '点击、输入、选择', category: '基础' },
  { type: 'extract', label: '数据提取', icon: '📊', description: '提取页面数据', category: '基础' },
  { type: 'wait', label: '等待', icon: '⏱️', description: '等待时间或条件', category: '基础' },
  { type: 'loop', label: '循环', icon: '🔄', description: '重复执行或翻页', category: '控制' },
  { type: 'condition', label: '条件判断', icon: '🔀', description: '根据条件分支', category: '控制' },
  { type: 'errorHandle', label: '错误处理', icon: '🛡️', description: '处理执行错误', category: '控制' },
  { type: 'variable', label: '变量', icon: '📝', description: '变量操作', category: '数据' },
  { type: 'script', label: '脚本', icon: '📜', description: '执行自定义代码', category: '数据' },
  { type: 'notification', label: '通知', icon: '🔔', description: '发送通知', category: '通知' },
  { type: 'agent', label: 'Agent', icon: '🤖', description: 'AI 自主执行', category: '高级' },
];

const categories = ['基础', '控制', '数据', '通知', '高级'];

export function NodePalette() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('基础');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const styles = {
    container: {
      width: '240px',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      overflowY: 'auto' as const,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
    },
    title: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      margin: '0 0 4px 0',
    },
    subtitle: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0,
    },
    content: {
      padding: '8px',
      flex: 1,
    },
    categoryBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      fontSize: '13px',
      fontWeight: 500,
      color: '#374151',
      background: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    nodeList: {
      marginTop: '4px',
    },
    nodeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      background: '#f9fafb',
      borderRadius: '8px',
      cursor: 'grab',
      marginBottom: '4px',
      transition: 'background 0.2s',
    },
    nodeIcon: {
      fontSize: '24px',
    },
    nodeInfo: {
      flex: 1,
      minWidth: 0,
    },
    nodeLabel: {
      fontSize: '13px',
      fontWeight: 500,
      color: '#111827',
    },
    nodeDesc: {
      fontSize: '11px',
      color: '#6b7280',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    tips: {
      padding: '16px',
      borderTop: '1px solid #e5e7eb',
    },
    tipsBox: {
      background: '#eff6ff',
      borderRadius: '8px',
      padding: '12px',
    },
    tipsTitle: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#1e40af',
      margin: '0 0 8px 0',
    },
    tipsList: {
      fontSize: '11px',
      color: '#1e40af',
      margin: 0,
      paddingLeft: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>节点面板</h2>
        <p style={styles.subtitle}>拖拽节点到画布</p>
      </div>

      <div style={styles.content}>
        {categories.map((category) => (
          <div key={category} style={{ marginBottom: '4px' }}>
            <button
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              style={styles.categoryBtn}
            >
              <span>{category}</span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                {expandedCategory === category ? '▼' : '▶'}
              </span>
            </button>

            {expandedCategory === category && (
              <div style={styles.nodeList}>
                {nodes
                  .filter((node) => node.category === category)
                  .map((node) => (
                    <div
                      key={node.type}
                      style={styles.nodeItem}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                      }}
                    >
                      <span style={styles.nodeIcon}>{node.icon}</span>
                      <div style={styles.nodeInfo}>
                        <div style={styles.nodeLabel}>{node.label}</div>
                        <div style={styles.nodeDesc}>{node.description}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.tips}>
        <div style={styles.tipsBox}>
          <div style={styles.tipsTitle}>💡 使用提示</div>
          <ul style={styles.tipsList}>
            <li>拖拽节点到画布</li>
            <li>连接节点定义流程</li>
            <li>点击节点配置参数</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

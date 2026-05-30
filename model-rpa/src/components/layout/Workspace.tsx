/**
 * Model-RPA Workspace
 * 完整工作区 - 集成所有组件
 */

import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkflowCanvasWithProvider } from '../canvas/WorkflowCanvas';
import { NodePalette } from '../canvas/NodePalette';
import { LiveView } from '../liveview/LiveView';
import { NodeConfigPanel } from '../canvas/NodeConfigPanel';
import { Timeline } from '../timeline/Timeline';

interface WorkspaceProps {
  onBack: () => void;
}

export function Workspace({ onBack }: WorkspaceProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [message, setMessage] = useState('');

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  const handleWorkflowChange = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
    },
    []
  );

  const handleExecute = useCallback(() => {
    if (nodes.length <= 1) {
      setMessage('⚠️ 请先添加节点到工作流');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    setIsExecuting(true);
    setMessage('▶️ 工作流开始执行...');
    setTimeout(() => {
      setIsExecuting(false);
      setMessage('✅ 工作流执行完成！');
      setTimeout(() => setMessage(''), 2000);
    }, 3000);
  }, [nodes]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      background: '#f3f4f6',
      fontFamily: 'system-ui, sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    backBtn: {
      padding: '8px 16px',
      background: '#f3f4f6',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      color: '#374151',
      transition: 'all 0.2s',
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    titleText: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#111827',
      margin: 0,
    },
    subtitle: {
      fontSize: '12px',
      color: '#9ca3af',
      marginLeft: '8px',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    btn: {
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 500,
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    btnSecondary: {
      background: '#f3f4f6',
      color: '#374151',
    },
    btnPrimary: {
      background: '#4f46e5',
      color: 'white',
    },
    main: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
    },
    canvasArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    splitContainer: {
      flex: 1,
      display: 'flex',
    },
    canvas: {
      flex: 1,
      position: 'relative' as const,
      background: '#fff',
    },
    divider: {
      width: '4px',
      background: '#e5e7eb',
      cursor: 'col-resize',
      transition: 'background 0.2s',
      position: 'relative' as const,
    },
    liveView: {
      flex: 1,
      background: '#1f2937',
    },
    timeline: {
      height: '250px',
      borderTop: '1px solid #e5e7eb',
      background: 'white',
    },
    configPanel: {
      width: '320px',
      borderLeft: '1px solid #e5e7eb',
      background: 'white',
      overflowY: 'auto' as const,
    },
    message: {
      position: 'fixed' as const,
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1f2937',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '10px',
      fontSize: '14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out',
    },
    stats: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '8px 16px',
      background: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '12px',
      color: '#6b7280',
    },
  };

  return (
    <div style={styles.container}>
      {/* 顶部工具栏 */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            onClick={onBack}
            style={styles.backBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            ← 返回首页
          </button>
          <div style={styles.title}>
            <span>🎨</span>
            <h1 style={styles.titleText}>工作流编辑器</h1>
            <span style={styles.subtitle}>Model-RPA</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            style={{
              ...styles.btn,
              ...(showTimeline ? { background: '#e0e7ff', color: '#4338ca' } : styles.btnSecondary),
            }}
          >
            📊 {showTimeline ? '隐藏日志' : '显示日志'}
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: isExecuting ? 0.7 : 1,
              cursor: isExecuting ? 'not-allowed' : 'pointer',
            }}
          >
            {isExecuting ? '⏳ 执行中...' : '▶️ 执行工作流'}
          </button>
        </div>
      </header>

      {/* 统计信息 */}
      <div style={styles.stats}>
        <span>📦 节点: {nodes.length}</span>
        <span>🔗 连接: {edges.length}</span>
        <span>📍 状态: {isExecuting ? '执行中' : '就绪'}</span>
      </div>

      {/* 主内容区 */}
      <div style={styles.main}>
        {/* 左侧：节点面板 */}
        <NodePalette />

        {/* 中间：画布和实时视图 */}
        <div style={styles.canvasArea}>
          <div style={styles.splitContainer}>
            {/* 画布区域 */}
            <div style={{ ...styles.canvas, width: `${splitPosition}%` }}>
              <WorkflowCanvasWithProvider
                onNodeSelect={handleNodeSelect}
                onWorkflowChange={handleWorkflowChange}
              />
            </div>

            {/* 分割线 */}
            <div
              style={styles.divider}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = splitPosition;

                const onMouseMove = (e: MouseEvent) => {
                  const diff = ((e.clientX - startX) / window.innerWidth) * 100;
                  setSplitPosition(Math.max(20, Math.min(80, startWidth + diff)));
                };

                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#818cf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
            />

            {/* 实时视图 */}
            <div style={{ ...styles.liveView, width: `${100 - splitPosition}%` }}>
              <LiveView />
            </div>
          </div>

          {/* 时间轴面板 */}
          {showTimeline && (
            <div style={styles.timeline}>
              <Timeline />
            </div>
          )}
        </div>

        {/* 右侧：节点配置面板 */}
        {selectedNode && (
          <div style={styles.configPanel}>
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>

      {/* 消息提示 */}
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

export default Workspace;

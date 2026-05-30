/**
 * Model-RPA Workspace
 * 双轨分屏工作区 - 内联样式版本
 */

import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkflowCanvasWithProvider } from '../canvas/WorkflowCanvas';
import { NodePalette } from '../canvas/NodePalette';
import { LiveView } from '../liveview/LiveView';
import { NodeConfigPanel } from '../canvas/NodeConfigPanel';
import { Timeline } from '../timeline/Timeline';

export function Workspace() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);

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
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 3000);
  }, []);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      background: '#f3f4f6',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    h1: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#111827',
      margin: 0,
    },
    subtitle: {
      fontSize: '13px',
      color: '#6b7280',
    },
    actions: {
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
    btnPrimary: {
      background: '#4f46e5',
      color: 'white',
    },
    btnSecondary: {
      background: '#f3f4f6',
      color: '#374151',
    },
    btnActive: {
      background: '#e0e7ff',
      color: '#4338ca',
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
    },
    divider: {
      width: '4px',
      background: '#e5e7eb',
      cursor: 'col-resize',
      transition: 'background 0.2s',
    },
    liveView: {
      flex: 1,
      background: '#1f2937',
    },
    timeline: {
      height: '256px',
      borderTop: '1px solid #e5e7eb',
      background: 'white',
    },
    configPanel: {
      width: '320px',
      borderLeft: '1px solid #e5e7eb',
      background: 'white',
      overflowY: 'auto' as const,
    },
  };

  return (
    <div style={styles.container}>
      {/* 顶部工具栏 */}
      <header style={styles.header}>
        <div style={styles.title}>
          <h1 style={styles.h1}>🚀 Model-RPA</h1>
          <span style={styles.subtitle}>工作流编辑器</span>
        </div>

        <div style={styles.actions}>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            style={{
              ...styles.btn,
              ...(showTimeline ? styles.btnActive : styles.btnSecondary),
            }}
          >
            📊 时间轴
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: isExecuting ? 0.6 : 1,
              cursor: isExecuting ? 'not-allowed' : 'pointer',
            }}
          >
            {isExecuting ? '⏳ 执行中...' : '▶️ 执行工作流'}
          </button>
        </div>
      </header>

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
    </div>
  );
}

export default Workspace;

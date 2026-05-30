/**
 * Model-RPA Workspace
 * 双轨分屏工作区
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
  const [splitPosition, setSplitPosition] = useState(50); // 百分比

  // 节点选择回调
  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  // 工作流变更回调
  const handleWorkflowChange = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
    },
    []
  );

  // 执行工作流
  const handleExecute = useCallback(() => {
    setIsExecuting(true);
    // TODO: 执行工作流
    setTimeout(() => setIsExecuting(false), 3000);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 顶部工具栏 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Model-RPA</h1>
          <span className="text-sm text-gray-500">工作流编辑器</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showTimeline
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 时间轴
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isExecuting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isExecuting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                执行中...
              </span>
            ) : (
              '▶️ 执行工作流'
            )}
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：节点面板 */}
        <NodePalette />

        {/* 中间：画布和实时视图 */}
        <div className="flex-1 flex flex-col">
          {/* 分屏区域 */}
          <div className="flex-1 flex">
            {/* 画布区域 */}
            <div
              className="flex-1 relative"
              style={{ width: `${splitPosition}%` }}
            >
              <WorkflowCanvasWithProvider
                onNodeSelect={handleNodeSelect}
                onWorkflowChange={handleWorkflowChange}
              />
            </div>

            {/* 分割线 */}
            <div
              className="w-1 bg-gray-200 hover:bg-indigo-400 cursor-col-resize transition-colors"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = splitPosition;

                const onMouseMove = (e: MouseEvent) => {
                  const diff = ((e.clientX - startX) / window.innerWidth) * 100;
                  const newPosition = Math.max(20, Math.min(80, startWidth + diff));
                  setSplitPosition(newPosition);
                };

                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
            />

            {/* 实时视图区域 */}
            <div
              className="flex-1 bg-gray-900"
              style={{ width: `${100 - splitPosition}%` }}
            >
              <LiveView />
            </div>
          </div>

          {/* 时间轴面板（可折叠） */}
          {showTimeline && (
            <div className="h-64 border-t border-gray-200 bg-white">
              <Timeline />
            </div>
          )}
        </div>

        {/* 右侧：节点配置面板 */}
        {selectedNode && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
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

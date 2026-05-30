/**
 * Model-RPA Workflow Canvas
 * React Flow 画布引擎
 */

import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance,
  Connection,
  Edge,
  Node,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ActionNode } from './nodes/ActionNode';
import { ExtractNode } from './nodes/ExtractNode';
import { LoopNode } from './nodes/LoopNode';
import { ConditionNode } from './nodes/ConditionNode';
import { AgentNode } from './nodes/AgentNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { ErrorHandleNode } from './nodes/ErrorHandleNode';
import { WaitNode } from './nodes/WaitNode';
import { NotificationNode } from './nodes/NotificationNode';
import { VariableNode } from './nodes/VariableNode';
import { ScriptNode } from './nodes/ScriptNode';

// 自定义节点类型
const nodeTypes = {
  action: ActionNode,
  extract: ExtractNode,
  loop: LoopNode,
  condition: ConditionNode,
  agent: AgentNode,
  start: StartNode,
  end: EndNode,
  errorHandle: ErrorHandleNode,
  wait: WaitNode,
  notification: NotificationNode,
  variable: VariableNode,
  script: ScriptNode,
};

// 初始节点
const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: '开始' },
  },
];

// 初始边
const initialEdges: Edge[] = [];

interface WorkflowCanvasProps {
  onNodeSelect?: (node: Node | null) => void;
  onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
}

export function WorkflowCanvas({ onNodeSelect, onWorkflowChange }: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // 连接节点
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
      if (onWorkflowChange) {
        onWorkflowChange(nodes, addEdge({ ...params, animated: true }, edges));
      }
    },
    [nodes, edges, setEdges, onWorkflowChange]
  );

  // 节点选择
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  // 画布点击（取消选择）
  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // 拖拽放置
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
      if (onWorkflowChange) {
        onWorkflowChange([...nodes, newNode], edges);
      }
    },
    [reactFlowInstance, nodes, edges, setNodes, onWorkflowChange]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
      >
        {/* 背景网格 */}
        <Background color="#e5e7eb" gap={20} />

        {/* 控制按钮 */}
        <Controls className="!bg-white !shadow-lg !rounded-lg !border !border-gray-200" />

        {/* 小地图 */}
        <MiniMap
          className="!bg-white !shadow-lg !rounded-lg !border !border-gray-200"
          nodeColor={(node) => {
            switch (node.type) {
              case 'action':
                return '#3b82f6';
              case 'extract':
                return '#10b981';
              case 'loop':
                return '#f59e0b';
              case 'condition':
                return '#8b5cf6';
              case 'agent':
                return '#ef4444';
              default:
                return '#6b7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* 工具面板 */}
        <Panel position="top-left" className="!m-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2">
            <button
              onClick={() => {
                setNodes(initialNodes);
                setEdges([]);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="新建工作流"
            >
              📄 新建
            </button>
            <button
              onClick={() => {
                // TODO: 保存工作流
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="保存工作流"
            >
              💾 保存
            </button>
            <button
              onClick={() => {
                // TODO: 加载工作流
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="加载工作流"
            >
              📂 加载
            </button>
            <div className="w-px bg-gray-200" />
            <button
              onClick={() => {
                // TODO: 执行工作流
              }}
              className="px-3 py-1 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded"
              title="执行工作流"
            >
              ▶️ 执行
            </button>
          </div>
        </Panel>

        {/* 状态面板 */}
        <Panel position="top-right" className="!m-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-500">
              节点: <span className="font-medium text-gray-900">{nodes.length}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              连接: <span className="font-medium text-gray-900">{edges.length}</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// 获取节点默认数据
function getNodeData(type: string) {
  switch (type) {
    case 'action':
      return {
        label: '动作节点',
        instruction: '',
        actionType: 'click',
        status: 'idle',
      };
    case 'extract':
      return {
        label: '数据提取',
        instruction: '',
        fields: [],
        status: 'idle',
      };
    case 'loop':
      return {
        label: '循环',
        instruction: '',
        maxIterations: 10,
        status: 'idle',
      };
    case 'condition':
      return {
        label: '条件判断',
        condition: '',
        status: 'idle',
      };
    case 'agent':
      return {
        label: 'Agent 任务',
        task: '',
        requireConfirmation: true,
        status: 'idle',
      };
    case 'start':
      return { label: '开始' };
    case 'end':
      return { label: '结束' };
    default:
      return { label: '未知节点' };
  }
}

// 包装组件以提供 ReactFlow 上下文
export function WorkflowCanvasWithProvider(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
}

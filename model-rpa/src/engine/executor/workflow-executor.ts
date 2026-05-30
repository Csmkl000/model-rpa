/**
 * Model-RPA Workflow Executor
 * 工作流执行器 - 拓扑排序、顺序/并行执行
 */

import { Node, Edge } from 'reactflow';
import { StagehandEngine } from '../stagehand';
import { EventEmitter } from 'events';

// 执行状态
export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

// 节点执行结果
export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration: number;
  output?: any;
  error?: string;
  cached?: boolean;
  screenshot?: string;
}

// 执行日志
export interface ExecutionLog {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  nodeResults: Map<string, NodeExecutionResult>;
  error?: string;
}

// 执行配置
export interface ExecutionConfig {
  maxConcurrency?: number;
  timeout?: number;
  retryCount?: number;
  enableCache?: boolean;
  headless?: boolean;
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, result: NodeExecutionResult) => void;
  onNodeError?: (nodeId: string, error: Error) => void;
  onProgress?: (progress: number) => void;
}

/**
 * 工作流执行器
 * 负责拓扑排序、顺序/并行执行工作流节点
 */
export class WorkflowExecutor extends EventEmitter {
  private engine: StagehandEngine;
  private config: ExecutionConfig;
  private status: ExecutionStatus = 'idle';
  private nodeResults: Map<string, NodeExecutionResult> = new Map();
  private abortController: AbortController | null = null;

  constructor(engine: StagehandEngine, config: ExecutionConfig = {}) {
    super();
    this.engine = engine;
    this.config = {
      maxConcurrency: 1,
      timeout: 60000,
      retryCount: 3,
      enableCache: true,
      headless: false,
      ...config,
    };
  }

  /**
   * 执行工作流
   */
  async execute(nodes: Node[], edges: Edge[]): Promise<ExecutionLog> {
    if (this.status === 'running') {
      throw new Error('工作流正在执行中');
    }

    // 初始化
    this.status = 'running';
    this.nodeResults = new Map();
    this.abortController = new AbortController();

    const executionId = this.generateId();
    const startedAt = new Date().toISOString();

    this.emit('start', { executionId, startedAt });

    try {
      // 拓扑排序
      const sortedNodes = this.topologicalSort(nodes, edges);
      this.emit('sorted', { nodeCount: sortedNodes.length });

      // 执行节点
      await this.executeNodes(sortedNodes, edges);

      // 完成
      this.status = 'completed';
      const finishedAt = new Date().toISOString();

      const log: ExecutionLog = {
        id: executionId,
        workflowId: '',
        status: 'completed',
        startedAt,
        finishedAt,
        nodeResults: this.nodeResults,
      };

      this.emit('complete', log);
      return log;
    } catch (error) {
      this.status = 'error';
      const finishedAt = new Date().toISOString();

      const log: ExecutionLog = {
        id: executionId,
        workflowId: '',
        status: 'error',
        startedAt,
        finishedAt,
        nodeResults: this.nodeResults,
        error: error instanceof Error ? error.message : String(error),
      };

      this.emit('error', log);
      return log;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * 暂停执行
   */
  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused';
      this.emit('paused');
    }
  }

  /**
   * 恢复执行
   */
  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running';
      this.emit('resumed');
    }
  }

  /**
   * 停止执行
   */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.status = 'idle';
    this.emit('stopped');
  }

  /**
   * 获取执行状态
   */
  getStatus(): ExecutionStatus {
    return this.status;
  }

  /**
   * 获取节点结果
   */
  getNodeResult(nodeId: string): NodeExecutionResult | undefined {
    return this.nodeResults.get(nodeId);
  }

  /**
   * 拓扑排序
   * 返回按依赖关系排序的节点数组
   */
  private topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
    // 构建邻接表和入度表
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // 初始化
    nodes.forEach((node) => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // 构建图
    edges.forEach((edge) => {
      const sources = adjacencyList.get(edge.source) || [];
      sources.push(edge.target);
      adjacencyList.set(edge.source, sources);

      const targetDegree = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, targetDegree + 1);
    });

    // 找到所有入度为 0 的节点
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    // BFS 拓扑排序
    const sorted: Node[] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodeMap.get(nodeId);

      if (node) {
        sorted.push(node);
      }

      // 更新邻居节点的入度
      const neighbors = adjacencyList.get(nodeId) || [];
      neighbors.forEach((neighborId) => {
        const degree = inDegree.get(neighborId) || 0;
        inDegree.set(neighborId, degree - 1);

        if (degree - 1 === 0) {
          queue.push(neighborId);
        }
      });
    }

    // 检查是否有环
    if (sorted.length !== nodes.length) {
      throw new Error('工作流存在循环依赖');
    }

    return sorted;
  }

  /**
   * 执行节点列表
   */
  private async executeNodes(nodes: Node[], edges: Edge[]): Promise<void> {
    const totalNodes = nodes.length;

    for (let i = 0; i < totalNodes; i++) {
      // 检查是否被中止
      if (this.abortController?.signal.aborted) {
        throw new Error('执行被中止');
      }

      // 检查是否暂停
      while (this.status === 'paused') {
        await this.sleep(100);
      }

      const node = nodes[i];

      // 跳过开始和结束节点
      if (node.type === 'start' || node.type === 'end') {
        continue;
      }

      // 触发节点开始回调
      this.config.onNodeStart?.(node.id);
      this.emit('nodeStart', { nodeId: node.id, index: i, total: totalNodes });

      try {
        // 执行节点
        const result = await this.executeNode(node);

        // 保存结果
        this.nodeResults.set(node.id, result);

        // 触发节点完成回调
        this.config.onNodeComplete?.(node.id, result);
        this.emit('nodeComplete', { nodeId: node.id, result });

        // 更新进度
        const progress = ((i + 1) / totalNodes) * 100;
        this.config.onProgress?.(progress);
        this.emit('progress', { progress });
      } catch (error) {
        const result: NodeExecutionResult = {
          nodeId: node.id,
          status: 'error',
          message: `执行失败: ${error}`,
          duration: 0,
          error: error instanceof Error ? error.message : String(error),
        };

        this.nodeResults.set(node.id, result);

        // 触发节点错误回调
        this.config.onNodeError?.(node.id, error as Error);
        this.emit('nodeError', { nodeId: node.id, error });

        // 根据配置决定是否继续
        if (this.config.retryCount && this.config.retryCount > 0) {
          // TODO: 实现重试逻辑
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * 执行单个节点
   */
  private async executeNode(node: Node): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const { data, type } = node;

    this.emit('nodeExecuting', { nodeId: node.id, type });

    try {
      let result: any;

      switch (type) {
        case 'action':
          result = await this.executeActionNode(data);
          break;
        case 'extract':
          result = await this.executeExtractNode(data);
          break;
        case 'loop':
          result = await this.executeLoopNode(data, node);
          break;
        case 'condition':
          result = await this.executeConditionNode(data);
          break;
        case 'agent':
          result = await this.executeAgentNode(data);
          break;
        default:
          throw new Error(`未知节点类型: ${type}`);
      }

      const duration = Date.now() - startTime;

      return {
        nodeId: node.id,
        status: 'success',
        message: result.message || '执行成功',
        duration,
        output: result.output,
        cached: result.cached,
        screenshot: result.screenshot,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        nodeId: node.id,
        status: 'error',
        message: `执行失败: ${error}`,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 执行动作节点
   */
  private async executeActionNode(data: any): Promise<any> {
    const { instruction, actionType, inputValue } = data;

    // 构建完整指令
    let fullInstruction = instruction;
    if (actionType === 'input' && inputValue) {
      fullInstruction = `${instruction}，输入"${inputValue}"`;
    }

    // 调用 Stagehand act()
    const result = await this.engine.act(fullInstruction, {
      useCache: this.config.enableCache,
    });

    return {
      message: result.message,
      cached: result.cached,
      output: result,
    };
  }

  /**
   * 执行数据提取节点
   */
  private async executeExtractNode(data: any): Promise<any> {
    const { instruction, fields } = data;

    // 动态构建 Schema
    const { compileDynamicSchema } = await import('../schemas/extraction');
    const schema = compileDynamicSchema(
      fields.map((field: string) => ({
        name: field,
        type: 'string',
        required: true,
      }))
    );

    // 调用 Stagehand extract()
    const result = await this.engine.extract(instruction, schema);

    return {
      message: result.message,
      output: result.data,
    };
  }

  /**
   * 执行循环节点
   */
  private async executeLoopNode(data: any, node: Node): Promise<any> {
    const { instruction, maxIterations } = data;
    let iteration = 0;

    while (iteration < maxIterations) {
      // 检查是否被中止
      if (this.abortController?.signal.aborted) {
        throw new Error('循环被中止');
      }

      // 检查是否暂停
      while (this.status === 'paused') {
        await this.sleep(100);
      }

      iteration++;

      // 更新节点数据（用于 UI 显示）
      node.data = {
        ...node.data,
        currentIteration: iteration,
        status: 'running',
      };

      this.emit('loopIteration', {
        nodeId: node.id,
        iteration,
        maxIterations,
      });

      // 观察页面
      const observeResult = await this.engine.observe(instruction);

      if (!observeResult.success || observeResult.elements.length === 0) {
        // 没有找到目标元素，退出循环
        break;
      }

      // 执行动作
      await this.engine.act(instruction);
    }

    return {
      message: `循环完成，执行 ${iteration} 次`,
      output: { iterations: iteration },
    };
  }

  /**
   * 执行条件判断节点
   */
  private async executeConditionNode(data: any): Promise<any> {
    const { condition } = data;

    // 观察页面判断条件
    const result = await this.engine.observe(`判断条件: ${condition}`);

    // 根据观察结果判断条件
    const conditionMet = result.elements.length > 0;

    return {
      message: `条件判断: ${conditionMet ? 'True' : 'False'}`,
      output: { conditionMet },
    };
  }

  /**
   * 执行 Agent 节点
   */
  private async executeAgentNode(data: any): Promise<any> {
    const { task, requireConfirmation } = data;

    // 如果需要人工确认，发送确认请求
    if (requireConfirmation) {
      this.emit('confirmationRequired', {
        task,
        onConfirm: () => {
          // 继续执行
        },
        onCancel: () => {
          throw new Error('用户取消了 Agent 任务');
        },
      });

      // 等待确认
      // TODO: 实现确认等待机制
    }

    // 调用 Stagehand agent()
    const result = await this.engine.agent(task, {
      requireManualConfirmation: false, // 已经在上面处理了
    });

    return {
      message: result.message,
      output: result,
    };
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 休眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 创建工作流执行器
 */
export function createWorkflowExecutor(
  engine: StagehandEngine,
  config?: ExecutionConfig
): WorkflowExecutor {
  return new WorkflowExecutor(engine, config);
}

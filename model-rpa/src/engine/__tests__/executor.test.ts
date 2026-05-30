/**
 * Workflow Executor Tests
 * 工作流执行器单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Node, Edge } from 'reactflow';
import { WorkflowExecutor, createWorkflowExecutor } from '../executor/workflow-executor';
import { StagehandEngine, createStagehandEngine } from '../stagehand';

describe('WorkflowExecutor', () => {
  let engine: StagehandEngine;
  let executor: WorkflowExecutor;

  beforeEach(() => {
    engine = createStagehandEngine({ enableCaching: false });
    executor = createWorkflowExecutor(engine, {
      enableCache: false,
      retryCount: 0,
    });
  });

  describe('topologicalSort', () => {
    it('should sort nodes in correct order', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        { id: 'action1', type: 'action', position: { x: 0, y: 100 }, data: { label: '动作1' } },
        { id: 'action2', type: 'action', position: { x: 0, y: 200 }, data: { label: '动作2' } },
        { id: 'end', type: 'end', position: { x: 0, y: 300 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'action2' },
        { id: 'e3', source: 'action2', target: 'end' },
      ];

      // 执行工作流
      const log = await executor.execute(nodes, edges);

      expect(log.status).toBe('completed');
    });

    it('should detect circular dependencies', async () => {
      const nodes: Node[] = [
        { id: 'a', type: 'action', position: { x: 0, y: 0 }, data: { label: 'A' } },
        { id: 'b', type: 'action', position: { x: 0, y: 100 }, data: { label: 'B' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'a' }, // 循环依赖
      ];

      await expect(executor.execute(nodes, edges)).rejects.toThrow('循环依赖');
    });

    it('should handle disconnected nodes', async () => {
      const nodes: Node[] = [
        { id: 'a', type: 'action', position: { x: 0, y: 0 }, data: { label: 'A' } },
        { id: 'b', type: 'action', position: { x: 0, y: 100 }, data: { label: 'B' } },
      ];

      const edges: Edge[] = [];

      const log = await executor.execute(nodes, edges);

      expect(log.status).toBe('completed');
    });
  });

  describe('execute()', () => {
    it('should execute simple workflow', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        {
          id: 'action1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: { label: '点击按钮', instruction: '点击搜索', actionType: 'click', status: 'idle' },
        },
        { id: 'end', type: 'end', position: { x: 0, y: 200 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'end' },
      ];

      const log = await executor.execute(nodes, edges);

      expect(log.status).toBe('completed');
      expect(log.nodeResults.size).toBeGreaterThan(0);
    });

    it('should track execution progress', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        {
          id: 'action1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: { label: '动作1', instruction: '点击', actionType: 'click', status: 'idle' },
        },
        {
          id: 'action2',
          type: 'action',
          position: { x: 0, y: 200 },
          data: { label: '动作2', instruction: '输入', actionType: 'input', status: 'idle' },
        },
        { id: 'end', type: 'end', position: { x: 0, y: 300 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'action2' },
        { id: 'e3', source: 'action2', target: 'end' },
      ];

      const progressValues: number[] = [];
      executor = createWorkflowExecutor(engine, {
        enableCache: false,
        onProgress: (progress) => progressValues.push(progress),
      });

      await executor.execute(nodes, edges);

      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });

    it('should emit events during execution', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        {
          id: 'action1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: { label: '动作', instruction: '点击', actionType: 'click', status: 'idle' },
        },
        { id: 'end', type: 'end', position: { x: 0, y: 200 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'end' },
      ];

      const events: string[] = [];
      executor.on('start', () => events.push('start'));
      executor.on('complete', () => events.push('complete'));
      executor.on('nodeStart', () => events.push('nodeStart'));
      executor.on('nodeComplete', () => events.push('nodeComplete'));

      await executor.execute(nodes, edges);

      expect(events).toContain('start');
      expect(events).toContain('complete');
      expect(events).toContain('nodeStart');
      expect(events).toContain('nodeComplete');
    });
  });

  describe('pause() and resume()', () => {
    it('should pause and resume execution', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        {
          id: 'action1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: { label: '动作', instruction: '点击', actionType: 'click', status: 'idle' },
        },
        { id: 'end', type: 'end', position: { x: 0, y: 200 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'end' },
      ];

      // 启动执行
      const executionPromise = executor.execute(nodes, edges);

      // 暂停
      executor.pause();
      expect(executor.getStatus()).toBe('paused');

      // 恢复
      executor.resume();
      expect(executor.getStatus()).toBe('running');

      const log = await executionPromise;
      expect(log.status).toBe('completed');
    });
  });

  describe('stop()', () => {
    it('should stop execution', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        {
          id: 'action1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: { label: '动作', instruction: '点击', actionType: 'click', status: 'idle' },
        },
        { id: 'end', type: 'end', position: { x: 0, y: 200 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'end' },
      ];

      // 启动执行
      const executionPromise = executor.execute(nodes, edges);

      // 停止
      executor.stop();

      // 状态应该变为 idle
      expect(executor.getStatus()).toBe('idle');
    });
  });

  describe('getNodeResult()', () => {
    it('should return node result after execution', async () => {
      const nodes: Node[] = [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
        {
          id: 'action1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: { label: '动作', instruction: '点击', actionType: 'click', status: 'idle' },
        },
        { id: 'end', type: 'end', position: { x: 0, y: 200 }, data: { label: '结束' } },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'start', target: 'action1' },
        { id: 'e2', source: 'action1', target: 'end' },
      ];

      await executor.execute(nodes, edges);

      const result = executor.getNodeResult('action1');
      expect(result).toBeDefined();
      expect(result?.status).toBe('success');
    });
  });
});

describe('createWorkflowExecutor', () => {
  it('should create executor with default config', () => {
    const engine = createStagehandEngine();
    const executor = createWorkflowExecutor(engine);

    expect(executor).toBeDefined();
    expect(executor.getStatus()).toBe('idle');
  });

  it('should create executor with custom config', () => {
    const engine = createStagehandEngine();
    const executor = createWorkflowExecutor(engine, {
      maxConcurrency: 3,
      timeout: 30000,
      retryCount: 2,
      enableCache: true,
    });

    expect(executor).toBeDefined();
  });
});

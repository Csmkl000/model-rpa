# 引擎 API 文档

本文档提供 Model-RPA 核心引擎的详细 API 参考。

## 目录

- [StagehandEngine](#stagehandengine)
- [CacheManager](#cachemanager)
- [DOMHasher](#domhasher)
- [ChromiumManager](#chromiummanager)
- [WorkflowExecutor](#workflowexecutor)
- [类型定义](#类型定义)

## StagehandEngine

Stagehand 引擎核心类，提供四大 API：act, extract, observe, agent。

### 构造函数

```typescript
import { createStagehandEngine, StagehandConfig } from './engine';

const config: StagehandConfig = {
  apiKey?: string;           // LLM API Key
  modelProvider?: 'openai' | 'anthropic' | 'deepseek';
  modelName?: string;        // 模型名称
  headless?: boolean;        // 无头模式
  userDataDir?: string;      // 用户数据目录
  cacheDir?: string;         // 缓存目录
  enableCaching?: boolean;   // 启用缓存
  debug?: boolean;           // 调试模式
};

const engine = createStagehandEngine(config);
```

### 方法

#### initialize()

初始化引擎。

```typescript
await engine.initialize(): Promise<void>
```

#### act()

执行语义化动作。

```typescript
await engine.act(
  instruction: string,
  options?: {
    useCache?: boolean;
    timeout?: number;
  }
): Promise<ActionResult>
```

**参数**：
- `instruction` - 动作指令（大白话描述）
- `options.useCache` - 是否使用缓存，默认 `true`
- `options.timeout` - 超时时间，默认 `30000`ms

**返回值**：
```typescript
interface ActionResult {
  success: boolean;
  message: string;
  cached: boolean;
  duration: number;
  screenshot?: string;
}
```

**示例**：
```typescript
// 点击按钮
const result = await engine.act('点击搜索按钮');

// 输入文本
await engine.act('在搜索框中输入 iPhone 15');

// 选择下拉框
await engine.act('选择城市为北京');

// 使用安全变量
await engine.act('在密码框中输入 {{Taobao_Pwd}}');
```

#### extract()

提取结构化数据。

```typescript
await engine.extract<T>(
  instruction: string,
  schema: z.ZodSchema<T>,
  options?: {
    timeout?: number;
  }
): Promise<ExtractResult<T>>
```

**参数**：
- `instruction` - 提取指令
- `schema` - Zod Schema 定义
- `options.timeout` - 超时时间

**返回值**：
```typescript
interface ExtractResult<T> {
  success: boolean;
  data: T | null;
  message: string;
  duration: number;
}
```

**示例**：
```typescript
import { z } from 'zod';

// 定义 Schema
const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  rating: z.number().optional(),
});

// 提取数据
const result = await engine.extract('提取商品信息', ProductSchema);

if (result.success) {
  console.log(result.data.name);
  console.log(result.data.price);
}
```

#### observe()

观察页面元素。

```typescript
await engine.observe(
  instruction: string,
  options?: {
    timeout?: number;
  }
): Promise<ObserveResult>
```

**参数**：
- `instruction` - 观察指令
- `options.timeout` - 超时时间

**返回值**：
```typescript
interface ObserveResult {
  success: boolean;
  elements: ObservedElement[];
  message: string;
}

interface ObservedElement {
  selector: string;
  text: string;
  type: 'button' | 'link' | 'input' | 'select' | 'other';
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

**示例**：
```typescript
// 寻找按钮
const result = await engine.observe('寻找下一页按钮');

if (result.elements.length > 0) {
  console.log(`找到 ${result.elements.length} 个元素`);
  await engine.act(`点击 ${result.elements[0].text}`);
}

// 判断条件
const conditionResult = await engine.observe('页面是否包含"已售罄"');
const isSoldOut = conditionResult.elements.length > 0;
```

#### agent()

执行自主任务。

```typescript
await engine.agent(
  task: string,
  config?: AgentConfig
): Promise<ActionResult>
```

**参数**：
- `task` - 任务描述
- `config` - Agent 配置

**AgentConfig**：
```typescript
interface AgentConfig {
  requireManualConfirmation?: boolean;
  maxSteps?: number;
  timeout?: number;
  dangerousActions?: string[];
}
```

**示例**：
```typescript
// 简单任务
await engine.agent('找到联系我们页面');

// 复杂任务（需要人工确认）
await engine.agent('填写表单并提交', {
  requireManualConfirmation: true,
  maxSteps: 10,
  timeout: 60000,
  dangerousActions: ['submit', 'send'],
});
```

#### getCacheStats()

获取缓存统计。

```typescript
await engine.getCacheStats(): Promise<{
  totalEntries: number;
  hitRate: number;
  size: number;
}>
```

#### clearCache()

清除缓存。

```typescript
await engine.clearCache(): Promise<void>
```

#### destroy()

销毁引擎。

```typescript
await engine.destroy(): Promise<void>
```

## CacheManager

缓存管理器，使用文件系统存储缓存。

### 构造函数

```typescript
import { CacheManager } from './engine/cache';

const cacheManager = new CacheManager(cacheDir?: string);
```

### 方法

#### get()

获取缓存。

```typescript
await cacheManager.get(key: string): Promise<any | null>
```

#### set()

设置缓存。

```typescript
await cacheManager.set(key: string, data: any): Promise<void>
```

#### delete()

删除缓存。

```typescript
await cacheManager.delete(key: string): Promise<void>
```

#### clear()

清除所有缓存。

```typescript
await cacheManager.clear(): Promise<void>
```

#### getStats()

获取缓存统计。

```typescript
await cacheManager.getStats(): Promise<CacheStats>

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  size: number;
}
```

#### evict()

淘汰旧缓存（LRU 策略）。

```typescript
await cacheManager.evict(maxEntries: number): Promise<void>
```

## DOMHasher

DOM 哈希生成器。

### 构造函数

```typescript
import { DOMHasher } from './engine/cache';

const hasher = new DOMHasher();
```

### 方法

#### hashAction()

生成动作哈希。

```typescript
hasher.hashAction(instruction: string, context?: string): string
```

#### hashPage()

生成页面哈希。

```typescript
hasher.hashPage(html: string): string
```

#### hashElement()

生成元素哈希。

```typescript
hasher.hashElement(element: {
  tag: string;
  id?: string;
  className?: string;
  text?: string;
  attributes?: Record<string, string>;
}): string
```

#### compare()

比较两个哈希。

```typescript
hasher.compare(hash1: string, hash2: string): boolean
```

#### detectChanges()

检测 DOM 变更。

```typescript
hasher.detectChanges(oldHash: string, newHash: string): boolean
```

## ChromiumManager

Chromium 管理器。

### 构造函数

```typescript
import { ChromiumManager } from './engine/chromium';

const manager = new ChromiumManager();
```

### 方法

#### isInstalled()

检查 Chromium 是否已安装。

```typescript
manager.isInstalled(): boolean
```

#### getInstalledVersion()

获取已安装的版本。

```typescript
manager.getInstalledVersion(): string | null
```

#### getExecutablePath()

获取可执行文件路径。

```typescript
manager.getExecutablePath(): string | null
```

#### download()

下载 Chromium。

```typescript
await manager.download(
  version?: string,
  onProgress?: (progress: {
    percent: number;
    downloaded: number;
    total: number;
  }) => void
): Promise<string>
```

#### checkForUpdates()

检查更新。

```typescript
await manager.checkForUpdates(): Promise<{
  hasUpdate: boolean;
  currentVersion: string | null;
  latestVersion: string;
}>
```

#### cleanup()

清理旧版本。

```typescript
await manager.cleanup(): Promise<void>
```

## WorkflowExecutor

工作流执行器。

### 构造函数

```typescript
import { createWorkflowExecutor, ExecutionConfig } from './engine/executor';
import { createStagehandEngine } from './engine';

const engine = createStagehandEngine();
const executor = createWorkflowExecutor(engine, config?: ExecutionConfig);
```

**ExecutionConfig**：
```typescript
interface ExecutionConfig {
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
```

### 方法

#### execute()

执行工作流。

```typescript
await executor.execute(nodes: Node[], edges: Edge[]): Promise<ExecutionLog>
```

**ExecutionLog**：
```typescript
interface ExecutionLog {
  id: string;
  workflowId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  startedAt: string;
  finishedAt?: string;
  nodeResults: Map<string, NodeExecutionResult>;
  error?: string;
}
```

#### pause()

暂停执行。

```typescript
executor.pause(): void
```

#### resume()

恢复执行。

```typescript
executor.resume(): void
```

#### stop()

停止执行。

```typescript
executor.stop(): void
```

#### getStatus()

获取执行状态。

```typescript
executor.getStatus(): 'idle' | 'running' | 'paused' | 'completed' | 'error'
```

#### getNodeResult()

获取节点执行结果。

```typescript
executor.getNodeResult(nodeId: string): NodeExecutionResult | undefined
```

### 事件

```typescript
// 开始执行
executor.on('start', (data: { executionId: string; startedAt: string }) => {});

// 完成执行
executor.on('complete', (log: ExecutionLog) => {});

// 节点开始
executor.on('nodeStart', (data: { nodeId: string; index: number; total: number }) => {});

// 节点完成
executor.on('nodeComplete', (data: { nodeId: string; result: NodeExecutionResult }) => {});

// 节点错误
executor.on('nodeError', (data: { nodeId: string; error: Error }) => {});

// 进度更新
executor.on('progress', (data: { progress: number }) => {});

// 循环迭代
executor.on('loopIteration', (data: { nodeId: string; iteration: number; maxIterations: number }) => {});

// 需要人工确认
executor.on('confirmationRequired', (data: { task: string; onConfirm: () => void; onCancel: () => void }) => {});
```

## 类型定义

### NodeExecutionResult

```typescript
interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration: number;
  output?: any;
  error?: string;
  cached?: boolean;
  screenshot?: string;
}
```

### ExecutionStatus

```typescript
type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';
```

### LogLevel

```typescript
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
```

### LogCategory

```typescript
type LogCategory = 'system' | 'action' | 'extract' | 'loop' | 'agent' | 'cache' | 'network' | 'ui';
```

### SnapshotType

```typescript
type SnapshotType = 'before' | 'after' | 'error' | 'crash';
```

---

返回 [文档首页](../README.md)

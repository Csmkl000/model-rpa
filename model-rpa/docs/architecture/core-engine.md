# 核心引擎设计

本文档详细介绍 Model-RPA 的核心引擎设计，包括 Stagehand 四大 API 的整合。

## 引擎概览

Model-RPA 的底层节点严格映射 Stagehand 的核心能力，形成"微观确定性"与"宏观自治"的完美互补。

```
┌─────────────────────────────────────────────────────────────┐
│                    Stagehand 引擎架构                        │
├─────────────────────────────────────────────────────────────┤
│  act()           │ 语义行动 + DOM 哈希缓存                    │
│  extract()       │ 强类型数据提取 (Zod Schema)                │
│  observe()       │ 动态路由 + 循环探测                        │
│  agent()         │ 宏观自主托管 + 人工确认                    │
├─────────────────────────────────────────────────────────────┤
│  CacheManager    │ LRU 缓存 + 多分支缓存                     │
│  DOMHasher       │ 页面哈希 + 变更检测                        │
│  ChromiumManager │ 静默下载 + 版本管理                        │
└─────────────────────────────────────────────────────────────┘
```

## Stagehand 四大 API

### 1. act() - 语义行动与缓存节点

**场景**：点击、输入、下拉选择

**机制**：
- 强制将 `cacheDir` 绑定至本地 AppData
- 首次运行调用 LLM
- 后续运行直接读取本地 DOM 哈希缓存
- 实现毫秒级、零成本的极速点击

**API 接口**：

```typescript
interface ActOptions {
  useCache?: boolean;    // 是否使用缓存，默认 true
  timeout?: number;      // 超时时间，默认 30000ms
}

interface ActionResult {
  success: boolean;      // 是否成功
  message: string;       // 结果消息
  cached: boolean;       // 是否命中缓存
  duration: number;      // 执行时长 (ms)
  screenshot?: string;   // 截图 (Base64)
}

// 使用示例
const result = await engine.act('点击搜索按钮', {
  useCache: true,
  timeout: 10000,
});

if (result.cached) {
  console.log('⚡️ 极速免流执行');
}
```

**缓存流程**：

```
用户指令: "点击搜索按钮"
    ↓
生成动作哈希 (DOMHasher)
    ↓
检查缓存 (CacheManager)
    ↓
┌─────────────────┬─────────────────┐
│    缓存命中      │    缓存未命中    │
│    ↓            │    ↓            │
│  直接执行       │  调用 AI 分析    │
│  (毫秒级)       │  (秒级)         │
│    ↓            │    ↓            │
│  返回结果       │  保存缓存        │
│  ⚡️ 极速       │  返回结果        │
└─────────────────┴─────────────────┘
```

### 2. extract() - 强类型数据榨汁机

**场景**：抓取列表、提取文章摘要、获取商品详情

**机制**：
- 前端将用户勾选的字段动态编译为 Zod Schema
- 传入引擎确保输出数据 100% 符合 JSON 格式
- 直接写入 SQLite 或导出 Excel

**API 接口**：

```typescript
interface ExtractOptions {
  timeout?: number;      // 超时时间
}

interface ExtractResult<T> {
  success: boolean;      // 是否成功
  data: T | null;        // 提取的数据
  message: string;       // 结果消息
  duration: number;      // 执行时长 (ms)
}

// 使用示例
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  rating: z.number().optional(),
});

const result = await engine.extract('提取商品信息', ProductSchema);

if (result.success) {
  console.log(result.data.name);   // 商品名称
  console.log(result.data.price);  // 价格
}
```

**预定义 Schema**：

```typescript
// 文章
const ArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  author: z.string().optional(),
  publishDate: z.string().optional(),
});

// 商品
const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  currency: z.string().default('CNY'),
  rating: z.number().min(0).max(5).optional(),
});

// 搜索结果
const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  position: z.number(),
});

// 表格数据
const TableSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});
```

**动态 Schema 编译**：

```typescript
import { compileDynamicSchema } from './engine/schemas';

// 用户选择的字段
const fields = [
  { name: 'title', type: 'string', required: true },
  { name: 'price', type: 'number', required: true },
  { name: 'tags', type: 'array', required: false },
];

// 动态编译 Schema
const schema = compileDynamicSchema(fields);

// 使用 Schema 提取数据
const result = await engine.extract('提取数据', schema);
```

### 3. observe() - 动态路由与循环探测器

**场景**：99 页自动翻页、弹窗广告关闭、条件分支判断

**机制**：
- 在循环节点中调用 `observe("寻找下一页按钮")`
- AI 扫描页面返回可交互元素
- 若找不到则安全退出循环
- 彻底解决传统 RPA 翻页易崩溃的痛点

**API 接口**：

```typescript
interface ObserveOptions {
  timeout?: number;      // 超时时间
}

interface ObserveResult {
  success: boolean;      // 是否成功
  elements: ObservedElement[];  // 发现的元素
  message: string;       // 结果消息
}

interface ObservedElement {
  selector: string;      // CSS 选择器
  text: string;          // 元素文本
  type: 'button' | 'link' | 'input' | 'select' | 'other';
  rect: {                // 元素位置
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 使用示例
const result = await engine.observe('寻找下一页按钮');

if (result.elements.length > 0) {
  const nextButton = result.elements[0];
  console.log(`找到按钮: ${nextButton.text}`);
  await engine.act(`点击 ${nextButton.text}`);
} else {
  console.log('没有更多页面');
}
```

**循环翻页示例**：

```typescript
let page = 1;
const maxPages = 99;

while (page <= maxPages) {
  // 观察是否有下一页
  const observeResult = await engine.observe('寻找下一页按钮');

  if (observeResult.elements.length === 0) {
    console.log('没有更多页面，退出循环');
    break;
  }

  // 提取当前页数据
  await engine.extract('提取商品列表', ProductSchema);

  // 点击下一页
  await engine.act('点击下一页按钮');

  page++;
}
```

### 4. agent() - 宏观自主托管节点

**场景**：开放式复杂任务（如"帮我在这篇博客里找到联系我们并留言"）

**机制**：
- AI 全权接管浏览器进行多步推理
- 为防范 AI 幻觉，强制配置 `requireManualConfirmation`
- 执行高危动作前需人工确认

**API 接口**：

```typescript
interface AgentConfig {
  requireManualConfirmation?: boolean;  // 需要人工确认
  maxSteps?: number;                    // 最大步骤数
  timeout?: number;                     // 超时时间
  dangerousActions?: string[];          // 危险动作列表
}

interface ActionResult {
  success: boolean;
  message: string;
  cached: boolean;
  duration: number;
}

// 使用示例
const result = await engine.agent('找到联系我们页面并填写表单', {
  requireManualConfirmation: true,
  maxSteps: 10,
  timeout: 60000,
  dangerousActions: ['submit', 'send', 'delete'],
});
```

**人工确认流程**：

```
Agent 任务: "找到联系我们页面并留言"
    ↓
AI 分析页面
    ↓
识别到表单
    ↓
准备填写并提交
    ↓
┌─────────────────────────────┐
│  检测到危险动作: submit      │
│  需要人工确认                │
│                             │
│  [确认]  [取消]             │
└─────────────────────────────┘
    ↓
用户确认
    ↓
执行提交
    ↓
返回结果
```

## 缓存管理

### CacheManager

**职责**：管理 DOM 哈希缓存，实现毫秒级极速执行

**特性**：
- LRU 淘汰策略（最多 1000 条）
- 文件系统存储
- 命中率统计
- 自动清理

**API**：

```typescript
class CacheManager {
  get(key: string): Promise<any | null>;
  set(key: string, data: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
  evict(maxEntries: number): Promise<void>;
}
```

### DOMHasher

**职责**：生成页面 DOM 的哈希值，实现缓存和变更检测

**特性**：
- 动作哈希生成
- 页面哈希生成
- 元素哈希生成
- 变更检测

**API**：

```typescript
class DOMHasher {
  hashAction(instruction: string, context?: string): string;
  hashPage(html: string): string;
  hashElement(element: ElementInfo): string;
  compare(hash1: string, hash2: string): boolean;
  detectChanges(oldHash: string, newHash: string): boolean;
}
```

## Chromium 管理

### ChromiumManager

**职责**：静默下载与管理 Chromium 二进制文件

**特性**：
- 跨平台支持（Windows/macOS/Linux）
- 多架构支持（x64/arm64）
- 自动下载与解压
- 版本检测与更新

**API**：

```typescript
class ChromiumManager {
  isInstalled(): boolean;
  getInstalledVersion(): string | null;
  getExecutablePath(): string | null;
  download(version?: string, onProgress?: ProgressCallback): Promise<string>;
  checkForUpdates(): Promise<UpdateInfo>;
  cleanup(): Promise<void>;
}
```

**下载流程**：

```
应用启动
    ↓
检查 Chromium 是否已安装
    ↓
┌─────────────────┬─────────────────┐
│    已安装        │    未安装        │
│    ↓            │    ↓            │
│  检查版本       │  开始下载        │
│    ↓            │    ↓            │
│  需要更新?      │  显示进度        │
│  是 → 下载      │    ↓            │
│  否 → 跳过      │  解压安装        │
└─────────────────┴─────────────────┘
    ↓
设置 executablePath
    ↓
启动 Stagehand
```

## 工作流执行器

### WorkflowExecutor

**职责**：拓扑排序、顺序/并行执行工作流节点

**特性**：
- 拓扑排序算法（BFS）
- 循环依赖检测
- 执行状态管理
- 进度回调
- 错误处理与重试

**API**：

```typescript
class WorkflowExecutor {
  execute(nodes: Node[], edges: Edge[]): Promise<ExecutionLog>;
  pause(): void;
  resume(): void;
  stop(): void;
  getStatus(): ExecutionStatus;
  getNodeResult(nodeId: string): NodeExecutionResult | undefined;
}
```

**执行流程**：

```
接收工作流节点和连线
    ↓
拓扑排序
    ↓
检查循环依赖
    ↓
遍历执行节点
    ↓
┌─────────────────────────────┐
│  节点类型判断                │
│  ├─ action → act()          │
│  ├─ extract → extract()     │
│  ├─ loop → observe() + act()│
│  ├─ condition → observe()   │
│  └─ agent → agent()         │
└─────────────────────────────┘
    ↓
记录执行结果
    ↓
触发进度回调
    ↓
完成或错误处理
```

## 下一步

- 阅读 [数据流设计](data-flow.md) 了解状态管理机制
- 查看 [引擎 API 文档](../api/engine-api.md) 了解详细接口

---

返回 [文档首页](../README.md)

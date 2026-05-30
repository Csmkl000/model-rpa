# 系统架构

本文档详细介绍了 Model-RPA 的整体架构设计和技术栈。

## 架构概览

Model-RPA 采用 **微内核 + 插件化 + 跨进程协同** 的高拓展性架构。

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              Model-RPA 系统架构图                             │
├───────────────────┬───────────────────────────────────────────────────────────┤
│ 前端交互层 (UI)   │ React 19 + Tailwind CSS v4 + React Flow (DAG 画布引擎)    │
│ 桌面外壳层 (OS)   │ Tauri v2 (Rust) — 窗口管理、系统托盘、Cron 定时任务调度   │
│ 安全与存储层      │ SQLite (日志/工作流) + Tauri Stronghold (加密凭证保险箱)  │
│ 运行时层 (Runtime)│ Bun (Sidecar) — 极速执行 TS，无需用户安装 Node.js         │
│ 自动化内核 (Core) │ Stagehand v3 + Playwright (CDP 协议直连 Chromium)         │
│ 拓展协议层 (Ext)  │ MCP (Model Context Protocol) 客户端与服务端双向集成       │
└───────────────────┴───────────────────────────────────────────────────────────┘
```

## 分层架构

### 1. 前端交互层 (UI Layer)

**技术栈**：React 19 + Tailwind CSS v4 + React Flow

**职责**：
- 用户界面渲染
- 工作流可视化编辑
- 实时状态展示
- 用户交互处理

**核心组件**：
- `WorkflowCanvas` - React Flow 画布
- `LiveView` - 实时浏览器视图
- `NodePalette` - 节点面板
- `NodeConfigPanel` - 节点配置面板
- `Timeline` - 日志时间轴
- `DevConsole` - 开发者控制台

### 2. 桌面外壳层 (OS Layer)

**技术栈**：Tauri v2 (Rust)

**职责**：
- 窗口管理
- 系统托盘
- 定时任务调度
- 进程管理
- 系统通知

**核心模块**：
- `window.rs` - 窗口管理
- `scheduler.rs` - 定时任务调度
- `process.rs` - 进程管理
- `commands.rs` - Tauri 命令

### 3. 安全与存储层 (Security Layer)

**技术栈**：SQLite + Tauri Stronghold

**职责**：
- 数据持久化
- 凭证加密存储
- 浏览器身份隔离
- 日志存储

**核心模块**：
- `db.rs` - SQLite 数据库
- `vault.rs` - 凭证保险箱
- `logger.rs` - 日志管理

**数据库表**：
- `workflows` - 工作流存储
- `execution_logs` - 执行日志
- `credentials` - 凭证元数据
- `profiles` - 浏览器身份
- `scheduled_tasks` - 定时任务
- `action_cache` - 动作缓存

### 4. 运行时层 (Runtime Layer)

**技术栈**：Bun (Sidecar)

**职责**：
- TypeScript 执行
- Stagehand 引擎调用
- 缓存管理
- 数据处理

**核心模块**：
- `engine/stagehand.ts` - Stagehand 封装
- `engine/executor/` - 工作流执行器
- `engine/cache/` - 缓存管理
- `engine/schemas/` - 数据 Schema

### 5. 自动化内核层 (Core Layer)

**技术栈**：Stagehand v3 + Playwright

**职责**：
- AI 语义理解
- 网页自动化
- 数据提取
- 元素识别

**核心 API**：
- `act()` - 语义行动
- `extract()` - 数据提取
- `observe()` - 页面观察
- `agent()` - 自主执行

### 6. 拓展协议层 (Extension Layer)

**技术栈**：MCP (Model Context Protocol)

**职责**：
- 第三方扩展集成
- 插件系统
- 外部服务对接

## 数据流

### 前端 → 后端

```
React 组件
    ↓ invoke('command', params)
Tauri IPC
    ↓ 序列化参数
Rust 命令处理
    ↓ 执行业务逻辑
返回结果
```

### 后端 → 前端

```
Rust 事件发射
    ↓ app.emit('event', payload)
Tauri IPC
    ↓ 反序列化数据
React 事件监听
    ↓ 更新状态
UI 更新
```

### 引擎执行流

```
工作流执行器
    ↓ 拓扑排序
节点执行循环
    ↓ 调用 Stagehand API
Stagehand 引擎
    ↓ CDP 协议
Chromium 浏览器
    ↓ 返回结果
缓存 + 日志
```

## 进程模型

### 主进程 (Rust)

- 窗口管理
- 系统托盘
- 定时任务调度
- 进程管理
- 数据库操作

### 渲染进程 (React)

- UI 渲染
- 用户交互
- 状态管理

### Sidecar 进程 (Bun)

- TypeScript 执行
- Stagehand 引擎
- 缓存管理

### Chromium 进程

- 网页渲染
- 自动化操作

## IPC 通信

### 命令调用 (前端 → 后端)

```typescript
// 前端
const result = await invoke('command_name', { param1, param2 });

// 后端
#[tauri::command]
pub fn command_name(param1: String, param2: i32) -> Result<String, String> {
    // 处理逻辑
    Ok("result".to_string())
}
```

### 事件推送 (后端 → 前端)

```typescript
// 前端
listen('event_name', (event) => {
  console.log(event.payload);
});

// 后端
app.emit("event_name", payload)?;
```

## 安全设计

### 凭证存储

```
用户输入密码
    ↓
Stronghold 加密
    ↓
本地加密存储
    ↓
执行时解密
    ↓
环境变量传递
    ↓
用完即毁
```

### 浏览器隔离

```
Profile A (工作身份)
├── Cookie
├── LocalStorage
└── SessionStorage

Profile B (私人身份)
├── Cookie
├── LocalStorage
└── SessionStorage
```

## 性能优化

### 缓存策略

- **DOM 哈希缓存**：相同操作直接使用缓存
- **LRU 淘汰**：保留最近使用的 1000 条缓存
- **多分支缓存**：A/B 测试场景支持多个备选方案

### 启动优化

- **代码分割**：按需加载组件
- **懒加载**：延迟加载非关键资源
- **预加载**：提前加载关键资源

### 运行时优化

- **虚拟列表**：大列表性能优化
- **防抖节流**：减少不必要的更新
- **内存管理**：及时清理资源

## 扩展性设计

### 插件系统

```typescript
// 插件接口
interface Plugin {
  name: string;
  version: string;
  initialize(): Promise<void>;
  execute(params: any): Promise<any>;
}

// 插件注册
registerPlugin('my-plugin', {
  name: 'My Plugin',
  version: '1.0.0',
  async initialize() { /* ... */ },
  async execute(params) { /* ... */ },
});
```

### 自定义节点

```typescript
// 自定义节点接口
interface CustomNode {
  type: string;
  component: React.ComponentType<any>;
  defaultData: any;
  validate: (data: any) => boolean;
}

// 注册自定义节点
registerNode('custom-action', {
  type: 'custom-action',
  component: CustomActionNode,
  defaultData: { /* ... */ },
  validate: (data) => /* ... */,
});
```

## 下一步

- 阅读 [核心引擎设计](core-engine.md) 了解 Stagehand 集成细节
- 查看 [数据流设计](data-flow.md) 了解状态管理机制

---

返回 [文档首页](../README.md)

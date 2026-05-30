---
name: model-rpa-spec
description: Model-RPA 完整技术规格文档 - 下一代语义化 AI-RPA 商业级开发指南 v2.0
metadata:
  type: project
  created: 2026-05-30
---

# Model-RPA 技术规格文档

## 项目定位
面向非技术用户与高级开发者的"下一代语义化网页自动化操作系统"

**核心理念**："演示即生成，大白话即代码，运行即自愈"

**技术破局点**：淘汰传统 XPath/CSS 选择器，规避纯 AI Agent 高成本，通过 Stagehand v3 的 AI 视觉与语义理解能力，结合 Tauri v2 + Bun 架构，打造高确定性、低成本、抗网页变动的桌面级自动化助理。

## 全栈技术架构

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

## Stagehand 四大核心 API

### 1. act() - 语义行动与缓存节点
- 场景：点击、输入、下拉选择
- 机制：强制 cacheDir 绑定本地 AppData，首次运行调用 LLM，后续读取 DOM 哈希缓存

### 2. extract() - 强类型数据榨汁机
- 场景：抓取列表、提取摘要、获取商品详情
- 机制：前端动态编译 Zod Schema，确保 100% JSON 格式输出

### 3. observe() - 动态路由与循环探测器
- 场景：自动翻页、弹窗关闭、条件分支
- 机制：AI 扫描页面返回可交互元素，找不到则安全退出循环

### 4. agent() - 宏观自主托管节点
- 场景：开放式复杂任务
- 机制：AI 全权接管浏览器，强制配置 requireManualConfirmation 防范幻觉

## 五大商业化模块

### 4.1 凭证与隐私安全系统 (Credential Vault)
- 安全变量机制：前端仅展示变量名，密码存入 Tauri Stronghold
- 执行时通过环境变量或 stdin 传递，用完即毁

### 4.2 浏览器身份与会话持久化 (Profile Manager)
- 利用 Playwright userDataDir 参数映射不同身份
- 扫码登录一次，永久免登录

### 4.3 无人值守与后台调度系统 (Unattended Scheduling)
- tokio-cron-scheduler 定时任务
- Headless 静默模式 + 系统通知

### 4.4 商业化计费与 Token 审计 (Billing & Token Economics)
- BYOK 模式：用户自备 API Key，软件买断
- SaaS 订阅模式：按月付费，包 AI 动作次数

### 4.5 生态裂变：工作流市场 (Marketplace)
- 标准化 .mrpa 单文件格式
- 云端模板广场

## UI/UX 设计

### 双轨分屏工作区
- 左侧 Canvas：React Flow 节点画布
- 右侧 Live View：内嵌无头浏览器视窗

### 惊艳时刻设计
- 智能语义录制
- 闪电缓存（绿色闪电徽章）
- 自动愈合（橙色雷达扫描 → 绿色）
- 人工接管（红色暂停）

## 日志与监控系统

### 结构化日志流转
- Bun 端：标准化单行 JSON
- Rust 端：按行解析，异步存入 SQLite，实时 IPC 广播

### 双重视角 UI
- 小白视角：物流追踪式时间轴
- 极客视角：可拉起的终端面板

### 视觉快照
- 节点执行前后截取 Base64 缩略图
- 崩溃时全屏截图 + DOM 树保存

## 工程避坑方案

1. **Chromium 静默分发**：首次启动多线程下载，解压至 AppData
2. **僵尸进程清理**：Windows Job Object / Unix Process Group
3. **反爬虫指纹伪装**：CDP 注入 puppeteer-extra-plugin-stealth
4. **A/B 测试缓存污染**：SQLite 多分支缓存，多 Selector 备选
5. **日志防爆盘**：保留最近 7 天或 100 次详细日志

## 项目结构建议
```
model-rpa/
├── src-tauri/          # Tauri v2 (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/   # Tauri 命令
│   │   ├── scheduler/  # tokio-cron-scheduler
│   │   ├── vault/      # Stronghold 凭证
│   │   └── logger/     # SQLite 日志
│   └── Cargo.toml
├── src/                # React 19 前端
│   ├── components/
│   │   ├── canvas/     # React Flow 画布
│   │   ├── liveview/   # 浏览器视窗
│   │   ├── timeline/   # 日志时间轴
│   │   └── settings/   # 设置面板
│   ├── hooks/
│   ├── stores/
│   └── types/
├── bun-runtime/        # Bun Sidecar
│   ├── executor/       # Stagehand 执行器
│   ├── cache/          # DOM 哈希缓存
│   └── schemas/        # Zod Schema
└── marketplace/        # 工作流市场
```

**Why:** 这是 Model-RPA 项目的核心技术规格，所有开发工作都应基于此文档。

**How to apply:** 在实现任何模块前，先查阅此文档确认架构设计和技术选型。

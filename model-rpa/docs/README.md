# Model-RPA 文档中心

<div align="center">

🚀 **下一代语义化网页自动化操作系统**

*演示即生成，大白话即代码，运行即自愈*

</div>

## 📚 文档目录

### 快速开始
- [安装指南](guides/installation.md) - 环境准备与安装步骤
- [快速上手](guides/quickstart.md) - 5 分钟创建第一个工作流
- [基础教程](guides/basic-tutorial.md) - 核心功能详解

### 架构设计
- [系统架构](architecture/system-architecture.md) - 整体架构与技术栈
- [核心引擎](architecture/core-engine.md) - Stagehand 四大引擎设计
- [数据流](architecture/data-flow.md) - 数据流转与状态管理

### API 参考
- [Tauri 命令](api/tauri-commands.md) - Rust 后端命令 API
- [引擎 API](api/engine-api.md) - Stagehand 引擎 API
- [组件 API](api/components.md) - React 组件 API

### 开发指南
- [贡献指南](guides/contributing.md) - 如何参与项目开发
- [代码规范](guides/code-style.md) - 代码风格与最佳实践
- [测试指南](guides/testing.md) - 单元测试与 E2E 测试

### 部署与发布
- [构建指南](guides/building.md) - 构建生产版本
- [发布流程](guides/release.md) - 版本发布与更新

## 🏗️ 项目结构

```
model-rpa/
├── src/                        # React 前端源码
│   ├── components/             # UI 组件
│   │   ├── canvas/             # React Flow 画布
│   │   ├── liveview/           # 浏览器实时视窗
│   │   ├── timeline/           # 日志时间轴
│   │   ├── devconsole/         # 开发者控制台
│   │   ├── settings/           # 设置面板
│   │   └── layout/             # 布局组件
│   ├── engine/                 # 核心引擎
│   │   ├── stagehand.ts        # Stagehand 封装
│   │   ├── executor/           # 工作流执行器
│   │   ├── cache/              # 缓存管理
│   │   ├── schemas/            # Zod Schema
│   │   └── chromium/           # Chromium 管理
│   ├── logger/                 # 日志系统
│   │   ├── structured-logger.ts
│   │   └── visual-snapshot.ts
│   ├── stores/                 # Zustand 状态管理
│   ├── hooks/                  # React Hooks
│   ├── types/                  # TypeScript 类型
│   └── styles/                 # 全局样式
├── src-tauri/                  # Tauri v2 (Rust) 后端
│   ├── src/
│   │   ├── main.rs             # 入口文件
│   │   ├── lib.rs              # 库入口
│   │   ├── commands.rs         # Tauri 命令
│   │   ├── db.rs               # SQLite 数据库
│   │   ├── vault.rs            # 凭证保险箱
│   │   ├── scheduler.rs        # 定时任务调度
│   │   ├── window.rs           # 窗口管理
│   │   ├── process.rs          # 进程管理
│   │   └── logger.rs           # 日志管理
│   ├── Cargo.toml              # Rust 依赖
│   └── tauri.conf.json         # Tauri 配置
├── e2e/                        # E2E 测试
├── docs/                       # 项目文档
└── .github/workflows/          # CI/CD 配置
```

## 🛠️ 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | React | 19.2.6 | UI 渲染 |
| 桌面外壳 | Tauri | v2.11.2 | 跨平台桌面应用 |
| 运行时 | Bun | 1.3.14 | 极速 JavaScript 运行时 |
| AI 引擎 | Stagehand | 1.0.1 | 语义化网页自动化 |
| 画布引擎 | React Flow | 11.11.4 | 可视化工作流编辑 |
| 状态管理 | Zustand | 5.0.14 | 轻量级状态管理 |
| 数据验证 | Zod | 3.25.76 | 强类型 Schema |
| 样式框架 | Tailwind CSS | v4.0.0 | 原子化 CSS |
| 测试框架 | Vitest | 4.1.7 | 单元测试 |
| E2E 测试 | Playwright | 1.60.0 | 端到端测试 |

## 🚀 快速开始

### 环境要求

- [Bun](https://bun.sh) >= 1.0
- [Rust](https://rustup.rs/) >= 1.77
- [Node.js](https://nodejs.org/) >= 18 (可选)

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-username/model-rpa.git
cd model-rpa

# 安装依赖
bun install

# 开发模式
bun run tauri dev

# 构建生产版本
bun run tauri build
```

## 📖 核心概念

### 工作流 (Workflow)

工作流是由多个节点和连线组成的自动化流程图。每个节点代表一个操作步骤，连线定义执行顺序。

### 节点 (Node)

节点是工作流的基本单元，包括：
- **动作节点** - 执行点击、输入、选择等操作
- **数据提取节点** - 从页面提取结构化数据
- **循环节点** - 重复执行或翻页
- **条件节点** - 根据条件分支
- **Agent 节点** - AI 自主执行复杂任务

### Stagehand 引擎

Stagehand 是核心 AI 引擎，提供四大 API：
- **act()** - 语义化动作执行
- **extract()** - 强类型数据提取
- **observe()** - 页面元素观察
- **agent()** - 自主任务执行

## 🎯 使用场景

### 1. 电商数据采集

```
开始 → 打开商品列表 → 循环翻页 → 提取商品信息 → 导出 Excel
```

### 2. 自动化测试

```
开始 → 登录系统 → 执行测试用例 → 截图记录 → 生成报告
```

### 3. 定时任务

```
每天凌晨 3 点 → 自动比价 → 生成报告 → 发送通知
```

### 4. 表单自动填写

```
开始 → 读取 Excel 数据 → 循环填写表单 → 提交 → 记录结果
```

## 🔧 配置说明

### 环境变量

```env
# LLM API 配置
OPENAI_API_KEY=your-api-key
ANTHROPIC_API_KEY=your-api-key

# 代理配置
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=http://proxy:8080
```

### 应用配置

配置文件位于：
- Windows: `%APPDATA%/Model-RPA/config.json`
- macOS: `~/Library/Application Support/Model-RPA/config.json`
- Linux: `~/.config/model-rpa/config.json`

## 🐛 常见问题

### Q: Chromium 下载失败怎么办？

A: 检查网络连接，或手动下载 Chromium 并放置到应用数据目录。

### Q: 如何提高执行速度？

A: 启用缓存功能，相同操作会自动使用缓存结果。

### Q: 支持哪些网站？

A: 支持所有标准网页，部分反爬虫严格的网站可能需要配置代理。

## 📞 获取帮助

- 📧 邮箱：support@model-rpa.com
- 💬 社区：[GitHub Discussions](https://github.com/your-username/model-rpa/discussions)
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-username/model-rpa/issues)

## 📄 许可证

本项目采用 [MIT 许可证](../LICENSE)。

---

<div align="center">

**Model-RPA** - 让自动化更简单，让 AI 更可靠

[官网](https://model-rpa.com) · [文档](https://docs.model-rpa.com) · [GitHub](https://github.com/your-username/model-rpa)

</div>

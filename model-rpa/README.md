# Model-RPA

<div align="center">

🚀 **下一代语义化网页自动化操作系统**

[![CI](https://github.com/your-username/model-rpa/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/model-rpa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*演示即生成，大白话即代码，运行即自愈*

</div>

## ✨ 核心特性

- 🤖 **AI 语义理解** - 基于 Stagehand v3，告别脆弱的 XPath/CSS 选择器
- ⚡️ **智能缓存** - 毫秒级极速执行，零成本运行
- 🔄 **自动愈合** - 网页改版也能稳定运行，抗脆弱性设计
- 🎨 **可视化画布** - 拖拽式工作流编排，React Flow 驱动
- 🔒 **本地优先** - 数据安全不出本机，隐私有保障
- 🧩 **插件化架构** - MCP 协议支持，生态可扩展

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端交互层 | React 19 + Tailwind CSS v4 + React Flow | DAG 画布引擎 |
| 桌面外壳层 | Tauri v2 (Rust) | 窗口管理、系统托盘、定时任务 |
| 安全与存储层 | SQLite + Tauri Stronghold | 加密凭证保险箱 |
| 运行时层 | Bun (Sidecar) | 极速执行 TypeScript |
| 自动化内核 | Stagehand v3 + Playwright | CDP 协议直连 Chromium |
| 拓展协议层 | MCP | Model Context Protocol 双向集成 |

## 📦 快速开始

### 环境要求

- [Bun](https://bun.sh) >= 1.0
- [Rust](https://rustup.rs/) >= 1.77
- [Node.js](https://nodejs.org/) >= 18 (可选，用于兼容)

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
bun run tauri dev
```

### 构建生产版本

```bash
bun run tauri build
```

## 📁 项目结构

```
model-rpa/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件
│   │   ├── canvas/         # React Flow 画布
│   │   ├── liveview/       # 浏览器实时视窗
│   │   ├── timeline/       # 日志时间轴
│   │   └── settings/       # 设置面板
│   ├── hooks/              # React Hooks
│   ├── stores/             # Zustand 状态管理
│   ├── types/              # TypeScript 类型定义
│   └── styles/             # 全局样式
├── src-tauri/              # Tauri v2 (Rust) 后端
│   ├── src/
│   │   ├── main.rs         # 入口文件
│   │   ├── lib.rs          # 库入口
│   │   ├── commands.rs     # Tauri 命令
│   │   ├── db.rs           # SQLite 数据库
│   │   ├── vault.rs        # 凭证保险箱
│   │   └── scheduler.rs    # 定时任务调度
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 配置
├── .github/workflows/      # CI/CD 配置
└── docs/                   # 项目文档
```

## 🎯 核心模块

### 1. Stagehand 四大引擎

- **act()** - 语义行动与缓存节点
- **extract()** - 强类型数据提取
- **observe()** - 动态路由与循环探测
- **agent()** - 宏观自主托管（带人工确认）

### 2. 五大商业化模块

- **凭证保险箱** - Tauri Stronghold 加密存储
- **浏览器身份管理** - Playwright userDataDir 隔离
- **无人值守调度** - tokio-cron-scheduler 定时任务
- **计费审计系统** - BYOK + SaaS 双轨制
- **工作流市场** - .mrpa 标准格式分享

## 📝 开发规范

### 代码风格

- **TypeScript**: ESLint + Prettier
- **Rust**: rustfmt + clippy
- **提交规范**: Conventional Commits

### 运行检查

```bash
# 前端检查
bun run lint
bun run format

# Rust 检查
cd src-tauri && cargo fmt --check
cd src-tauri && cargo clippy
```

## 🧪 测试

```bash
# 前端测试
bunx vitest run

# Rust 测试
cd src-tauri && cargo test
```

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- 项目主页: [GitHub](https://github.com/your-username/model-rpa)
- 问题反馈: [Issues](https://github.com/your-username/model-rpa/issues)

---

<div align="center">

**Model-RPA** - 让自动化更简单，让 AI 更可靠

</div>

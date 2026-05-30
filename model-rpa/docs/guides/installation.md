# 安装指南

本文档将指导您完成 Model-RPA 的环境准备和安装。

## 系统要求

### 操作系统

- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 12 (Monterey) 或更高版本
- **Linux**: Ubuntu 20.04 或更高版本（其他发行版可能需要额外配置）

### 必需软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| [Bun](https://bun.sh) | >= 1.0 | JavaScript 运行时和包管理器 |
| [Rust](https://rustup.rs/) | >= 1.77 | 系统编程语言 |
| [Git](https://git-scm.com/) | >= 2.0 | 版本控制工具 |

### 可选软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| [Node.js](https://nodejs.org/) | >= 18 | 仅用于兼容性 |
| [VS Code](https://code.visualstudio.com/) | 最新版 | 推荐的代码编辑器 |

## 安装步骤

### 1. 安装 Bun

#### Windows

```powershell
# 使用 PowerShell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### macOS / Linux

```bash
curl -fsSL https://bun.sh/install | bash
```

验证安装：

```bash
bun --version
```

### 2. 安装 Rust

#### 所有平台

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

验证安装：

```bash
rustc --version
cargo --version
```

### 3. 安装系统依赖

#### Windows

无需额外依赖。

#### macOS

```bash
xcode-select --install
```

#### Ubuntu / Debian

```bash
sudo apt update
sudo apt install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

#### Fedora

```bash
sudo dnf install -y \
  gtk3-devel \
  webkit2gtk4.1-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  patchelf
```

#### Arch Linux

```bash
sudo pacman -S --needed \
  gtk3 \
  webkit2gtk-4.1 \
  libappindicator-gtk3 \
  librsvg \
  patchelf
```

### 4. 克隆项目

```bash
git clone https://github.com/your-username/model-rpa.git
cd model-rpa
```

### 5. 安装项目依赖

```bash
bun install
```

### 6. 验证安装

```bash
# 运行开发服务器
bun run tauri dev
```

如果一切正常，应用窗口应该会自动打开。

## 开发工具配置

### VS Code 推荐扩展

```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright"
  ]
}
```

### VS Code 设置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "rust-analyzer.check.command": "clippy"
}
```

## 环境变量配置

### LLM API 配置

在项目根目录创建 `.env` 文件：

```env
# OpenAI API
OPENAI_API_KEY=sk-your-api-key

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-api-key

# DeepSeek API
DEEPSEEK_API_KEY=your-api-key
```

### 代理配置

如果需要使用代理：

```env
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=http://proxy:8080
NO_PROXY=localhost,127.0.0.1
```

## 故障排除

### Bun 安装失败

**问题**: `bun: command not found`

**解决方案**:
```bash
# 重新加载 shell 配置
source ~/.bashrc  # 或 ~/.zshrc

# 或手动添加到 PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

### Rust 编译错误

**问题**: `error: linker 'cc' not found`

**解决方案**:
```bash
# Ubuntu/Debian
sudo apt install build-essential

# macOS
xcode-select --install
```

### Tauri 构建失败

**问题**: `error: failed to run custom build command for 'tauri-build'`

**解决方案**:
```bash
# 清理并重新构建
cd src-tauri
cargo clean
cd ..
bun run tauri build
```

### Chromium 下载失败

**问题**: Chromium 下载超时或失败

**解决方案**:
1. 检查网络连接
2. 使用代理
3. 手动下载 Chromium：
   - 访问 [Playwright Chromium](https://playwright.azureedge.net/)
   - 下载对应平台的版本
   - 解压到应用数据目录

## 下一步

安装完成后，请阅读 [快速上手指南](quickstart.md) 开始创建您的第一个工作流。

---

返回 [文档首页](../README.md)

# 部署指南

本文档提供 Model-RPA 项目的完整部署流程，包括开发环境、构建、发布和分发。

## 📋 目录

- [环境要求](#环境要求)
- [开发环境部署](#开发环境部署)
- [生产构建](#生产构建)
- [平台分发](#平台分发)
- [CI/CD 自动部署](#cicd-自动部署)
- [发布管理](#发布管理)
- [常见问题](#常见问题)

## 环境要求

### 必需软件

| 软件 | 版本 | 用途 |
|------|------|------|
| [Bun](https://bun.sh) | >= 1.0 | JavaScript 运行时和包管理器 |
| [Rust](https://rustup.rs/) | >= 1.77 | 系统编程语言 |
| [Git](https://git-scm.com/) | >= 2.0 | 版本控制 |

### 系统依赖

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

## 开发环境部署

### 1. 克隆项目

```bash
git clone https://github.com/Csmkl000/model-rpa.git
cd model-rpa
```

### 2. 安装依赖

```bash
cd model-rpa
bun install
```

### 3. 启动开发服务器

```bash
bun run tauri dev
```

这将启动：
- Vite 开发服务器（http://localhost:5173）
- Tauri 应用程序窗口
- 热重载支持

### 4. 开发调试

```bash
# 打开开发者工具
bun run tauri dev --debug

# 查看日志
RUST_LOG=debug bun run tauri dev
```

## 生产构建

### 1. 构建前端

```bash
cd model-rpa
bun run build
```

这将生成优化后的前端代码到 `dist/` 目录。

### 2. 构建 Tauri 应用

```bash
bun run tauri build
```

这将生成：
- **Windows**: `.msi` 安装包 + `.exe` 可执行文件
- **macOS**: `.dmg` 安装包 + `.app` 应用
- **Linux**: `.deb` + `.AppImage` 安装包

### 3. 构建产物位置

```
model-rpa/src-tauri/target/release/bundle/
├── windows/
│   ├── Model-RPA_0.1.0_x64_en-US.msi
│   └── Model-RPA_0.1.0_x64-setup.exe
├── macos/
│   ├── Model-RPA.app
│   └── Model-RPA_0.1.0_x64.dmg
└── linux/
    ├── model-rpa_0.1.0_amd64.deb
    └── model-rpa_0.1.0_amd64.AppImage
```

## 平台分发

### Windows 分发

#### MSI 安装包

```bash
# 构建 MSI
bun run tauri build --target msi

# 产物位置
# src-tauri/target/release/bundle/msi/Model-RPA_0.1.0_x64_en-US.msi
```

**分发方式**：
- 直接分发 MSI 文件
- 上传到 GitHub Releases
- 使用 Windows Package Manager (winget)

#### EXE 安装程序

```bash
# 构建 NSIS 安装程序
bun run tauri build --target nsis

# 产物位置
# src-tauri/target/release/bundle/nsis/Model-RPA_0.1.0_x64-setup.exe
```

### macOS 分发

#### DMG 安装包

```bash
# 构建 DMG
bun run tauri build --target dmg

# 产物位置
# src-tauri/target/release/bundle/dmg/Model-RPA_0.1.0_x64.dmg
```

**代码签名**（可选）：

```bash
# 设置环境变量
export APPLE_CERTIFICATE="你的证书"
export APPLE_CERTIFICATE_PASSWORD="证书密码"
export APPLE_SIGNING_IDENTITY="签名身份"
export APPLE_ID="你的 Apple ID"
export APPLE_PASSWORD="应用专用密码"

# 构建签名版本
bun run tauri build
```

**公证**（macOS 10.15+）：

```bash
# 使用 Tauri CLI 公证
bunx tauri signer sign "src-tauri/target/release/bundle/dmg/Model-RPA_0.1.0_x64.dmg"
```

### Linux 分发

#### DEB 包

```bash
# 构建 DEB
bun run tauri build --target deb

# 产物位置
# src-tauri/target/release/bundle/deb/model-rpa_0.1.0_amd64.deb
```

**安装**：
```bash
sudo dpkg -i model-rpa_0.1.0_amd64.deb
```

#### AppImage

```bash
# 构建 AppImage
bun run tauri build --target appimage

# 产物位置
# src-tauri/target/release/bundle/appimage/model-rpa_0.1.0_amd64.AppImage
```

**运行**：
```bash
chmod +x model-rpa_0.1.0_amd64.AppImage
./model-rpa_0.1.0_amd64.AppImage
```

## CI/CD 自动部署

### GitHub Actions

项目已配置 GitHub Actions 自动构建：

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    strategy:
      matrix:
        include:
          - platform: windows-latest
          - platform: macos-latest
          - platform: ubuntu-22.04
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: tauri-apps/tauri-action@v0
```

### 自动发布

创建 GitHub Release 时自动构建：

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: ${{ matrix.platform }}
    strategy:
      matrix:
        include:
          - platform: windows-latest
            args: '--target msi'
          - platform: macos-latest
            args: '--target dmg'
          - platform: ubuntu-22.04
            args: '--target deb appimage'
    steps:
      - uses: actions/checkout@v4
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
```

### 手动触发构建

```bash
# 本地模拟 CI 构建
bun run tauri build --target msi   # Windows
bun run tauri build --target dmg   # macOS
bun run tauri build --target deb   # Linux
```

## 发布管理

### 版本号规范

遵循 [Semantic Versioning](https://semver.org/)：

```
主版本.次版本.修订号
例如：1.0.0, 1.1.0, 1.1.1
```

### 更新版本号

```bash
# 更新 package.json
bunx npm-version patch  # 1.0.0 -> 1.0.1
bunx npm-version minor  # 1.0.0 -> 1.1.0
bunx npm-version major  # 1.0.0 -> 2.0.0

# 更新 Cargo.toml
cd src-tauri
cargo bump patch
```

### 创建 Release

```bash
# 1. 更新版本号
bunx npm-version patch

# 2. 提交更改
git add .
git commit -m "chore: bump version to 1.0.1"

# 3. 创建标签
git tag v1.0.1

# 4. 推送标签
git push origin v1.0.1

# 5. GitHub Actions 自动构建并发布
```

### 发布清单

- [ ] 更新 CHANGELOG.md
- [ ] 更新版本号
- [ ] 运行所有测试
- [ ] 构建所有平台
- [ ] 测试安装包
- [ ] 创建 GitHub Release
- [ ] 上传构建产物
- [ ] 更新文档

## 自动更新

### Tauri 自动更新

配置 `tauri.conf.json`：

```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://releases.model-rpa.com/{{target}}/{{arch}}/{{current_version}}"
    ],
    "dialog": true,
    "pubkey": "你的公钥"
  }
}
```

### 生成更新密钥

```bash
bunx tauri signer generate
```

### 更新服务器

使用 GitHub Releases 作为更新服务器：

```json
{
  "updater": {
    "endpoints": [
      "https://github.com/Csmkl000/model-rpa/releases/latest/download/latest.json"
    ]
  }
}
```

## 常见问题

### Q: 构建失败怎么办？

**问题**: `error: linker 'cc' not found`

**解决方案**:
```bash
# Ubuntu/Debian
sudo apt install build-essential

# macOS
xcode-select --install
```

### Q: 如何减小安装包体积？

**优化策略**：
1. 启用 LTO（Link Time Optimization）
2. 移除调试符号
3. 压缩资源文件

```toml
# src-tauri/Cargo.toml
[profile.release]
lto = true
codegen-units = 1
strip = true
```

### Q: 如何支持自动更新？

**步骤**：
1. 生成更新密钥
2. 配置更新端点
3. 部署更新服务器
4. 测试更新流程

### Q: 如何进行代码签名？

**Windows**：
```bash
# 使用 signtool
signtool sign /f certificate.pfx /p password Model-RPA.exe
```

**macOS**：
```bash
# 使用 codesign
codesign --force --sign "Developer ID Application" Model-RPA.app
```

## 部署检查清单

### 开发环境

- [ ] 安装 Bun
- [ ] 安装 Rust
- [ ] 安装系统依赖
- [ ] 克隆项目
- [ ] 安装依赖
- [ ] 启动开发服务器
- [ ] 验证热重载

### 生产构建

- [ ] 运行测试
- [ ] 构建前端
- [ ] 构建 Tauri 应用
- [ ] 验证构建产物
- [ ] 测试安装包

### 发布

- [ ] 更新版本号
- [ ] 更新 CHANGELOG
- [ ] 创建 Git 标签
- [ ] 推送到 GitHub
- [ ] 等待 CI 构建
- [ ] 创建 Release
- [ ] 上传构建产物
- [ ] 验证下载链接
- [ ] 更新文档

---

**文档版本**：1.0.0
**最后更新**：2026-05-30

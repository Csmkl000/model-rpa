/**
 * Model-RPA Chromium Manager
 * 静默下载与管理 Chromium 二进制文件
 */

import { join } from 'path';
import { existsSync, mkdirSync, createWriteStream, chmodSync } from 'fs';
import { homedir } from 'os';
import { execSync } from 'child_process';

// 平台类型
type Platform = 'win32' | 'darwin' | 'linux';

// 架构类型
type Arch = 'x64' | 'arm64';

// Chromium 版本信息
interface ChromiumVersion {
  version: string;
  revision: string;
  downloadUrl: string;
  sha256: string;
}

// 下载进度回调
type ProgressCallback = (progress: {
  percent: number;
  downloaded: number;
  total: number;
}) => void;

/**
 * Chromium 管理器
 * 负责下载、更新和管理 Chromium 二进制文件
 */
export class ChromiumManager {
  private appDataDir: string;
  private chromiumDir: string;
  private platform: Platform;
  private arch: Arch;

  constructor() {
    this.platform = process.platform as Platform;
    this.arch = process.arch as Arch;
    this.appDataDir = this.getAppDataDir();
    this.chromiumDir = join(this.appDataDir, 'chromium');
  }

  /**
   * 获取应用数据目录
   */
  private getAppDataDir(): string {
    const baseDir = homedir();

    switch (this.platform) {
      case 'win32':
        return join(baseDir, 'AppData', 'Local', 'Model-RPA');
      case 'darwin':
        return join(baseDir, 'Library', 'Application Support', 'Model-RPA');
      case 'linux':
        return join(baseDir, '.local', 'share', 'model-rpa');
      default:
        return join(baseDir, '.model-rpa');
    }
  }

  /**
   * 获取 Chromium 可执行文件路径
   */
  getExecutablePath(): string | null {
    const possiblePaths = this.getExecutablePaths();

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }

  /**
   * 获取可能的可执行文件路径
   */
  private getExecutablePaths(): string[] {
    const baseDir = join(this.chromiumDir, 'chrome');

    switch (this.platform) {
      case 'win32':
        return [
          join(baseDir, 'chrome.exe'),
          join(baseDir, 'chrome-win', 'chrome.exe'),
        ];
      case 'darwin':
        return [
          join(baseDir, 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
          join(baseDir, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
        ];
      case 'linux':
        return [
          join(baseDir, 'chrome'),
          join(baseDir, 'chrome-linux', 'chrome'),
        ];
      default:
        return [];
    }
  }

  /**
   * 检查 Chromium 是否已安装
   */
  isInstalled(): boolean {
    return this.getExecutablePath() !== null;
  }

  /**
   * 获取已安装的版本
   */
  getInstalledVersion(): string | null {
    const executablePath = this.getExecutablePath();
    if (!executablePath) {
      return null;
    }

    try {
      const command = this.platform === 'win32'
        ? `"${executablePath}" --version`
        : `'${executablePath}' --version`;

      const output = execSync(command, { encoding: 'utf-8' });
      const match = output.match(/Chromium\s+([\d.]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * 下载 Chromium
   */
  async download(
    version?: string,
    onProgress?: ProgressCallback
  ): Promise<string> {
    // 确保目录存在
    if (!existsSync(this.chromiumDir)) {
      mkdirSync(this.chromiumDir, { recursive: true });
    }

    // 获取下载信息
    const downloadInfo = this.getDownloadInfo(version);

    console.log(`[Chromium] 开始下载版本 ${downloadInfo.version}`);
    console.log(`[Chromium] 下载地址: ${downloadInfo.downloadUrl}`);

    // 下载文件
    const zipPath = join(this.chromiumDir, `chromium-${downloadInfo.version}.zip`);
    await this.downloadFile(downloadInfo.downloadUrl, zipPath, onProgress);

    // 解压文件
    console.log('[Chromium] 解压文件...');
    await this.extractZip(zipPath, this.chromiumDir);

    // 设置可执行权限 (Linux/macOS)
    if (this.platform !== 'win32') {
      const executablePath = this.getExecutablePath();
      if (executablePath) {
        chmodSync(executablePath, 0o755);
      }
    }

    console.log('[Chromium] 下载完成');
    return this.getExecutablePath()!;
  }

  /**
   * 获取下载信息
   */
  private getDownloadInfo(version?: string): ChromiumVersion {
    // 使用 Playwright 的 Chromium 版本
    const defaultVersion = '1148';

    // 根据平台和架构生成下载 URL
    const platformMap: Record<Platform, string> = {
      win32: 'Win',
      darwin: 'Mac',
      linux: 'Linux',
    };

    const archMap: Record<Arch, string> = {
      x64: 'x64',
      arm64: 'arm64',
    };

    const versionStr = version || defaultVersion;
    const platform = platformMap[this.platform];
    const arch = archMap[this.arch];

    return {
      version: versionStr,
      revision: '0',
      downloadUrl: `https://playwright.azureedge.net/builds/chromium/${versionStr}/chromium-${platform.toLowerCase()}-${arch}.zip`,
      sha256: '', // TODO: 添加 SHA256 校验
    };
  }

  /**
   * 下载文件
   */
  private async downloadFile(
    url: string,
    destPath: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    const total = parseInt(response.headers.get('content-length') || '0', 10);
    let downloaded = 0;

    const fileStream = createWriteStream(destPath);
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      fileStream.write(value);
      downloaded += value.length;

      if (onProgress && total > 0) {
        onProgress({
          percent: (downloaded / total) * 100,
          downloaded,
          total,
        });
      }
    }

    fileStream.end();

    return new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
  }

  /**
   * 解压 ZIP 文件
   */
  private async extractZip(zipPath: string, destDir: string): Promise<void> {
    // TODO: 实现 ZIP 解压
    // 可以使用 adm-zip 或 node-unzipper
    console.log(`[Chromium] 解压 ${zipPath} 到 ${destDir}`);
  }

  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<{
    hasUpdate: boolean;
    currentVersion: string | null;
    latestVersion: string;
  }> {
    const currentVersion = this.getInstalledVersion();
    const latestVersion = '1148'; // TODO: 从服务器获取最新版本

    return {
      hasUpdate: currentVersion !== latestVersion,
      currentVersion,
      latestVersion,
    };
  }

  /**
   * 清理旧版本
   */
  async cleanup(): Promise<void> {
    // TODO: 清理旧版本的 Chromium
    console.log('[Chromium] 清理旧版本...');
  }

  /**
   * 获取 Chromium 信息
   */
  getInfo(): {
    installed: boolean;
    version: string | null;
    path: string | null;
    platform: Platform;
    arch: Arch;
  } {
    return {
      installed: this.isInstalled(),
      version: this.getInstalledVersion(),
      path: this.getExecutablePath(),
      platform: this.platform,
      arch: this.arch,
    };
  }
}

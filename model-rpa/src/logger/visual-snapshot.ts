/**
 * Model-RPA Visual Snapshot
 * 视觉快照系统 - 节点前后截图 + 崩溃截图
 */

import { invoke } from '@tauri-apps/api/core';

// 快照类型
export type SnapshotType = 'before' | 'after' | 'error' | 'crash';

// 快照数据
export interface Snapshot {
  id: string;
  type: SnapshotType;
  nodeId?: string;
  timestamp: string;
  dataUrl: string; // Base64 编码的图片
  width: number;
  height: number;
  metadata?: Record<string, any>;
}

// 快照配置
export interface SnapshotConfig {
  enabled: boolean;
  quality: number; // 0-100
  maxWidth: number;
  maxHeight: number;
  format: 'jpeg' | 'png' | 'webp';
  captureBefore: boolean;
  captureAfter: boolean;
  captureOnError: boolean;
  captureOnCrash: boolean;
}

/**
 * 视觉快照管理器
 * 负责在节点执行前后截取低分辨率 Base64 缩略图
 */
export class VisualSnapshotManager {
  private config: SnapshotConfig;
  private snapshots: Snapshot[] = [];
  private maxSnapshots: number = 100;

  constructor(config: Partial<SnapshotConfig> = {}) {
    this.config = {
      enabled: true,
      quality: 50,
      maxWidth: 320,
      maxHeight: 240,
      format: 'jpeg',
      captureBefore: true,
      captureAfter: true,
      captureOnError: true,
      captureOnCrash: true,
      ...config,
    };
  }

  /**
   * 截取快照
   */
  async capture(
    type: SnapshotType,
    nodeId?: string,
    metadata?: Record<string, any>
  ): Promise<Snapshot | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      // 调用后端截图
      const screenshot = await invoke<string>('capture_screenshot', {
        quality: this.config.quality,
        maxWidth: this.config.maxWidth,
        maxHeight: this.config.maxHeight,
        format: this.config.format,
      });

      const snapshot: Snapshot = {
        id: this.generateId(),
        type,
        nodeId,
        timestamp: new Date().toISOString(),
        dataUrl: screenshot,
        width: this.config.maxWidth,
        height: this.config.maxHeight,
        metadata,
      };

      // 存储快照
      this.storeSnapshot(snapshot);

      return snapshot;
    } catch (error) {
      console.error('截取快照失败:', error);
      return null;
    }
  }

  /**
   * 截取节点执行前快照
   */
  async captureBeforeNode(nodeId: string): Promise<Snapshot | null> {
    if (!this.config.captureBefore) return null;
    return this.capture('before', nodeId);
  }

  /**
   * 截取节点执行后快照
   */
  async captureAfterNode(nodeId: string): Promise<Snapshot | null> {
    if (!this.config.captureAfter) return null;
    return this.capture('after', nodeId);
  }

  /**
   * 截取错误快照
   */
  async captureError(nodeId: string, error: Error): Promise<Snapshot | null> {
    if (!this.config.captureOnError) return null;
    return this.capture('error', nodeId, {
      errorMessage: error.message,
      errorStack: error.stack,
    });
  }

  /**
   * 截取崩溃快照
   */
  async captureCrash(error: Error): Promise<Snapshot | null> {
    if (!this.config.captureOnCrash) return null;
    return this.capture('crash', undefined, {
      errorMessage: error.message,
      errorStack: error.stack,
      isCrash: true,
    });
  }

  /**
   * 获取所有快照
   */
  getSnapshots(): Snapshot[] {
    return [...this.snapshots];
  }

  /**
   * 获取节点快照
   */
  getNodeSnapshots(nodeId: string): Snapshot[] {
    return this.snapshots.filter((s) => s.nodeId === nodeId);
  }

  /**
   * 获取指定类型快照
   */
  getSnapshotsByType(type: SnapshotType): Snapshot[] {
    return this.snapshots.filter((s) => s.type === type);
  }

  /**
   * 清除快照
   */
  clearSnapshots(): void {
    this.snapshots = [];
  }

  /**
   * 导出快照
   */
  exportSnapshots(): string {
    return JSON.stringify(this.snapshots, null, 2);
  }

  /**
   * 存储快照
   */
  private storeSnapshot(snapshot: Snapshot): void {
    this.snapshots.push(snapshot);

    // 限制存储数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 全局快照实例
export const snapshotManager = new VisualSnapshotManager();

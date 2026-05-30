/**
 * Visual Snapshot Tests
 * 视觉快照模块单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualSnapshotManager, snapshotManager } from '../visual-snapshot';

describe('VisualSnapshotManager', () => {
  let manager: VisualSnapshotManager;

  beforeEach(() => {
    manager = new VisualSnapshotManager({
      enabled: true,
      captureBefore: true,
      captureAfter: true,
      captureOnError: true,
      captureOnCrash: true,
    });
  });

  describe('initialization', () => {
    it('should create manager with default config', () => {
      const defaultManager = new VisualSnapshotManager();
      expect(defaultManager).toBeDefined();
    });

    it('should create manager with custom config', () => {
      const customManager = new VisualSnapshotManager({
        enabled: false,
        quality: 80,
        maxWidth: 640,
        maxHeight: 480,
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('capture()', () => {
    it('should capture snapshot when enabled', async () => {
      // Mock invoke
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      const snapshot = await manager.capture('before', 'action-1');

      expect(snapshot).toBeDefined();
      expect(snapshot?.type).toBe('before');
      expect(snapshot?.nodeId).toBe('action-1');
      expect(snapshot?.timestamp).toBeDefined();
    });

    it('should return null when disabled', async () => {
      const disabledManager = new VisualSnapshotManager({ enabled: false });

      const snapshot = await disabledManager.capture('before', 'action-1');

      expect(snapshot).toBeNull();
    });
  });

  describe('captureBeforeNode()', () => {
    it('should capture before node snapshot', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      const snapshot = await manager.captureBeforeNode('action-1');

      expect(snapshot).toBeDefined();
      expect(snapshot?.type).toBe('before');
      expect(snapshot?.nodeId).toBe('action-1');
    });

    it('should return null when captureBefore is disabled', async () => {
      const noBeforeManager = new VisualSnapshotManager({ captureBefore: false });

      const snapshot = await noBeforeManager.captureBeforeNode('action-1');

      expect(snapshot).toBeNull();
    });
  });

  describe('captureAfterNode()', () => {
    it('should capture after node snapshot', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      const snapshot = await manager.captureAfterNode('action-1');

      expect(snapshot).toBeDefined();
      expect(snapshot?.type).toBe('after');
      expect(snapshot?.nodeId).toBe('action-1');
    });
  });

  describe('captureError()', () => {
    it('should capture error snapshot', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      const error = new Error('test error');
      const snapshot = await manager.captureError('action-1', error);

      expect(snapshot).toBeDefined();
      expect(snapshot?.type).toBe('error');
      expect(snapshot?.metadata?.errorMessage).toBe('test error');
    });
  });

  describe('captureCrash()', () => {
    it('should capture crash snapshot', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      const error = new Error('crash error');
      const snapshot = await manager.captureCrash(error);

      expect(snapshot).toBeDefined();
      expect(snapshot?.type).toBe('crash');
      expect(snapshot?.metadata?.isCrash).toBe(true);
    });
  });

  describe('getSnapshots()', () => {
    it('should return all snapshots', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      await manager.capture('before', 'action-1');
      await manager.capture('after', 'action-1');

      const snapshots = manager.getSnapshots();
      expect(snapshots).toHaveLength(2);
    });

    it('should return empty array initially', () => {
      const snapshots = manager.getSnapshots();
      expect(snapshots).toHaveLength(0);
    });
  });

  describe('getNodeSnapshots()', () => {
    it('should return snapshots for specific node', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      await manager.capture('before', 'action-1');
      await manager.capture('after', 'action-1');
      await manager.capture('before', 'action-2');

      const nodeSnapshots = manager.getNodeSnapshots('action-1');
      expect(nodeSnapshots).toHaveLength(2);
      expect(nodeSnapshots.every(s => s.nodeId === 'action-1')).toBe(true);
    });
  });

  describe('getSnapshotsByType()', () => {
    it('should return snapshots by type', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      await manager.capture('before', 'action-1');
      await manager.capture('after', 'action-1');
      await manager.capture('error', 'action-1');

      const beforeSnapshots = manager.getSnapshotsByType('before');
      expect(beforeSnapshots).toHaveLength(1);

      const errorSnapshots = manager.getSnapshotsByType('error');
      expect(errorSnapshots).toHaveLength(1);
    });
  });

  describe('clearSnapshots()', () => {
    it('should clear all snapshots', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      await manager.capture('before', 'action-1');
      await manager.capture('after', 'action-1');

      expect(manager.getSnapshots()).toHaveLength(2);

      manager.clearSnapshots();
      expect(manager.getSnapshots()).toHaveLength(0);
    });
  });

  describe('exportSnapshots()', () => {
    it('should export snapshots as JSON', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      await manager.capture('before', 'action-1');

      const exported = manager.exportSnapshots();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('max snapshots limit', () => {
    it('should limit stored snapshots', async () => {
      vi.mock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
      }));

      const limitedManager = new VisualSnapshotManager({
        enabled: true,
      });

      // 创建超过限制的快照
      for (let i = 0; i < 150; i++) {
        await limitedManager.capture('before', `action-${i}`);
      }

      const snapshots = limitedManager.getSnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(100);
    });
  });
});

describe('global snapshotManager', () => {
  it('should be a VisualSnapshotManager instance', () => {
    expect(snapshotManager).toBeInstanceOf(VisualSnapshotManager);
  });
});

/**
 * Model-RPA Plugin System
 * 插件系统 - 支持自定义节点和扩展
 */

import { Node, Edge } from 'reactflow';

// 插件接口
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license?: string;

  // 生命周期
  initialize?: () => Promise<void>;
  destroy?: () => Promise<void>;

  // 节点注册
  nodes?: PluginNode[];

  // 命令注册
  commands?: PluginCommand[];

  // 钩子注册
  hooks?: PluginHook[];
}

// 插件节点接口
export interface PluginNode {
  type: string;
  label: string;
  icon: string;
  description: string;
  category: string;
  component: React.ComponentType<any>;
  defaultData: Record<string, any>;
  validate?: (data: any) => boolean;
  execute?: (data: any, context: ExecutionContext) => Promise<any>;
}

// 插件命令接口
export interface PluginCommand {
  name: string;
  description: string;
  handler: (params: any) => Promise<any>;
}

// 插件钩子接口
export interface PluginHook {
  name: string;
  handler: (context: any) => Promise<void>;
}

// 执行上下文
export interface ExecutionContext {
  engine: any;
  logger: any;
  cache: any;
  variables: Map<string, any>;
  workflow: {
    nodes: Node[];
    edges: Edge[];
  };
}

// 插件管理器
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private nodes: Map<string, PluginNode> = new Map();
  private commands: Map<string, PluginCommand> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();

  /**
   * 注册插件
   */
  async register(plugin: Plugin): Promise<void> {
    // 检查是否已注册
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    // 注册节点
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        this.nodes.set(node.type, node);
      }
    }

    // 注册命令
    if (plugin.commands) {
      for (const command of plugin.commands) {
        this.commands.set(command.name, command);
      }
    }

    // 注册钩子
    if (plugin.hooks) {
      for (const hook of plugin.hooks) {
        const hooks = this.hooks.get(hook.name) || [];
        hooks.push(hook);
        this.hooks.set(hook.name, hooks);
      }
    }

    // 初始化插件
    if (plugin.initialize) {
      await plugin.initialize();
    }

    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin ${plugin.name} (${plugin.id}) registered`);
  }

  /**
   * 注销插件
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // 销毁插件
    if (plugin.destroy) {
      await plugin.destroy();
    }

    // 注销节点
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        this.nodes.delete(node.type);
      }
    }

    // 注销命令
    if (plugin.commands) {
      for (const command of plugin.commands) {
        this.commands.delete(command.name);
      }
    }

    // 注销钩子
    if (plugin.hooks) {
      for (const hook of plugin.hooks) {
        const hooks = this.hooks.get(hook.name) || [];
        const index = hooks.indexOf(hook);
        if (index > -1) {
          hooks.splice(index, 1);
        }
      }
    }

    this.plugins.delete(pluginId);
    console.log(`Plugin ${plugin.name} (${pluginId}) unregistered`);
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有插件
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取所有节点
   */
  getNodes(): PluginNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取节点
   */
  getNode(type: string): PluginNode | undefined {
    return this.nodes.get(type);
  }

  /**
   * 获取所有命令
   */
  getCommands(): PluginCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * 执行命令
   */
  async executeCommand(name: string, params: any): Promise<any> {
    const command = this.commands.get(name);
    if (!command) {
      throw new Error(`Command ${name} not found`);
    }
    return command.handler(params);
  }

  /**
   * 触发钩子
   */
  async triggerHook(name: string, context: any): Promise<void> {
    const hooks = this.hooks.get(name) || [];
    for (const hook of hooks) {
      await hook.handler(context);
    }
  }

  /**
   * 检查插件是否已注册
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * 获取插件数量
   */
  getPluginCount(): number {
    return this.plugins.size;
  }

  /**
   * 获取节点数量
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * 获取命令数量
   */
  getCommandCount(): number {
    return this.commands.size;
  }
}

// 全局插件管理器实例
export const pluginManager = new PluginManager();

// 插件工厂函数
export function createPlugin(config: Omit<Plugin, 'id'> & { id?: string }): Plugin {
  return {
    id: config.id || `plugin-${Date.now()}`,
    ...config,
  };
}

// 插件节点工厂函数
export function createPluginNode(config: PluginNode): PluginNode {
  return config;
}

// 插件命令工厂函数
export function createPluginCommand(config: PluginCommand): PluginCommand {
  return config;
}

// 插件钩子工厂函数
export function createPluginHook(config: PluginHook): PluginHook {
  return config;
}

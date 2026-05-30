/**
 * Model-RPA Plugin Module
 * 插件系统模块导出
 */

export {
  PluginManager,
  pluginManager,
  createPlugin,
  createPluginNode,
  createPluginCommand,
  createPluginHook,
} from './plugin-system';

export type {
  Plugin,
  PluginNode,
  PluginCommand,
  PluginHook,
  ExecutionContext,
} from './plugin-system';

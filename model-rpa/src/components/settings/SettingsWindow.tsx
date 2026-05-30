/**
 * Model-RPA Settings Window
 * 设置窗口组件
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SystemInfo {
  app_version: string;
  os: string;
  arch: string;
  chromium_installed: boolean;
  chromium_version: string | null;
}

interface Profile {
  id: string;
  name: string;
  description: string;
  user_data_dir: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Credential {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function SettingsWindow() {
  const [activeTab, setActiveTab] = useState<'general' | 'profiles' | 'credentials' | 'advanced'>('general');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [info, profs, creds] = await Promise.all([
        invoke<SystemInfo>('get_system_info'),
        invoke<Profile[]>('get_profiles'),
        invoke<Credential[]>('list_credentials'),
      ]);
      setSystemInfo(info);
      setProfiles(profs);
      setCredentials(creds);
    } catch (error) {
      console.error('加载设置数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      await invoke('close_settings_window');
    } catch (error) {
      console.error('关闭窗口失败:', error);
    }
  };

  const tabs = [
    { id: 'general' as const, label: '通用', icon: '⚙️' },
    { id: 'profiles' as const, label: '浏览器身份', icon: '👤' },
    { id: 'credentials' as const, label: '凭证管理', icon: '🔐' },
    { id: 'advanced' as const, label: '高级', icon: '🛠️' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">设置</h1>
          <p className="text-sm text-gray-500">Model-RPA v{systemInfo?.app_version}</p>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>✕</span>
            <span>关闭</span>
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'general' && (
          <GeneralTab systemInfo={systemInfo} />
        )}
        {activeTab === 'profiles' && (
          <ProfilesTab profiles={profiles} onRefresh={loadData} />
        )}
        {activeTab === 'credentials' && (
          <CredentialsTab credentials={credentials} onRefresh={loadData} />
        )}
        {activeTab === 'advanced' && (
          <AdvancedTab systemInfo={systemInfo} />
        )}
      </div>
    </div>
  );
}

function GeneralTab({ systemInfo }: { systemInfo: SystemInfo | null }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">通用设置</h2>

      <div className="space-y-6">
        {/* 系统信息 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">系统信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">应用版本</label>
              <p className="text-gray-900">{systemInfo?.app_version || '未知'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">操作系统</label>
              <p className="text-gray-900">{systemInfo?.os || '未知'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">系统架构</label>
              <p className="text-gray-900">{systemInfo?.arch || '未知'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Chromium 状态</label>
              <p className="text-gray-900">
                {systemInfo?.chromium_installed ? (
                  <span className="text-green-600">✓ 已安装</span>
                ) : (
                  <span className="text-yellow-600">⚠ 未安装</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 外观设置 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">外观</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">深色模式</p>
                <p className="text-sm text-gray-500">切换深色/浅色主题</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">语言</p>
                <p className="text-sm text-gray-500">界面语言设置</p>
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="zh-CN">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* 启动设置 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">启动</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">开机自启</p>
                <p className="text-sm text-gray-500">系统启动时自动运行 Model-RPA</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">最小化到托盘</p>
                <p className="text-sm text-gray-500">关闭窗口时最小化到系统托盘</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilesTab({ profiles, onRefresh }: { profiles: Profile[]; onRefresh: () => void }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');

  const handleCreate = async () => {
    if (!newProfileName.trim()) return;

    try {
      await invoke('create_profile', {
        name: newProfileName,
        description: newProfileDescription,
      });
      setNewProfileName('');
      setNewProfileDescription('');
      setIsCreating(false);
      onRefresh();
    } catch (error) {
      console.error('创建身份失败:', error);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await invoke('set_active_profile', { id });
      onRefresh();
    } catch (error) {
      console.error('设置活跃身份失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个身份吗？相关的浏览器数据也会被删除。')) return;

    try {
      await invoke('delete_profile', { id });
      onRefresh();
    } catch (error) {
      console.error('删除身份失败:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">浏览器身份</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 新建身份
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        浏览器身份用于隔离不同的登录状态。每个身份拥有独立的 Cookie、LocalStorage 等数据。
      </p>

      {/* 创建表单 */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">新建身份</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名称
              </label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="例如：工作账号、私人小号"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述（可选）
              </label>
              <input
                type="text"
                value={newProfileDescription}
                onChange={(e) => setNewProfileDescription(e.target.value)}
                placeholder="身份用途说明"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                创建
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 身份列表 */}
      <div className="space-y-4">
        {profiles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">暂无浏览器身份</p>
            <p className="text-sm text-gray-400 mt-2">创建身份以隔离不同的登录状态</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                profile.is_active ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                    {profile.is_active && (
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                        当前使用
                      </span>
                    )}
                  </div>
                  {profile.description && (
                    <p className="text-sm text-gray-500 mt-1">{profile.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    创建于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!profile.is_active && (
                    <button
                      onClick={() => handleSetActive(profile.id)}
                      className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      使用
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CredentialsTab({ credentials, onRefresh }: { credentials: Credential[]; onRefresh: () => void }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCredName, setNewCredName] = useState('');
  const [newCredValue, setNewCredValue] = useState('');
  const [newCredDescription, setNewCredDescription] = useState('');

  const handleCreate = async () => {
    if (!newCredName.trim() || !newCredValue.trim()) return;

    const id = crypto.randomUUID();
    try {
      await invoke('store_credential', {
        id,
        name: newCredName,
        value: newCredValue,
        description: newCredDescription,
      });
      setNewCredName('');
      setNewCredValue('');
      setNewCredDescription('');
      setIsCreating(false);
      onRefresh();
    } catch (error) {
      console.error('存储凭证失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个凭证吗？')) return;

    try {
      await invoke('delete_credential', { id });
      onRefresh();
    } catch (error) {
      console.error('删除凭证失败:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">凭证管理</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 添加凭证
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        安全存储账号密码等敏感信息。凭证使用 Stronghold 加密存储，前端仅显示变量名。
      </p>

      {/* 创建表单 */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">添加凭证</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                变量名
              </label>
              <input
                type="text"
                value={newCredName}
                onChange={(e) => setNewCredName(e.target.value)}
                placeholder="例如：Taobao_Pwd"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                在工作流中使用 {'{{'} 变量名 {'}}'}  引用
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                值
              </label>
              <input
                type="password"
                value={newCredValue}
                onChange={(e) => setNewCredValue(e.target.value)}
                placeholder="输入密码或密钥"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述（可选）
              </label>
              <input
                type="text"
                value={newCredDescription}
                onChange={(e) => set新CredDescription(e.target.value)}
                placeholder="凭证用途说明"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 凭证列表 */}
      <div className="space-y-4">
        {credentials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">暂无凭证</p>
            <p className="text-sm text-gray-400 mt-2">添加凭证以安全存储敏感信息</p>
          </div>
        ) : (
          credentials.map((cred) => (
            <div
              key={cred.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔐</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {'{{'}{cred.name}{'}}'}
                    </h3>
                  </div>
                  {cred.description && (
                    <p className="text-sm text-gray-500 mt-1">{cred.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    创建于 {new Date(cred.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(cred.id)}
                  className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdvancedTab({ systemInfo }: { systemInfo: SystemInfo | null }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">高级设置</h2>

      <div className="space-y-6">
        {/* Chromium 管理 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chromium 管理</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">Chromium 版本</p>
                <p className="text-sm text-gray-500">
                  {systemInfo?.chromium_version || '未安装'}
                </p>
              </div>
              <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                检查更新
              </button>
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              重新下载 Chromium
            </button>
          </div>
        </div>

        {/* 缓存管理 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">缓存管理</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">动作缓存</p>
                <p className="text-sm text-gray-500">清除已缓存的 DOM 选择器</p>
              </div>
              <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                清除缓存
              </button>
            </div>
          </div>
        </div>

        {/* 开发者选项 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">开发者选项</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">开发者工具</p>
                <p className="text-sm text-gray-500">打开浏览器开发者工具</p>
              </div>
              <button
                onClick={() => invoke('toggle_devtools')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                打开
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">日志级别</p>
                <p className="text-sm text-gray-500">设置日志输出级别</p>
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="error">Error</option>
                <option value="warn">Warn</option>
                <option value="info" selected>Info</option>
                <option value="debug">Debug</option>
                <option value="trace">Trace</option>
              </select>
            </div>
          </div>
        </div>

        {/* 关于 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">关于</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Model-RPA - 下一代语义化网页自动化操作系统</p>
            <p>版本: {systemInfo?.app_version}</p>
            <p>技术栈: Tauri v2 + React 19 + Bun + Stagehand v3</p>
            <p className="mt-4">
              <a href="#" className="text-indigo-600 hover:text-indigo-700">
                GitHub 仓库
              </a>
              {' · '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700">
                使用文档
              </a>
              {' · '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700">
                问题反馈
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsWindow;

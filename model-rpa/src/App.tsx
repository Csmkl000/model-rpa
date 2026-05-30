/**
 * Model-RPA App
 * 主应用组件 - 优化版本（懒加载）
 */

import { useState, useEffect, Suspense, lazy } from 'react';
import { invoke } from '@tauri-apps/api/core';

// 懒加载组件
const Workspace = lazy(() => import('./components/layout/Workspace'));
const SettingsWindow = lazy(() => import('./components/settings/SettingsWindow'));

type AppView = 'workspace' | 'settings';

// 加载状态组件
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Model-RPA</h2>
        <p className="text-gray-600">正在加载组件...</p>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>('workspace');
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    // 初始化应用
    const initApp = async () => {
      try {
        // 获取应用版本
        const version = await invoke<string>('get_app_version');
        setAppVersion(version);

        // 检查是否是设置窗口
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'settings') {
          setCurrentView('settings');
        }
      } catch (error) {
        console.error('初始化应用失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // 加载中状态
  if (isLoading) {
    return <LoadingFallback />;
  }

  // 渲染当前视图
  return (
    <div className="h-screen overflow-hidden">
      <Suspense fallback={<LoadingFallback />}>
        {currentView === 'workspace' && <Workspace />}
        {currentView === 'settings' && <SettingsWindow />}
      </Suspense>
    </div>
  );
}

export default App;

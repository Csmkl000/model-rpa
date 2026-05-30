/**
 * Model-RPA App
 * 主应用组件 - 完整功能版本
 */

import { useState, useEffect, Suspense, lazy } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ReactFlowProvider } from 'reactflow';

// 懒加载组件
const Workspace = lazy(() => import('./components/layout/Workspace'));
const SettingsWindow = lazy(() => import('./components/settings/SettingsWindow'));

type AppView = 'workspace' | 'settings';

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 50,
          height: 50,
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h2>Model-RPA</h2>
        <p>正在加载组件...</p>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>('workspace');
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const initApp = async () => {
      try {
        const version = await invoke<string>('get_app_version');
        setAppVersion(version);

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

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <ReactFlowProvider>
        <Suspense fallback={<LoadingFallback />}>
          {currentView === 'workspace' && <Workspace />}
          {currentView === 'settings' && <SettingsWindow />}
        </Suspense>
      </ReactFlowProvider>
    </div>
  );
}

export default App;

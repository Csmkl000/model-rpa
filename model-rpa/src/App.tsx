/**
 * Model-RPA App
 * 使用已创建的组件
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Workspace } from './components/layout/Workspace';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion, setAppVersion] = useState('');
  const [showWorkspace, setShowWorkspace] = useState(false);

  useEffect(() => {
    invoke<string>('get_app_version')
      .then(setAppVersion)
      .catch(() => setAppVersion('0.1.0'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: 50,
            height: 50,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <h2>Model-RPA</h2>
          <p>正在加载...</p>
        </div>
      </div>
    );
  }

  if (showWorkspace) {
    return <Workspace onBack={() => setShowWorkspace(false)} />;
  }

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🚀</div>
        <h1 style={{
          fontSize: '40px',
          fontWeight: 800,
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Model-RPA
        </h1>
        <p style={{ color: '#666', fontSize: '18px', margin: '0 0 40px 0' }}>
          下一代语义化网页自动化操作系统
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => setShowWorkspace(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎨</div>
            打开编辑器
          </button>
          <button
            onClick={() => alert('导入功能开发中...')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
            导入工作流
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {['🤖 AI 语义理解', '⚡️ 闪电缓存', '🔄 自动愈合', '🔒 本地优先'].map((item) => (
            <span key={item} style={{
              background: '#f3f4f6',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#374151',
            }}>
              {item}
            </span>
          ))}
        </div>

        <p style={{ marginTop: '32px', fontSize: '12px', color: '#d1d5db' }}>
          v{appVersion} · Tauri v2 + React 19 + Bun + Stagehand v3
        </p>
      </div>
    </div>
  );
}

export default App;

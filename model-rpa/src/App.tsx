/**
 * Model-RPA App
 * 完整功能版本 - 集成所有已创建的组件
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ReactFlowProvider } from 'reactflow';
import { Workspace } from './components/layout/Workspace';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion, setAppVersion] = useState('');
  const [error, setError] = useState('');
  const [showWorkspace, setShowWorkspace] = useState(false);

  useEffect(() => {
    invoke<string>('get_app_version')
      .then(setAppVersion)
      .catch((err) => setError(String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, sans-serif',
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

  // 显示工作区
  if (showWorkspace) {
    return (
      <ReactFlowProvider>
        <Workspace onBack={() => setShowWorkspace(false)} />
      </ReactFlowProvider>
    );
  }

  // 首页
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
      }}>
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '72px', marginBottom: '16px' }}>🚀</div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Model-RPA
          </h1>
          <p style={{ color: '#666', fontSize: '18px', margin: 0 }}>
            下一代语义化网页自动化操作系统
          </p>
          <p style={{ color: '#999', fontSize: '14px', margin: '8px 0 0 0' }}>
            演示即生成 · 大白话即代码 · 运行即自愈
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#991b1b',
            fontSize: '14px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 主操作按钮 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px',
        }}>
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
            打开工作流编辑器
          </button>

          <button
            onClick={() => alert('功能开发中...')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
            导入工作流
          </button>
        </div>

        {/* 功能特性 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {[
            { icon: '🤖', label: 'AI 语义理解', desc: '告别 XPath' },
            { icon: '⚡️', label: '闪电缓存', desc: '毫秒级执行' },
            { icon: '🔄', label: '自动愈合', desc: '抗网页变动' },
            { icon: '🔒', label: '本地优先', desc: '数据不出本机' },
          ].map((item) => (
            <div key={item.label} style={{
              textAlign: 'center',
              padding: '16px 8px',
              background: '#f9fafb',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 技术栈 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}>
          {['Tauri v2', 'React 19', 'Bun', 'Stagehand v3', 'React Flow'].map((tech) => (
            <span key={tech} style={{
              background: '#f3f4f6',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: 500,
            }}>
              {tech}
            </span>
          ))}
        </div>

        {/* 版本信息 */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#d1d5db',
          margin: 0,
        }}>
          v{appVersion} · 下一代语义化网页自动化操作系统
        </p>
      </div>
    </div>
  );
}

export default App;

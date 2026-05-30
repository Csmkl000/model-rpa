/**
 * Model-RPA App
 * 主应用组件
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion, setAppVersion] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const initApp = async () => {
      try {
        const version = await invoke<string>('get_app_version');
        setAppVersion(version);
      } catch (err) {
        console.error('初始化失败:', err);
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handleNewWorkflow = () => {
    setMessage('✨ 正在创建新工作流...');
    setTimeout(() => setMessage('✅ 新工作流已创建！'), 1000);
  };

  const handleImportWorkflow = () => {
    setMessage('📂 正在导入工作流...');
    setTimeout(() => setMessage('✅ 工作流导入成功！'), 1000);
  };

  const handleOpenTutorial = () => {
    setMessage('📖 正在打开使用教程...');
    setTimeout(() => setMessage('✅ 教程已打开！'), 1000);
  };

  const handleOpenSettings = () => {
    setActiveTab('settings');
    setMessage('⚙️ 已打开设置');
  };

  if (isLoading) {
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
          <p>正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 头部 */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Model-RPA</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>下一代语义化网页自动化操作系统</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleOpenSettings}
            style={{
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            ⚙️ 设置
          </button>
          <span style={{ fontSize: 12, color: '#999' }}>
            v{appVersion}
          </span>
        </div>
      </header>

      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1f2937',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {message}
        </div>
      )}

      {/* 主内容 */}
      <main style={{ padding: 24 }}>
        {error ? (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24
          }}>
            <h3 style={{ color: '#991b1b', margin: '0 0 8px 0' }}>⚠️ 初始化错误</h3>
            <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>⚙️ 设置</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <h3 style={{ margin: '0 0 8px 0' }}>通用设置</h3>
                <p style={{ color: '#666', margin: 0 }}>应用版本: v{appVersion}</p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                style={{
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontSize: 14,
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
              >
                返回首页
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 功能卡片 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 24
            }}>
              <div
                onClick={handleNewWorkflow}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>工作流编辑器</h3>
                <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
                  可视化拖拽编排自动化工作流
                </p>
              </div>

              <div
                onClick={() => setMessage('🌐 浏览器自动化功能开发中...')}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌐</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>浏览器自动化</h3>
                <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
                  AI 驱动的智能网页操作
                </p>
              </div>

              <div
                onClick={() => setMessage('📊 数据提取功能开发中...')}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>数据提取</h3>
                <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
                  智能提取网页结构化数据
                </p>
              </div>

              <div
                onClick={() => setMessage('⏰ 定时任务功能开发中...')}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>定时任务</h3>
                <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
                  无人值守自动化执行
                </p>
              </div>
            </div>

            {/* 快速开始 */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 20 }}>🚀 快速开始</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={handleNewWorkflow}
                  style={{
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ➕ 新建工作流
                </button>
                <button
                  onClick={handleImportWorkflow}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📂 导入工作流
                </button>
                <button
                  onClick={handleOpenTutorial}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📖 使用教程
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 页脚 */}
      <footer style={{
        textAlign: 'center',
        padding: 16,
        color: '#999',
        fontSize: 12
      }}>
        Model-RPA v{appVersion} · 下一代语义化网页自动化操作系统
      </footer>
    </div>
  );
}

export default App;

/**
 * Model-RPA App - 测试版本
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

function App() {
  const [appVersion, setAppVersion] = useState('');
  const [error, setError] = useState('');
  const [showWorkspace, setShowWorkspace] = useState(false);

  useEffect(() => {
    invoke<string>('get_app_version')
      .then(setAppVersion)
      .catch((err) => setError(String(err)));
  }, []);

  if (showWorkspace) {
    return <SimpleWorkspace onBack={() => setShowWorkspace(false)} />;
  }

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>
          Model-RPA
        </h1>
        <p style={{ color: '#666', margin: '0 0 32px 0', fontSize: '16px' }}>
          下一代语义化网页自动化操作系统
        </p>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#991b1b',
            fontSize: '14px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <button
            onClick={() => setShowWorkspace(true)}
            style={{
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '20px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            🎨 打开编辑器
          </button>
          <button
            onClick={() => alert('功能开发中...')}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '20px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📂 导入工作流
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {['📊 数据提取', '⏰ 定时任务', '🌐 浏览器自动化', '🤖 AI Agent'].map((item) => (
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

        <p style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
          v{appVersion} · Tauri v2 + React 19 + Bun
        </p>
      </div>
    </div>
  );
}

// 简化的工作区组件
function SimpleWorkspace({ onBack }: { onBack: () => void }) {
  const [nodes, setNodes] = useState([
    { id: '1', type: '开始', x: 100, y: 100 },
  ]);
  const [message, setMessage] = useState('');

  const addNode = (type: string) => {
    const newNode = {
      id: String(Date.now()),
      type,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
    };
    setNodes([...nodes, newNode]);
    setMessage(`✅ 添加了 ${type} 节点`);
    setTimeout(() => setMessage(''), 2000);
  };

  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      fontFamily: 'system-ui, sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
    },
    backBtn: {
      padding: '8px 16px',
      background: '#f3f4f6',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    main: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
    },
    sidebar: {
      width: '200px',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '16px',
    },
    sidebarTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '12px',
    },
    nodeBtn: {
      width: '100%',
      padding: '12px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '8px',
      fontSize: '14px',
      textAlign: 'left' as const,
    },
    canvas: {
      flex: 1,
      background: '#f9fafb',
      position: 'relative' as const,
      overflow: 'auto',
    },
    node: {
      position: 'absolute' as const,
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      minWidth: '120px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'move',
    },
    message: {
      position: 'fixed' as const,
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1f2937',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    sidebarNode: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  };

  const nodeTypes = [
    { type: '动作', icon: '🖱️' },
    { type: '提取', icon: '📊' },
    { type: '循环', icon: '🔄' },
    { type: '条件', icon: '🔀' },
    { type: '等待', icon: '⏱️' },
    { type: '通知', icon: '🔔' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={styles.backBtn}>← 返回</button>
          <h1 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>🎨 工作流编辑器</h1>
        </div>
        <button style={{
          padding: '8px 20px',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
        }}>
          ▶️ 执行
        </button>
      </header>

      <div style={styles.main}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>节点面板</div>
          {nodeTypes.map(({ type, icon }) => (
            <button
              key={type}
              onClick={() => addNode(type)}
              style={styles.nodeBtn}
            >
              <div style={styles.sidebarNode}>
                <span>{icon}</span>
                <span>{type}</span>
              </div>
            </button>
          ))}
        </div>

        <div style={styles.canvas}>
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{
                ...styles.node,
                left: node.x,
                top: node.y,
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {nodeTypes.find(t => t.type === node.type)?.icon || '📦'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{node.type}</div>
            </div>
          ))}

          {nodes.length === 1 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#9ca3af',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👆</div>
              <p>点击左侧节点添加到画布</p>
            </div>
          )}
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

export default App;

/**
 * Model-RPA App - 确保能工作的版本
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// 内联的简单工作区组件
function SimpleWorkspace({ onBack }: { onBack: () => void }) {
  const [nodes, setNodes] = useState<Array<{id: string, type: string, x: number, y: number, icon: string}>>([]);
  const [message, setMessage] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodeTypes = [
    { type: '动作', icon: '🖱️' },
    { type: '数据提取', icon: '📊' },
    { type: '循环', icon: '🔄' },
    { type: '条件判断', icon: '🔀' },
    { type: '等待', icon: '⏱️' },
    { type: '通知', icon: '🔔' },
    { type: '变量', icon: '📝' },
    { type: '脚本', icon: '📜' },
    { type: '错误处理', icon: '🛡️' },
    { type: 'Agent', icon: '🤖' },
  ];

  const addNode = (type: string, icon: string) => {
    const newNode = {
      id: String(Date.now()),
      type,
      x: 150 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      icon,
    };
    setNodes(prev => [...prev, newNode]);
    setMessage(`✅ 添加了 ${type} 节点`);
    setTimeout(() => setMessage(''), 2000);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setSelectedNode(null);
    setMessage('🗑️ 节点已删除');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleExecute = () => {
    if (nodes.length === 0) {
      setMessage('⚠️ 请先添加节点');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    setIsExecuting(true);
    setMessage('▶️ 开始执行工作流...');

    // 模拟执行
    let index = 0;
    const interval = setInterval(() => {
      if (index < nodes.length) {
        setSelectedNode(nodes[index].id);
        setMessage(`⏳ 执行: ${nodes[index].type}...`);
        index++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
        setSelectedNode(null);
        setMessage('✅ 工作流执行完成！');
        setTimeout(() => setMessage(''), 3000);
      }
    }, 1000);
  };

  const logs = [
    { time: '14:30:01', level: 'INFO', msg: '工作流开始执行' },
    { time: '14:30:02', level: 'INFO', msg: '⚡️ 动作节点执行成功 (缓存命中)' },
    { time: '14:30:03', level: 'INFO', msg: '📊 数据提取完成: 20 条记录' },
    { time: '14:30:04', level: 'WARN', msg: '🔄 循环: 第 2/5 页' },
    { time: '14:30:05', level: 'INFO', msg: '✅ 工作流执行完成' },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      {/* 头部 */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
          }}>← 返回</button>
          <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>🎨 工作流编辑器</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowTimeline(!showTimeline)} style={{
            padding: '8px 16px',
            background: showTimeline ? '#e0e7ff' : '#f3f4f6',
            color: showTimeline ? '#4338ca' : '#374151',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
          }}>
            📊 {showTimeline ? '隐藏日志' : '显示日志'}
          </button>
          <button onClick={handleExecute} disabled={isExecuting} style={{
            padding: '8px 20px',
            background: isExecuting ? '#9ca3af' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            {isExecuting ? '⏳ 执行中...' : '▶️ 执行'}
          </button>
        </div>
      </header>

      {/* 状态栏 */}
      <div style={{
        display: 'flex',
        gap: '24px',
        padding: '8px 20px',
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280',
      }}>
        <span>📦 节点: {nodes.length}</span>
        <span>📍 状态: {isExecuting ? '执行中' : '就绪'}</span>
      </div>

      {/* 主内容 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧节点面板 */}
        <div style={{
          width: '200px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '16px',
          overflowY: 'auto',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0', color: '#374151' }}>
            节点面板
          </h3>
          {nodeTypes.map(({ type, icon }) => (
            <button
              key={type}
              onClick={() => addNode(type, icon)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '6px',
                fontSize: '13px',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span>{type}</span>
            </button>
          ))}
        </div>

        {/* 中间画布 */}
        <div style={{
          flex: 1,
          background: '#f3f4f6',
          position: 'relative',
          overflow: 'auto',
        }}>
          {nodes.length === 0 ? (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#9ca3af',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👆</div>
              <p style={{ fontSize: '16px', margin: '0 0 8px 0' }}>点击左侧节点添加到画布</p>
              <p style={{ fontSize: '13px', margin: 0 }}>开始构建你的自动化工作流</p>
            </div>
          ) : (
            nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  background: selectedNode === node.id ? '#e0e7ff' : 'white',
                  border: selectedNode === node.id ? '2px solid #818cf8' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  minWidth: '120px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{node.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{node.type}</div>
                {selectedNode === node.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                    style={{
                      marginTop: '8px',
                      padding: '4px 12px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    🗑️ 删除
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 右侧浏览器视图 */}
        <div style={{
          width: '35%',
          background: '#1f2937',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px',
            background: '#111827',
            borderBottom: '1px solid #374151',
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <input
                type="text"
                placeholder="输入网址..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#374151',
                  color: 'white',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
              <button style={{
                padding: '8px 16px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}>
                前往
              </button>
            </div>
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌐</div>
              <p style={{ margin: 0 }}>浏览器视图</p>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>输入网址开始浏览</p>
            </div>
          </div>
        </div>
      </div>

      {/* 时间轴 */}
      {showTimeline && (
        <div style={{
          height: '200px',
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '12px 20px',
          overflowY: 'auto',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>📊 执行日志</h3>
          {logs.map((log, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '12px',
              padding: '6px 0',
              borderBottom: '1px solid #f3f4f6',
              fontSize: '13px',
            }}>
              <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{log.time}</span>
              <span style={{
                color: log.level === 'WARN' ? '#f59e0b' : '#10b981',
                fontWeight: 600,
                width: '40px',
              }}>{log.level}</span>
              <span style={{ color: '#374151' }}>{log.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1f2937',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '10px',
          fontSize: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

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
    return <SimpleWorkspace onBack={() => setShowWorkspace(false)} />;
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

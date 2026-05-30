/**
 * Model-RPA Live View
 * 实时浏览器视图 - 内联样式版本
 */

import { useState } from 'react';

export function LiveView() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  const handleLoadUrl = async () => {
    if (!inputUrl.trim()) return;
    setIsLoading(true);
    let url = inputUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setCurrentUrl(url);
    setInputUrl(url);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: '#1f2937',
      borderBottom: '1px solid #374151',
    },
    navBtn: {
      padding: '6px',
      color: '#9ca3af',
      background: 'transparent',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    urlInput: {
      flex: 1,
      padding: '8px 12px',
      background: '#374151',
      color: 'white',
      fontSize: '13px',
      borderRadius: '6px',
      border: '1px solid #4b5563',
      outline: 'none',
    },
    goBtn: {
      padding: '8px 16px',
      background: '#4f46e5',
      color: 'white',
      fontSize: '13px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
    },
    recordBtn: {
      padding: '8px 16px',
      fontSize: '13px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
    },
    content: {
      flex: 1,
      position: 'relative' as const,
      background: 'white',
    },
    loading: {
      position: 'absolute' as const,
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.9)',
      zIndex: 10,
    },
    empty: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    emptyContent: {
      textAlign: 'center' as const,
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#374151',
      margin: '0 0 8px 0',
    },
    emptyDesc: {
      color: '#6b7280',
      margin: '0 0 24px 0',
      fontSize: '14px',
    },
    quickLinks: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      justifyContent: 'center',
      gap: '8px',
    },
    quickLink: {
      padding: '8px 16px',
      background: '#f3f4f6',
      color: '#374151',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
    },
    recording: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#dc2626',
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    statusBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      background: '#1f2937',
      borderTop: '1px solid #374151',
      fontSize: '11px',
      color: '#9ca3af',
    },
  };

  return (
    <div style={styles.container}>
      {/* 工具栏 */}
      <div style={styles.toolbar}>
        <button style={styles.navBtn} title="后退">←</button>
        <button style={styles.navBtn} title="前进">→</button>
        <button style={styles.navBtn} title="刷新" onClick={() => currentUrl && setInputUrl(currentUrl)}>↻</button>

        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
          placeholder="输入网址..."
          style={styles.urlInput}
        />
        <button onClick={handleLoadUrl} style={styles.goBtn}>
          {isLoading ? '加载中...' : '前往'}
        </button>

        <button
          onClick={() => setIsRecording(!isRecording)}
          style={{
            ...styles.recordBtn,
            background: isRecording ? '#dc2626' : '#374151',
            color: isRecording ? 'white' : '#d1d5db',
          }}
        >
          {isRecording ? '⏹️ 停止录制' : '🔴 开始录制'}
        </button>
      </div>

      {/* 内容区 */}
      <div style={styles.content}>
        {isLoading && (
          <div style={styles.loading}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 32,
                height: 32,
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #4f46e5',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }} />
              <p style={{ color: '#6b7280' }}>正在加载页面...</p>
            </div>
          </div>
        )}

        {!currentUrl ? (
          <div style={styles.empty}>
            <div style={styles.emptyContent}>
              <div style={styles.emptyIcon}>🌐</div>
              <h3 style={styles.emptyTitle}>浏览器视图</h3>
              <p style={styles.emptyDesc}>输入网址开始浏览，或点击录制按钮录制操作</p>
              <div style={styles.quickLinks}>
                {['baidu.com', 'taobao.com', 'jd.com'].map((url) => (
                  <button
                    key={url}
                    onClick={() => {
                      setInputUrl('https://www.' + url);
                      handleLoadUrl();
                    }}
                    style={styles.quickLink}
                  >
                    {url}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={currentUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="Live View"
          />
        )}

        {isRecording && (
          <div style={styles.recording}>
            <div style={{ width: 10, height: 10, background: 'white', borderRadius: '50%' }} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>录制中</span>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div style={styles.statusBar}>
        <span>状态: {isLoading ? '加载中' : '就绪'}</span>
        <span>录制: {isRecording ? '开启' : '关闭'}</span>
      </div>
    </div>
  );
}

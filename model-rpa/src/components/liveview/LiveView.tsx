/**
 * Model-RPA Live View
 * 实时浏览器视图
 */

import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface LiveViewProps {
  onElementClick?: (element: { selector: string; text: string }) => void;
}

export function LiveView({ onElementClick }: LiveViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 加载 URL
  const handleLoadUrl = async () => {
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    try {
      // 确保 URL 有协议前缀
      let url = inputUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      setCurrentUrl(url);
      setInputUrl(url);

      // TODO: 通知后端加载 URL
      // await invoke('load_url', { url });
    } catch (error) {
      console.error('加载 URL 失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换录制模式
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: 通知后端切换录制模式
  };

  // 刷新页面
  const handleRefresh = () => {
    if (currentUrl) {
      setInputUrl(currentUrl);
      handleLoadUrl();
    }
  };

  // 返回上一页
  const handleGoBack = () => {
    // TODO: 通知后端返回上一页
  };

  // 前进
  const handleGoForward = () => {
    // TODO: 通知后端前进
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
        {/* 导航按钮 */}
        <button
          onClick={handleGoBack}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="后退"
        >
          ←
        </button>
        <button
          onClick={handleGoForward}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="前进"
        >
          →
        </button>
        <button
          onClick={handleRefresh}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="刷新"
        >
          ↻
        </button>

        {/* URL 输入框 */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
            placeholder="输入网址..."
            className="flex-1 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />
          <button
            onClick={handleLoadUrl}
            disabled={isLoading}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? '加载中...' : '前往'}
          </button>
        </div>

        {/* 录制按钮 */}
        <button
          onClick={toggleRecording}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isRecording ? '⏹️ 停止录制' : '🔴 开始录制'}
        </button>
      </div>

      {/* 浏览器视图 */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载页面...</p>
            </div>
          </div>
        )}

        {!currentUrl ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                浏览器视图
              </h3>
              <p className="text-gray-500 mb-4">
                输入网址开始浏览，或点击录制按钮录制操作
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['https://www.baidu.com', 'https://www.taobao.com', 'https://www.jd.com'].map(
                  (url) => (
                    <button
                      key={url}
                      onClick={() => {
                        setInputUrl(url);
                        handleLoadUrl();
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {new URL(url).hostname}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="Live View"
          />
        )}

        {/* 录制模式指示器 */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg shadow-lg animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="text-sm font-medium">录制中</span>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>状态: {isLoading ? '加载中' : '就绪'}</span>
          {currentUrl && <span>URL: {currentUrl}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>Chromium: 已连接</span>
          <span>录制: {isRecording ? '开启' : '关闭'}</span>
        </div>
      </div>
    </div>
  );
}

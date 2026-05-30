/**
 * Model-RPA useCleanup Hook
 * 资源清理 Hook - 防止内存泄漏
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * 资源清理 Hook
 * 在组件卸载时自动清理定时器、事件监听器等资源
 */
export function useCleanup() {
  const cleanupFns = useRef<Array<() => void>>([]);

  // 注册清理函数
  const register = useCallback((fn: () => void) => {
    cleanupFns.current.push(fn);
    return () => {
      const index = cleanupFns.current.indexOf(fn);
      if (index > -1) {
        cleanupFns.current.splice(index, 1);
      }
    };
  }, []);

  // 组件卸载时执行清理
  useEffect(() => {
    return () => {
      cleanupFns.current.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      cleanupFns.current = [];
    };
  }, []);

  return { register };
}

/**
 * 安全的 setInterval Hook
 * 组件卸载时自动清除定时器
 */
export function useSafeInterval(
  callback: () => void,
  delay: number | null
) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 保存最新的回调
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置定时器
  useEffect(() => {
    if (delay === null) {
      return;
    }

    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delay]);

  // 手动清除定时器
  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { clear };
}

/**
 * 安全的 setTimeout Hook
 * 组件卸载时自动清除定时器
 */
export function useSafeTimeout(
  callback: () => void,
  delay: number | null
) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 保存最新的回调
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置定时器
  useEffect(() => {
    if (delay === null) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [delay]);

  // 手动清除定时器
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { clear };
}

/**
 * 安全的事件监听器 Hook
 * 组件卸载时自动移除事件监听器
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window
) {
  const savedHandler = useRef(handler);

  // 保存最新的处理器
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  // 添加事件监听器
  useEffect(() => {
    const target = element || window;
    const eventHandler = (event: Event) => savedHandler.current(event as WindowEventMap[K]);

    target.addEventListener(eventName, eventHandler);

    return () => {
      target.removeEventListener(eventName, eventHandler);
    };
  }, [eventName, element]);
}

/**
 * 安全的 AbortController Hook
 * 组件卸载时自动中止请求
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  // 获取或创建 AbortController
  const getController = useCallback(() => {
    if (!controllerRef.current) {
      controllerRef.current = new AbortController();
    }
    return controllerRef.current;
  }, []);

  // 获取 signal
  const getSignal = useCallback(() => {
    return getController().signal;
  }, [getController]);

  // 中止请求
  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  // 组件卸载时中止
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return { getSignal, abort };
}

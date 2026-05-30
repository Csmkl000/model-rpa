/**
 * Model-RPA Window Management
 * 窗口管理 - 简化版本
 */

use tauri::{App, Manager, WindowEvent};
use serde::{Deserialize, Serialize};

/// 窗口状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowState {
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub is_maximized: bool,
    pub is_fullscreen: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            width: 1200,
            height: 800,
            x: 100,
            y: 100,
            is_maximized: false,
            is_fullscreen: false,
        }
    }
}

/// 初始化窗口
pub fn init_window(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let main_window = app.get_webview_window("main")
        .ok_or("Main window not found")?;

    let window_clone = main_window.clone();
    main_window.on_window_event(move |event| {
        match event {
            WindowEvent::Resized(size) => {
                log::debug!("窗口大小改变: {}x{}", size.width, size.height);
            }
            WindowEvent::Moved(position) => {
                log::debug!("窗口位置改变: ({}, {})", position.x, position.y);
            }
            WindowEvent::CloseRequested { api, .. } => {
                log::info!("窗口关闭请求");
                let _ = window_clone.hide();
                api.prevent_close();
            }
            _ => {}
        }
    });

    log::info!("窗口管理初始化完成");
    Ok(())
}

/// 加载窗口状态
#[allow(dead_code)]
pub fn load_window_state() -> WindowState {
    WindowState::default()
}

/**
 * Model-RPA Window Management
 * 窗口管理 - 完整版本
 */

use tauri::{
    App, Manager, Window, WindowEvent,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
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
    // 获取主窗口
    let main_window = app.get_webview_window("main")
        .ok_or("Main window not found")?;

    // 设置窗口事件处理
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
                // 最小化到托盘而不是关闭
                log::info!("窗口关闭请求，最小化到托盘");
                let _ = window_clone.hide();
                api.prevent_close();
            }
            _ => {}
        }
    });

    // 创建系统托盘
    create_tray(app)?;

    log::info!("窗口管理初始化完成");
    Ok(())
}

/// 创建系统托盘
fn create_tray(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Model-RPA - 下一代语义化网页自动化操作系统")
        .on_tray_icon_event(|tray, event| {
            match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    // 点击托盘图标显示主窗口
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                TrayIconEvent::DoubleClick {
                    button: MouseButton::Left,
                    ..
                } => {
                    // 双击托盘图标显示主窗口
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.unminimize();
                    }
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(())
}

/// 保存窗口状态
pub fn save_window_state(window: &Window) -> Result<(), Box<dyn std::error::Error>> {
    let size = window.outer_size()?;
    let position = window.outer_position()?;
    let is_maximized = window.is_maximized()?;
    let is_fullscreen = window.is_fullscreen()?;

    let state = WindowState {
        width: size.width,
        height: size.height,
        x: position.x,
        y: position.y,
        is_maximized,
        is_fullscreen,
    };

    // 保存到配置文件
    let config_path = get_config_path();
    let json = serde_json::to_string_pretty(&state)?;
    std::fs::write(config_path, json)?;

    log::debug!("保存窗口状态: {:?}", state);
    Ok(())
}

/// 加载窗口状态
pub fn load_window_state() -> WindowState {
    let config_path = get_config_path();

    if config_path.exists() {
        match std::fs::read_to_string(&config_path) {
            Ok(json) => {
                match serde_json::from_str::<WindowState>(&json) {
                    Ok(state) => {
                        log::debug!("加载窗口状态: {:?}", state);
                        return state;
                    }
                    Err(e) => {
                        log::warn!("解析窗口状态失败: {}", e);
                    }
                }
            }
            Err(e) => {
                log::warn!("读取窗口状态失败: {}", e);
            }
        }
    }

    WindowState::default()
}

/// 获取配置文件路径
fn get_config_path() -> std::path::PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."));
    let app_config_dir = config_dir.join("Model-RPA");

    if !app_config_dir.exists() {
        std::fs::create_dir_all(&app_config_dir).ok();
    }

    app_config_dir.join("window-state.json")
}

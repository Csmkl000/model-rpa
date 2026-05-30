/**
 * Model-RPA Tauri Commands
 * 前端调用的后端命令
 */

use serde::{Deserialize, Serialize};
use tauri::Manager;

use crate::db::DatabaseState;
use crate::vault::VaultManager;
use crate::window::WindowState;

/// 工作流结构
#[derive(Debug, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub description: String,
    pub nodes: Vec<serde_json::Value>,
    pub edges: Vec<serde_json::Value>,
    pub created_at: String,
    pub updated_at: String,
}

/// 凭证结构
#[derive(Debug, Serialize, Deserialize)]
pub struct Credential {
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_at: String,
    pub updated_at: String,
}

/// 浏览器身份结构
#[derive(Debug, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub user_data_dir: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// 系统信息
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub app_version: String,
    pub os: String,
    pub arch: String,
    pub chromium_installed: bool,
    pub chromium_version: Option<String>,
}

// ==================== 窗口管理命令 ====================

/// 打开设置窗口
#[tauri::command]
pub fn open_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    // 检查设置窗口是否已存在
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }

    // 创建设置窗口
    let _window = tauri::WebviewWindowBuilder::new(
        &app,
        "settings",
        tauri::WebviewUrl::App("/settings".into()),
    )
    .title("设置 - Model-RPA")
    .inner_size(800.0, 600.0)
    .min_inner_size(600.0, 400.0)
    .center()
    .resizable(true)
    .build()
    .map_err(|e| format!("创建设置窗口失败: {}", e))?;

    log::info!("打开设置窗口");
    Ok(())
}

/// 关闭设置窗口
#[tauri::command]
pub fn close_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("settings") {
        window.close().map_err(|e| format!("关闭设置窗口失败: {}", e))?;
    }
    Ok(())
}

/// 切换开发者工具
#[tauri::command]
pub fn toggle_devtools(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.open_devtools();
    }
    Ok(())
}

/// 获取窗口状态
#[tauri::command]
pub fn get_window_state() -> Result<WindowState, String> {
    Ok(crate::window::load_window_state())
}

/// 保存窗口状态
#[tauri::command]
pub fn set_window_state(state: WindowState) -> Result<(), String> {
    // 保存状态到配置文件
    let config_path = dirs::config_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("Model-RPA")
        .join("window-state.json");

    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("序列化失败: {}", e))?;

    std::fs::write(config_path, json)
        .map_err(|e| format!("写入失败: {}", e))?;

    Ok(())
}

// ==================== 工作流命令 ====================

/// 打招呼
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("你好，{}！欢迎使用 Model-RPA 🚀", name)
}

/// 获取应用版本
#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// 获取工作流列表
#[tauri::command]
pub fn get_workflows(app: tauri::AppHandle) -> Result<Vec<Workflow>, String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, name, description, nodes_json, edges_json, created_at, updated_at FROM workflows ORDER BY updated_at DESC")
        .map_err(|e| format!("准备查询失败: {}", e))?;

    let workflows = stmt
        .query_map([], |row| {
            Ok(Workflow {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                nodes_json: row.get::<_, String>(3)?,
                edges_json: row.get::<_, String>(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| format!("查询失败: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(workflows)
}

/// 保存工作流
#[tauri::command]
pub fn save_workflow(app: tauri::AppHandle, workflow: Workflow) -> Result<(), String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let nodes_json = serde_json::to_string(&workflow.nodes)
        .map_err(|e| format!("序列化 nodes 失败: {}", e))?;
    let edges_json = serde_json::to_string(&workflow.edges)
        .map_err(|e| format!("序列化 edges 失败: {}", e))?;

    conn.execute(
        "INSERT OR REPLACE INTO workflows (id, name, description, nodes_json, edges_json, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            workflow.id,
            workflow.name,
            workflow.description,
            nodes_json,
            edges_json,
            workflow.created_at,
            workflow.updated_at,
        ],
    )
    .map_err(|e| format!("保存工作流失败: {}", e))?;

    log::info!("保存工作流: {} ({})", workflow.name, workflow.id);
    Ok(())
}

/// 删除工作流
#[tauri::command]
pub fn delete_workflow(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    conn.execute("DELETE FROM workflows WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("删除工作流失败: {}", e))?;

    log::info!("删除工作流: {}", id);
    Ok(())
}

// ==================== 凭证管理命令 ====================

/// 存储凭证
#[tauri::command]
pub fn store_credential(
    app: tauri::AppHandle,
    id: String,
    name: String,
    value: String,
    description: String,
) -> Result<(), String> {
    let vault = VaultManager::new();
    vault.store_credential(&id, &name, &value)?;

    // 保存到数据库
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let now = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT OR REPLACE INTO credentials (id, name, description, vault_key, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, name, description, id, now, now],
    )
    .map_err(|e| format!("保存凭证元数据失败: {}", e))?;

    log::info!("存储凭证: {} ({})", name, id);
    Ok(())
}

/// 获取凭证
#[tauri::command]
pub fn get_credential(id: String) -> Result<String, String> {
    let vault = VaultManager::new();
    vault.get_credential(&id)
}

/// 删除凭证
#[tauri::command]
pub fn delete_credential(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let vault = VaultManager::new();
    vault.delete_credential(&id)?;

    // 从数据库删除
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    conn.execute("DELETE FROM credentials WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("删除凭证元数据失败: {}", e))?;

    log::info!("删除凭证: {}", id);
    Ok(())
}

/// 列出所有凭证
#[tauri::command]
pub fn list_credentials(app: tauri::AppHandle) -> Result<Vec<Credential>, String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, name, description, created_at, updated_at FROM credentials ORDER BY name")
        .map_err(|e| format!("准备查询失败: {}", e))?;

    let credentials = stmt
        .query_map([], |row| {
            Ok(Credential {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| format!("查询失败: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(credentials)
}

// ==================== 身份管理命令 ====================

/// 创建浏览器身份
#[tauri::command]
pub fn create_profile(
    app: tauri::AppHandle,
    name: String,
    description: String,
) -> Result<Profile, String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Local::now().to_rfc3339();

    // 创建用户数据目录
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("获取应用数据目录失败: {}", e))?;
    let user_data_dir = app_data_dir.join("profiles").join(&id);

    std::fs::create_dir_all(&user_data_dir)
        .map_err(|e| format!("创建用户数据目录失败: {}", e))?;

    let profile = Profile {
        id: id.clone(),
        name: name.clone(),
        description: description.clone(),
        user_data_dir: user_data_dir.to_string_lossy().to_string(),
        is_active: false,
        created_at: now.clone(),
        updated_at: now,
    };

    conn.execute(
        "INSERT INTO profiles (id, name, description, user_data_dir, is_active, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            profile.id,
            profile.name,
            profile.description,
            profile.user_data_dir,
            profile.is_active,
            profile.created_at,
            profile.updated_at,
        ],
    )
    .map_err(|e| format!("保存身份失败: {}", e))?;

    log::info!("创建浏览器身份: {} ({})", name, id);
    Ok(profile)
}

/// 获取所有身份
#[tauri::command]
pub fn get_profiles(app: tauri::AppHandle) -> Result<Vec<Profile>, String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, name, description, user_data_dir, is_active, created_at, updated_at FROM profiles ORDER BY name")
        .map_err(|e| format!("准备查询失败: {}", e))?;

    let profiles = stmt
        .query_map([], |row| {
            Ok(Profile {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                user_data_dir: row.get(3)?,
                is_active: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| format!("查询失败: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(profiles)
}

/// 获取当前活跃身份
#[tauri::command]
pub fn get_active_profile(app: tauri::AppHandle) -> Result<Option<Profile>, String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, name, description, user_data_dir, is_active, created_at, updated_at FROM profiles WHERE is_active = TRUE LIMIT 1")
        .map_err(|e| format!("准备查询失败: {}", e))?;

    let mut profiles = stmt
        .query_map([], |row| {
            Ok(Profile {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                user_data_dir: row.get(3)?,
                is_active: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| format!("查询失败: {}", e))?;

    match profiles.next() {
        Some(Ok(profile)) => Ok(Some(profile)),
        Some(Err(e)) => Err(format!("查询失败: {}", e)),
        None => Ok(None),
    }
}

/// 设置活跃身份
#[tauri::command]
pub fn set_active_profile(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    // 先取消所有活跃状态
    conn.execute("UPDATE profiles SET is_active = FALSE", [])
        .map_err(|e| format!("更新失败: {}", e))?;

    // 设置指定身份为活跃
    conn.execute(
        "UPDATE profiles SET is_active = TRUE, updated_at = ?1 WHERE id = ?2",
        rusqlite::params![chrono::Local::now().to_rfc3339(), id],
    )
    .map_err(|e| format!("更新失败: {}", e))?;

    log::info!("设置活跃身份: {}", id);
    Ok(())
}

/// 删除身份
#[tauri::command]
pub fn delete_profile(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    // 获取身份信息
    let user_data_dir: String = conn
        .query_row(
            "SELECT user_data_dir FROM profiles WHERE id = ?1",
            rusqlite::params![id],
            |row| row.get(0),
        )
        .map_err(|e| format!("查询身份失败: {}", e))?;

    // 删除身份记录
    conn.execute("DELETE FROM profiles WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("删除身份失败: {}", e))?;

    // 删除用户数据目录
    let user_data_path = std::path::PathBuf::from(&user_data_dir);
    if user_data_path.exists() {
        std::fs::remove_dir_all(&user_data_path)
            .map_err(|e| format!("删除用户数据目录失败: {}", e))?;
    }

    log::info!("删除身份: {} ({})", id, user_data_dir);
    Ok(())
}

// ==================== 系统信息命令 ====================

/// 获取系统信息
#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        chromium_installed: false, // TODO: 检查 Chromium
        chromium_version: None,
    })
}

/// 获取 Chromium 信息
#[tauri::command]
pub fn get_chromium_info() -> Result<serde_json::Value, String> {
    // TODO: 实现 Chromium 信息获取
    Ok(serde_json::json!({
        "installed": false,
        "version": null,
        "path": null,
    }))
}

// ==================== 定时任务命令 ====================

/// 定时任务配置
#[derive(Debug, Serialize, Deserialize)]
pub struct ScheduledTask {
    pub id: String,
    pub workflow_id: String,
    pub name: String,
    pub description: String,
    pub cron_expression: String,
    pub is_enabled: bool,
    pub headless: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// 定时任务状态
#[derive(Debug, Serialize, Deserialize)]
pub struct TaskStatus {
    pub id: String,
    pub workflow_id: String,
    pub is_running: bool,
    pub last_run_at: Option<String>,
    pub next_run_at: Option<String>,
    pub run_count: u64,
    pub error_count: u64,
    pub last_error: Option<String>,
}

/// 创建定时任务
#[tauri::command]
pub fn create_scheduled_task(
    app: tauri::AppHandle,
    workflow_id: String,
    name: String,
    description: String,
    cron_expression: String,
    headless: bool,
) -> Result<ScheduledTask, String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Local::now().to_rfc3339();

    let task = ScheduledTask {
        id: id.clone(),
        workflow_id,
        name,
        description,
        cron_expression,
        is_enabled: true,
        headless,
        created_at: now.clone(),
        updated_at: now,
    };

    conn.execute(
        "INSERT INTO scheduled_tasks (id, workflow_id, cron_expression, is_enabled, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            task.id,
            task.workflow_id,
            task.cron_expression,
            task.is_enabled,
            task.created_at,
            task.updated_at,
        ],
    )
    .map_err(|e| format!("保存定时任务失败: {}", e))?;

    log::info!("创建定时任务: {} ({})", name, id);
    Ok(task)
}

/// 获取所有定时任务
#[tauri::command]
pub fn get_scheduled_tasks(app: tauri::AppHandle) -> Result<Vec<ScheduledTask>, String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, workflow_id, cron_expression, is_enabled, last_run_at, next_run_at, created_at, updated_at FROM scheduled_tasks ORDER BY created_at DESC")
        .map_err(|e| format!("准备查询失败: {}", e))?;

    let tasks = stmt
        .query_map([], |row| {
            Ok(ScheduledTask {
                id: row.get(0)?,
                workflow_id: row.get(1)?,
                name: String::new(), // TODO: 从数据库获取
                description: String::new(),
                cron_expression: row.get(2)?,
                is_enabled: row.get(3)?,
                headless: true,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| format!("查询失败: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tasks)
}

/// 删除定时任务
#[tauri::command]
pub fn delete_scheduled_task(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    conn.execute("DELETE FROM scheduled_tasks WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("删除定时任务失败: {}", e))?;

    log::info!("删除定时任务: {}", id);
    Ok(())
}

/// 启用/禁用定时任务
#[tauri::command]
pub fn toggle_scheduled_task(
    app: tauri::AppHandle,
    id: String,
    enabled: bool,
) -> Result<(), String> {
    let state = app.state::<DatabaseState>();
    let conn = rusqlite::Connection::open(&state.path)
        .map_err(|e| format!("打开数据库失败: {}", e))?;

    conn.execute(
        "UPDATE scheduled_tasks SET is_enabled = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![enabled, chrono::Local::now().to_rfc3339(), id],
    )
    .map_err(|e| format!("更新定时任务失败: {}", e))?;

    log::info!("{}定时任务: {}", if enabled { "启用" } else { "禁用" }, id);
    Ok(())
}

// ==================== 日志命令 ====================

/// 截取屏幕快照
#[tauri::command]
pub fn capture_screenshot(
    quality: u8,
    max_width: u32,
    max_height: u32,
    format: String,
) -> Result<String, String> {
    // TODO: 实现屏幕截图
    // 返回 Base64 编码的图片
    Ok("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD".to_string())
}

/// 记录日志消息
#[tauri::command]
pub fn log_message(
    level: String,
    category: String,
    message: String,
    meta: Option<serde_json::Value>,
) -> Result<(), String> {
    let level = crate::logger::LogLevel::from_str(&level);
    let category = crate::logger::LogCategory::from_str(&category);

    // 根据级别输出到控制台
    match level {
        crate::logger::LogLevel::Trace | crate::logger::LogLevel::Debug => {
            log::debug!("[{}] {}", category.as_str(), message);
        }
        crate::logger::LogLevel::Info => {
            log::info!("[{}] {}", category.as_str(), message);
        }
        crate::logger::LogLevel::Warn => {
            log::warn!("[{}] {}", category.as_str(), message);
        }
        crate::logger::LogLevel::Error | crate::logger::LogLevel::Fatal => {
            log::error!("[{}] {}", category.as_str(), message);
        }
    }

    Ok(())
}

/// 获取日志统计
#[tauri::command]
pub async fn get_log_stats(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    // TODO: 实现日志统计
    Ok(serde_json::json!({
        "total_entries": 0,
        "error_count": 0,
        "file_count": 0,
    }))
}

/// 清理旧日志
#[tauri::command]
pub async fn cleanup_old_logs(app: tauri::AppHandle) -> Result<usize, String> {
    // TODO: 实现日志清理
    Ok(0)
}

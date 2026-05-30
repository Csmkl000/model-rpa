mod commands;
mod db;
mod vault;
mod scheduler;
mod window;
mod process;
mod logger;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_stronghold::init())
        .setup(|app| {
            // 初始化日志
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // 初始化数据库
            let app_handle = app.handle().clone();
            let db_path = app_handle
                .path()
                .app_data_dir()
                .expect("failed to get app data dir")
                .join("model-rpa.db");

            // 确保目录存在
            if let Some(parent) = db_path.parent() {
                std::fs::create_dir_all(parent).expect("failed to create app data dir");
            }

            // 初始化数据库
            db::init_database(&db_path).expect("failed to initialize database");

            // 存储数据库路径
            app.manage(db::DatabaseState {
                path: db_path,
            });

            // 初始化进程管理器
            let mut process_manager = process::ProcessManager::new();
            process_manager.initialize().expect("failed to initialize process manager");
            app.manage(process_manager);

            // 初始化窗口管理
            window::init_window(app)?;

            log::info!("Model-RPA 初始化完成");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 窗口管理命令
            commands::open_settings_window,
            commands::close_settings_window,
            commands::toggle_devtools,
            commands::get_window_state,
            commands::set_window_state,
            // 工作流命令
            commands::greet,
            commands::get_app_version,
            commands::get_workflows,
            commands::save_workflow,
            commands::delete_workflow,
            // 凭证管理命令
            commands::store_credential,
            commands::get_credential,
            commands::delete_credential,
            commands::list_credentials,
            // 身份管理命令
            commands::create_profile,
            commands::get_profiles,
            commands::get_active_profile,
            commands::set_active_profile,
            commands::delete_profile,
            // 定时任务命令
            commands::create_scheduled_task,
            commands::get_scheduled_tasks,
            commands::delete_scheduled_task,
            commands::toggle_scheduled_task,
            // 系统信息命令
            commands::get_system_info,
            commands::get_chromium_info,
            // 日志命令
            commands::capture_screenshot,
            commands::log_message,
            commands::get_log_stats,
            commands::cleanup_old_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

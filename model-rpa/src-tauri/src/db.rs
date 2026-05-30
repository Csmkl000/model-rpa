/**
 * Model-RPA Database
 * SQLite 数据库管理
 */

use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub struct DatabaseState {
    pub path: PathBuf,
}

pub fn init_database(db_path: &PathBuf) -> Result<()> {
    let conn = Connection::open(db_path)?;

    // 创建工作流表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            nodes_json TEXT NOT NULL,
            edges_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // 创建执行日志表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS execution_logs (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT NOT NULL,
            finished_at TEXT,
            error_message TEXT,
            screenshots_json TEXT,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id)
        )",
        [],
    )?;

    // 创建凭证表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS credentials (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            vault_key TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // 创建浏览器身份表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            user_data_dir TEXT NOT NULL,
            is_active BOOLEAN DEFAULT FALSE,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // 创建定时任务表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS scheduled_tasks (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            cron_expression TEXT NOT NULL,
            is_enabled BOOLEAN DEFAULT TRUE,
            last_run_at TEXT,
            next_run_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id)
        )",
        [],
    )?;

    // 创建缓存表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS action_cache (
            id TEXT PRIMARY KEY,
            action_hash TEXT NOT NULL,
            selector_json TEXT NOT NULL,
            success_count INTEGER DEFAULT 0,
            fail_count INTEGER DEFAULT 0,
            last_used_at TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(action_hash)
        )",
        [],
    )?;

    log::info!("数据库初始化完成: {:?}", db_path);
    Ok(())
}

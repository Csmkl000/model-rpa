/**
 * Model-RPA Logger
 * 日志系统 - 结构化日志流转 + 日志防爆盘
 */

use std::fs::{self, File, OpenOptions};
use std::io::{BufWriter, Write};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Local, Duration};

/// 日志级别
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
}

impl LogLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Trace => "TRACE",
            LogLevel::Debug => "DEBUG",
            LogLevel::Info => "INFO",
            LogLevel::Warn => "WARN",
            LogLevel::Error => "ERROR",
            LogLevel::Fatal => "FATAL",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_uppercase().as_str() {
            "TRACE" => LogLevel::Trace,
            "DEBUG" => LogLevel::Debug,
            "INFO" => LogLevel::Info,
            "WARN" => LogLevel::Warn,
            "ERROR" => LogLevel::Error,
            "FATAL" => LogLevel::Fatal,
            _ => LogLevel::Info,
        }
    }
}

/// 日志类别
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum LogCategory {
    System,
    Action,
    Extract,
    Loop,
    Agent,
    Cache,
    Network,
    UI,
}

impl LogCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            LogCategory::System => "system",
            LogCategory::Action => "action",
            LogCategory::Extract => "extract",
            LogCategory::Loop => "loop",
            LogCategory::Agent => "agent",
            LogCategory::Cache => "cache",
            LogCategory::Network => "network",
            LogCategory::UI => "ui",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "system" => LogCategory::System,
            "action" => LogCategory::Action,
            "extract" => LogCategory::Extract,
            "loop" => LogCategory::Loop,
            "agent" => LogCategory::Agent,
            "cache" => LogCategory::Cache,
            "network" => LogCategory::Network,
            "ui" => LogCategory::UI,
            _ => LogCategory::System,
        }
    }
}

/// 日志条目
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: LogLevel,
    pub category: LogCategory,
    pub message: String,
    pub node_id: Option<String>,
    pub workflow_id: Option<String>,
    pub duration: Option<u64>,
    pub cached: Option<bool>,
    pub meta: Option<serde_json::Value>,
}

/// 日志配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogConfig {
    pub min_level: LogLevel,
    pub enable_file: bool,
    pub enable_database: bool,
    pub log_dir: PathBuf,
    pub max_file_size: u64,      // 字节
    pub max_file_count: usize,
    pub retention_days: u32,
    pub max_entries: usize,
}

impl Default for LogConfig {
    fn default() -> Self {
        Self {
            min_level: LogLevel::Info,
            enable_file: true,
            enable_database: true,
            log_dir: PathBuf::from("logs"),
            max_file_size: 10 * 1024 * 1024, // 10MB
            max_file_count: 10,
            retention_days: 7,
            max_entries: 100000,
        }
    }
}

/// 日志管理器
pub struct LogManager {
    config: LogConfig,
    file_writer: Arc<Mutex<Option<BufWriter<File>>>>,
    db_path: PathBuf,
}

impl LogManager {
    /// 创建新的日志管理器
    pub fn new(config: LogConfig, db_path: PathBuf) -> Self {
        Self {
            config,
            file_writer: Arc::new(Mutex::new(None)),
            db_path,
        }
    }

    /// 初始化日志管理器
    pub async fn initialize(&self) -> Result<(), String> {
        // 创建日志目录
        if !self.config.log_dir.exists() {
            fs::create_dir_all(&self.config.log_dir)
                .map_err(|e| format!("创建日志目录失败: {}", e))?;
        }

        // 初始化文件写入器
        if self.config.enable_file {
            let log_file = self.get_log_file_path();
            let file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&log_file)
                .map_err(|e| format!("打开日志文件失败: {}", e))?;

            let mut writer = self.file_writer.lock().await;
            *writer = Some(BufWriter::new(file));
        }

        // 初始化数据库表
        if self.config.enable_database {
            self.init_database_table().await?;
        }

        log::info!("日志管理器初始化完成");
        Ok(())
    }

    /// 记录日志
    pub async fn log(&self, entry: LogEntry) -> Result<(), String> {
        // 检查日志级别
        if entry.level < self.config.min_level {
            return Ok(());
        }

        // 写入文件
        if self.config.enable_file {
            self.write_to_file(&entry).await?;
        }

        // 写入数据库
        if self.config.enable_database {
            self.write_to_database(&entry).await?;
        }

        Ok(())
    }

    /// 写入文件
    async fn write_to_file(&self, entry: &LogEntry) -> Result<(), String> {
        let mut writer = self.file_writer.lock().await;

        if let Some(ref mut w) = *writer {
            let json = serde_json::to_string(entry)
                .map_err(|e| format!("序列化日志失败: {}", e))?;

            writeln!(w, "{}", json)
                .map_err(|e| format!("写入日志失败: {}", e))?;

            w.flush()
                .map_err(|e| format!("刷新日志缓冲区失败: {}", e))?;
        }

        Ok(())
    }

    /// 写入数据库
    async fn write_to_database(&self, entry: &LogEntry) -> Result<(), String> {
        let conn = rusqlite::Connection::open(&self.db_path)
            .map_err(|e| format!("打开数据库失败: {}", e))?;

        let meta_json = entry.meta.as_ref()
            .map(|m| serde_json::to_string(m).unwrap_or_default());

        conn.execute(
            "INSERT INTO execution_logs (id, workflow_id, status, started_at, finished_at, error_message, screenshots_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                uuid::Uuid::new_v4().to_string(),
                entry.workflow_id.as_deref().unwrap_or(""),
                entry.level.as_str(),
                entry.timestamp,
                "",
                entry.message,
                meta_json,
            ],
        )
        .map_err(|e| format!("写入数据库失败: {}", e))?;

        Ok(())
    }

    /// 获取日志文件路径
    fn get_log_file_path(&self) -> PathBuf {
        let now = Local::now();
        let date_str = now.format("%Y-%m-%d").to_string();
        let filename = format!("model-rpa-{}.log", date_str);
        self.config.log_dir.join(filename)
    }

    /// 初始化数据库表
    async fn init_database_table(&self) -> Result<(), String> {
        let conn = rusqlite::Connection::open(&self.db_path)
            .map_err(|e| format!("打开数据库失败: {}", e))?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS log_entries (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                level TEXT NOT NULL,
                category TEXT NOT NULL,
                message TEXT NOT NULL,
                node_id TEXT,
                workflow_id TEXT,
                duration INTEGER,
                cached BOOLEAN,
                meta_json TEXT
            )",
            [],
        )
        .map_err(|e| format!("创建日志表失败: {}", e))?;

        // 创建索引
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_log_timestamp ON log_entries(timestamp)",
            [],
        )
        .map_err(|e| format!("创建索引失败: {}", e))?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_log_level ON log_entries(level)",
            [],
        )
        .map_err(|e| format!("创建索引失败: {}", e))?;

        Ok(())
    }

    /// 清理旧日志（日志防爆盘）
    pub async fn cleanup_old_logs(&self) -> Result<usize, String> {
        let mut deleted_count = 0;

        // 清理旧日志文件
        if self.config.enable_file {
            deleted_count += self.cleanup_old_files().await?;
        }

        // 清理旧数据库记录
        if self.config.enable_database {
            deleted_count += self.cleanup_old_database_entries().await?;
        }

        log::info!("清理了 {} 条旧日志", deleted_count);
        Ok(deleted_count)
    }

    /// 清理旧日志文件
    async fn cleanup_old_files(&self) -> Result<usize, String> {
        let mut deleted_count = 0;
        let retention_days = self.config.retention_days as i64;
        let cutoff_date = Local::now() - Duration::days(retention_days);

        if let Ok(entries) = fs::read_dir(&self.config.log_dir) {
            for entry in entries.flatten() {
                let path = entry.path();

                if path.extension().map_or(false, |ext| ext == "log") {
                    // 检查文件修改时间
                    if let Ok(metadata) = fs::metadata(&path) {
                        if let Ok(modified) = metadata.modified() {
                            let modified_time: DateTime<Local> = modified.into();

                            if modified_time < cutoff_date {
                                if fs::remove_file(&path).is_ok() {
                                    deleted_count += 1;
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(deleted_count)
    }

    /// 清理旧数据库记录
    async fn cleanup_old_database_entries(&self) -> Result<usize, String> {
        let conn = rusqlite::Connection::open(&self.db_path)
            .map_err(|e| format!("打开数据库失败: {}", e))?;

        let retention_days = self.config.retention_days as i64;
        let cutoff_date = Local::now() - Duration::days(retention_days);
        let cutoff_str = cutoff_date.to_rfc3339();

        let deleted = conn.execute(
            "DELETE FROM log_entries WHERE timestamp < ?1",
            rusqlite::params![cutoff_str],
        )
        .map_err(|e| format!("删除旧日志失败: {}", e))?;

        Ok(deleted)
    }

    /// 获取日志统计
    pub async fn get_stats(&self) -> Result<LogStats, String> {
        let conn = rusqlite::Connection::open(&self.db_path)
            .map_err(|e| format!("打开数据库失败: {}", e))?;

        let total: i64 = conn
            .query_row("SELECT COUNT(*) FROM log_entries", [], |row| row.get(0))
            .map_err(|e| format!("查询失败: {}", e))?;

        let error_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM log_entries WHERE level IN ('ERROR', 'FATAL')",
                [],
                |row| row.get(0),
            )
            .map_err(|e| format!("查询失败: {}", e))?;

        Ok(LogStats {
            total_entries: total as usize,
            error_count: error_count as usize,
            file_count: self.count_log_files(),
        })
    }

    /// 统计日志文件数量
    fn count_log_files(&self) -> usize {
        if let Ok(entries) = fs::read_dir(&self.config.log_dir) {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| e.path().extension().map_or(false, |ext| ext == "log"))
                .count()
        } else {
            0
        }
    }
}

/// 日志统计
#[derive(Debug, Serialize, Deserialize)]
pub struct LogStats {
    pub total_entries: usize,
    pub error_count: usize,
    pub file_count: usize,
}

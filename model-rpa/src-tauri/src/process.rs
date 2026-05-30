/**
 * Model-RPA Process Manager
 * 进程管理 - 简化版本
 */

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};

/// 进程信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub command: String,
    pub started_at: String,
    pub is_running: bool,
}

/// 进程管理器
pub struct ProcessManager {
    processes: Arc<Mutex<HashMap<u32, ProcessInfo>>>,
}

impl ProcessManager {
    /// 创建新的进程管理器
    pub fn new() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// 初始化进程管理器
    pub fn initialize(&mut self) -> Result<(), String> {
        log::info!("进程管理器初始化完成");
        Ok(())
    }

    /// 注册进程
    pub async fn register_process(&self, pid: u32, name: String, command: String) {
        let mut processes = self.processes.lock().await;
        processes.insert(
            pid,
            ProcessInfo {
                pid,
                name,
                command,
                started_at: chrono::Local::now().to_rfc3339(),
                is_running: true,
            },
        );
    }

    /// 注销进程
    pub async fn unregister_process(&self, pid: u32) {
        let mut processes = self.processes.lock().await;
        processes.remove(&pid);
    }

    /// 获取所有进程
    pub async fn get_processes(&self) -> Vec<ProcessInfo> {
        let processes = self.processes.lock().await;
        processes.values().cloned().collect()
    }

    /// 终止所有进程
    pub async fn kill_all(&self) -> Result<(), String> {
        let mut processes = self.processes.lock().await;
        for (_, info) in processes.iter_mut() {
            info.is_running = false;
        }
        log::info!("终止所有进程");
        Ok(())
    }
}

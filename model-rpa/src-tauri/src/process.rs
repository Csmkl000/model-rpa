/**
 * Model-RPA Process Manager
 * 进程管理 - 支持 Windows 和 Unix
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

    /// 检查进程是否存活
    pub fn check_process_alive(pid: u32) -> bool {
        #[cfg(target_os = "windows")]
        {
            Self::check_process_alive_windows(pid)
        }

        #[cfg(not(target_os = "windows"))]
        {
            Self::check_process_alive_unix(pid)
        }
    }

    /// 终止进程
    pub fn kill_process(pid: u32) -> bool {
        #[cfg(target_os = "windows")]
        {
            Self::kill_process_windows(pid)
        }

        #[cfg(not(target_os = "windows"))]
        {
            Self::kill_process_unix(pid)
        }
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

    // ==================== Windows 实现 ====================

    #[cfg(target_os = "windows")]
    fn check_process_alive_windows(pid: u32) -> bool {
        use windows::Win32::System::Threading::*;
        use windows::Win32::Foundation::CloseHandle;

        unsafe {
            let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);
            match handle {
                Ok(handle) => {
                    let mut exit_code = 0u32;
                    let result = GetExitCodeProcess(handle, &mut exit_code);
                    let _ = CloseHandle(handle);
                    result.is_ok() && exit_code == 259 // STILL_ACTIVE
                }
                Err(_) => false,
            }
        }
    }

    #[cfg(target_os = "windows")]
    fn kill_process_windows(pid: u32) -> bool {
        use windows::Win32::System::Threading::*;
        use windows::Win32::Foundation::CloseHandle;

        unsafe {
            let handle = OpenProcess(PROCESS_TERMINATE, false, pid);
            match handle {
                Ok(handle) => {
                    let result = TerminateProcess(handle, 1);
                    let _ = CloseHandle(handle);
                    result.is_ok()
                }
                Err(_) => false,
            }
        }
    }

    // ==================== Unix 实现 ====================

    #[cfg(not(target_os = "windows"))]
    fn check_process_alive_unix(pid: u32) -> bool {
        use std::process::Command;

        let output = Command::new("kill")
            .args(["-0", &pid.to_string()])
            .output();

        match output {
            Ok(output) => output.status.success(),
            Err(_) => false,
        }
    }

    #[cfg(not(target_os = "windows"))]
    fn kill_process_unix(pid: u32) -> bool {
        use std::process::Command;

        let output = Command::new("kill")
            .args(["-9", &pid.to_string()])
            .output();

        match output {
            Ok(output) => output.status.success(),
            Err(_) => false,
        }
    }
}

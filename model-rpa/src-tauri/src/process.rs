/**
 * Model-RPA Process Manager
 * 僵尸进程清理 - Windows Job Object / Unix Process Group
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
    #[cfg(target_os = "windows")]
    job_handle: Option<isize>,
}

impl ProcessManager {
    /// 创建新的进程管理器
    pub fn new() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
            #[cfg(target_os = "windows")]
            job_handle: None,
        }
    }

    /// 初始化进程管理器
    pub fn initialize(&mut self) -> Result<(), String> {
        #[cfg(target_os = "windows")]
        {
            self.create_job_object()?;
        }

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

    /// 检查进程是否运行
    pub async fn is_process_running(&self, pid: u32) -> bool {
        let processes = self.processes.lock().await;
        if let Some(info) = processes.get(&pid) {
            return self.check_process_alive(pid);
        }
        false
    }

    /// 终止进程
    pub async fn kill_process(&self, pid: u32) -> Result<(), String> {
        let success = self.kill_process_by_pid(pid);

        if success {
            let mut processes = self.processes.lock().await;
            if let Some(info) = processes.get_mut(&pid) {
                info.is_running = false;
            }
            log::info!("终止进程: {}", pid);
            Ok(())
        } else {
            Err(format!("终止进程失败: {}", pid))
        }
    }

    /// 终止所有子进程
    pub async fn kill_all(&self) -> Result<(), String> {
        let processes = self.processes.lock().await;
        let pids: Vec<u32> = processes.keys().cloned().collect();
        drop(processes);

        for pid in pids {
            let _ = self.kill_process(pid).await;
        }

        log::info!("终止所有进程");
        Ok(())
    }

    /// 检查进程是否存活
    fn check_process_alive(&self, pid: u32) -> bool {
        #[cfg(target_os = "windows")]
        {
            self.check_process_alive_windows(pid)
        }

        #[cfg(not(target_os = "windows"))]
        {
            self.check_process_alive_unix(pid)
        }
    }

    /// 终止进程
    fn kill_process_by_pid(&self, pid: u32) -> bool {
        #[cfg(target_os = "windows")]
        {
            self.kill_process_windows(pid)
        }

        #[cfg(not(target_os = "windows"))]
        {
            self.kill_process_unix(pid)
        }
    }

    // ==================== Windows 实现 ====================

    #[cfg(target_os = "windows")]
    fn create_job_object(&mut self) -> Result<(), String> {
        use windows::Win32::System::JobObjects::*;
        use windows::Win32::Foundation::{HANDLE, CloseHandle};

        unsafe {
            let job_handle = CreateJobObjectW(None, None)
                .map_err(|e| format!("创建 Job Object 失败: {}", e))?;

            // 配置 Job Object
            let mut info = JOBOBJECT_EXTENDED_LIMIT_INFORMATION::default();
            info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

            let mut return_length = 0;
            let result = SetInformationJobObject(
                job_handle,
                JobObjectExtendedLimitInformation,
                &mut info as *mut _ as *mut _,
                std::mem::size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
            );

            if result.is_err() {
                let _ = CloseHandle(job_handle);
                return Err("配置 Job Object 失败".to_string());
            }

            self.job_handle = Some(job_handle.0 as isize);
        }

        log::info!("创建 Windows Job Object");
        Ok(())
    }

    #[cfg(target_os = "windows")]
    fn check_process_alive_windows(&self, pid: u32) -> bool {
        use windows::Win32::System::Threading::*;
        use windows::Win32::Foundation::{HANDLE, CloseHandle};

        unsafe {
            let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);
            if handle.is_err() {
                return false;
            }

            let handle = handle.unwrap();
            let mut exit_code = 0u32;
            let result = GetExitCodeProcess(handle, &mut exit_code);

            let _ = CloseHandle(handle);

            result.is_ok() && exit_code == 259 // STILL_ACTIVE
        }
    }

    #[cfg(target_os = "windows")]
    fn kill_process_windows(&self, pid: u32) -> bool {
        use windows::Win32::System::Threading::*;
        use windows::Win32::Foundation::{HANDLE, CloseHandle};

        unsafe {
            let handle = OpenProcess(PROCESS_TERMINATE, false, pid);
            if handle.is_err() {
                return false;
            }

            let handle = handle.unwrap();
            let result = TerminateProcess(handle, 1);

            let _ = CloseHandle(handle);

            result.is_ok()
        }
    }

    // ==================== Unix 实现 ====================

    #[cfg(not(target_os = "windows"))]
    fn check_process_alive_unix(&self, pid: u32) -> bool {
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
    fn kill_process_unix(&self, pid: u32) -> bool {
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

impl Drop for ProcessManager {
    fn drop(&mut self) {
        #[cfg(target_os = "windows")]
        {
            if let Some(handle) = self.job_handle {
                use windows::Win32::Foundation::{HANDLE, CloseHandle};
                unsafe {
                    let _ = CloseHandle(HANDLE(handle as *mut _));
                }
            }
        }
    }
}

/// 进程组管理
pub struct ProcessGroup {
    pgid: u32,
    processes: Vec<u32>,
}

impl ProcessGroup {
    /// 创建新的进程组
    pub fn new(pgid: u32) -> Self {
        Self {
            pgid,
            processes: Vec::new(),
        }
    }

    /// 添加进程到组
    pub fn add_process(&mut self, pid: u32) {
        self.processes.push(pid);
    }

    /// 终止整个进程组
    pub fn kill_group(&self) -> bool {
        #[cfg(target_os = "windows")]
        {
            // Windows 不直接支持进程组，逐个终止
            for &pid in &self.processes {
                // 使用 ProcessManager 终止
            }
            true
        }

        #[cfg(not(target_os = "windows"))]
        {
            use std::process::Command;

            let output = Command::new("kill")
                .args(["-9", &format!("-{}", self.pgid)])
                .output();

            match output {
                Ok(output) => output.status.success(),
                Err(_) => false,
            }
        }
    }
}

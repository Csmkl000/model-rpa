/**
 * Model-RPA Scheduler
 * 后台调度系统 - tokio-cron-scheduler
 */

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio_cron_scheduler::{Job, JobScheduler};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Local, Utc};

/// 定时任务配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledTaskConfig {
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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledTaskStatus {
    pub id: String,
    pub workflow_id: String,
    pub is_running: bool,
    pub last_run_at: Option<String>,
    pub next_run_at: Option<String>,
    pub run_count: u64,
    pub error_count: u64,
    pub last_error: Option<String>,
}

/// 调度器管理器
pub struct SchedulerManager {
    scheduler: Arc<Mutex<Option<JobScheduler>>>,
    tasks: Arc<Mutex<HashMap<String, ScheduledTaskConfig>>>,
    task_status: Arc<Mutex<HashMap<String, ScheduledTaskStatus>>>,
}

impl SchedulerManager {
    /// 创建新的调度器管理器
    pub fn new() -> Self {
        Self {
            scheduler: Arc::new(Mutex::new(None)),
            tasks: Arc::new(Mutex::new(HashMap::new())),
            task_status: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// 初始化调度器
    pub async fn initialize(&self) -> Result<(), String> {
        let scheduler = JobScheduler::new()
            .await
            .map_err(|e| format!("创建调度器失败: {}", e))?;

        let mut lock = self.scheduler.lock().await;
        *lock = Some(scheduler);

        log::info!("调度器初始化完成");
        Ok(())
    }

    /// 启动调度器
    pub async fn start(&self) -> Result<(), String> {
        let lock = self.scheduler.lock().await;
        if let Some(scheduler) = lock.as_ref() {
            scheduler.start()
                .await
                .map_err(|e| format!("启动调度器失败: {}", e))?;
            log::info!("调度器已启动");
        }
        Ok(())
    }

    /// 停止调度器
    pub async fn stop(&self) -> Result<(), String> {
        let lock = self.scheduler.lock().await;
        if let Some(scheduler) = lock.as_ref() {
            scheduler.shutdown()
                .await
                .map_err(|e| format!("停止调度器失败: {}", e))?;
            log::info!("调度器已停止");
        }
        Ok(())
    }

    /// 添加定时任务
    pub async fn add_task(
        &self,
        config: ScheduledTaskConfig,
        callback: impl Fn() + Send + Sync + 'static,
    ) -> Result<String, String> {
        let task_id = config.id.clone();
        let cron_expression = config.cron_expression.clone();

        // 创建 Job
        let job = Job::new(cron_expression.as_str(), move |_, _| {
            callback();
        })
        .map_err(|e| format!("创建任务失败: {}", e))?;

        // 添加到调度器
        let lock = self.scheduler.lock().await;
        if let Some(scheduler) = lock.as_ref() {
            scheduler.add(job)
                .await
                .map_err(|e| format!("添加任务失败: {}", e))?;
        }

        // 保存任务配置
        let mut tasks = self.tasks.lock().await;
        tasks.insert(task_id.clone(), config);

        // 初始化任务状态
        let mut status = self.task_status.lock().await;
        status.insert(task_id.clone(), ScheduledTaskStatus {
            id: task_id.clone(),
            workflow_id: config.workflow_id,
            is_running: false,
            last_run_at: None,
            next_run_at: None,
            run_count: 0,
            error_count: 0,
            last_error: None,
        });

        log::info!("添加定时任务: {} (cron: {})", task_id, cron_expression);
        Ok(task_id)
    }

    /// 移除定时任务
    pub async fn remove_task(&self, task_id: &str) -> Result<(), String> {
        // 从调度器移除
        // TODO: 实现 Job 移除

        // 从配置移除
        let mut tasks = self.tasks.lock().await;
        tasks.remove(task_id);

        // 从状态移除
        let mut status = self.task_status.lock().await;
        status.remove(task_id);

        log::info!("移除定时任务: {}", task_id);
        Ok(())
    }

    /// 启用/禁用任务
    pub async fn toggle_task(&self, task_id: &str, enabled: bool) -> Result<(), String> {
        let mut tasks = self.tasks.lock().await;
        if let Some(config) = tasks.get_mut(task_id) {
            config.is_enabled = enabled;
            config.updated_at = Local::now().to_rfc3339();
        }

        log::info!("{}定时任务: {}", if enabled { "启用" } else { "禁用" }, task_id);
        Ok(())
    }

    /// 获取所有任务
    pub async fn get_tasks(&self) -> Vec<ScheduledTaskConfig> {
        let tasks = self.tasks.lock().await;
        tasks.values().cloned().collect()
    }

    /// 获取任务状态
    pub async fn get_task_status(&self, task_id: &str) -> Option<ScheduledTaskStatus> {
        let status = self.task_status.lock().await;
        status.get(task_id).cloned()
    }

    /// 更新任务状态
    pub async fn update_task_status(
        &self,
        task_id: &str,
        status: ScheduledTaskStatus,
    ) -> Result<(), String> {
        let mut task_status = self.task_status.lock().await;
        task_status.insert(task_id.to_string(), status);
        Ok(())
    }

    /// 验证 Cron 表达式
    pub fn validate_cron(expression: &str) -> bool {
        let fields: Vec<&str> = expression.split_whitespace().collect();
        fields.len() == 5 || fields.len() == 6
    }

    /// 解析 Cron 表达式获取下次执行时间
    pub fn get_next_run_time(expression: &str) -> Result<String, String> {
        // TODO: 使用 cron 库解析
        Ok("未实现".to_string())
    }
}

/// 调度器状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerState {
    pub is_running: bool,
    pub task_count: usize,
    pub active_task_count: usize,
}

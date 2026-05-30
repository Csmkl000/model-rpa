/**
 * Model-RPA Scheduler
 * 定时任务调度 - 简化版本
 */

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};

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
    tasks: Arc<Mutex<HashMap<String, ScheduledTaskConfig>>>,
    task_status: Arc<Mutex<HashMap<String, ScheduledTaskStatus>>>,
}

impl SchedulerManager {
    /// 创建新的调度器管理器
    pub fn new() -> Self {
        Self {
            tasks: Arc::new(Mutex::new(HashMap::new())),
            task_status: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// 添加任务
    pub async fn add_task(
        &self,
        config: ScheduledTaskConfig,
    ) -> Result<String, String> {
        let task_id = config.id.clone();

        // 保存任务配置
        let mut tasks = self.tasks.lock().await;
        tasks.insert(task_id.clone(), config.clone());

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

        log::info!("添加定时任务: {} (cron: {})", task_id, config.cron_expression);
        Ok(task_id)
    }

    /// 移除任务
    pub async fn remove_task(&self, task_id: &str) -> Result<(), String> {
        let mut tasks = self.tasks.lock().await;
        tasks.remove(task_id);

        let mut status = self.task_status.lock().await;
        status.remove(task_id);

        log::info!("移除定时任务: {}", task_id);
        Ok(())
    }

    /// 获取所有任务
    pub async fn get_tasks(&self) -> Vec<ScheduledTaskConfig> {
        let tasks = self.tasks.lock().await;
        tasks.values().cloned().collect()
    }

    /// 验证 Cron 表达式
    pub fn validate_cron(expression: &str) -> bool {
        let fields: Vec<&str> = expression.split_whitespace().collect();
        fields.len() == 5 || fields.len() == 6
    }
}

/**
 * Model-RPA Scheduler
 * 定时任务调度 - 简化版本
 */

use serde::{Deserialize, Serialize};

/// 定时任务配置
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
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

/// 验证 Cron 表达式
#[allow(dead_code)]
pub fn validate_cron(expression: &str) -> bool {
    let fields: Vec<&str> = expression.split_whitespace().collect();
    fields.len() == 5 || fields.len() == 6
}

/**
 * Model-RPA Logger
 * 日志系统 - 简化版本
 */

use serde::{Deserialize, Serialize};

/// 日志级别
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
}

/// 日志类别
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[allow(dead_code)]
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

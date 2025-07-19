use sqlx::{sqlite::SqlitePool, Row};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use anyhow::Result;
use tracing::{info, error};
use std::path::PathBuf;
use std::fs;

use crate::commands::{Settings, AgentStatus};

fn get_database_path() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("VHQ_LAG_v2");
    
    // Ensure directory exists
    if let Err(e) = fs::create_dir_all(&path) {
        error!("Failed to create database directory: {}", e);
        // Fallback to current directory
        return PathBuf::from("vhq_lag_v2.db");
    }
    
    path.push("vhq_lag_v2.db");
    path
}

fn get_database_url() -> String {
    let path = get_database_path();
    format!("sqlite:{}", path.to_string_lossy())
}

/// Initialize the database and create tables
pub async fn init() -> Result<()> {
    let database_url = get_database_url();
    info!("Initializing database at: {}", database_url);
    
    // Create database directory if it doesn't exist
    let db_path = get_database_path();
    if let Some(parent) = db_path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            error!("Failed to create database directory: {}", e);
            return Err(anyhow::anyhow!("Failed to create database directory: {}", e));
        }
    }
    
    let pool = SqlitePool::connect(&database_url).await?;
    
    // Create tables
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            last_activity TEXT NOT NULL,
            memory_usage INTEGER NOT NULL,
            cpu_usage REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#
    ).execute(&pool).await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS file_processing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT NOT NULL,
            agent_type TEXT NOT NULL,
            status TEXT NOT NULL,
            result TEXT,
            error_message TEXT,
            processing_time_ms INTEGER,
            created_at TEXT NOT NULL,
            completed_at TEXT
        )
        "#
    ).execute(&pool).await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#
    ).execute(&pool).await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            progress REAL NOT NULL,
            current_step TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#
    ).execute(&pool).await?;

    info!("Database initialized successfully");
    Ok(())
}

/// Log file processing activity
pub async fn log_file_processing(file_path: &str, agent_type: &str) -> Result<()> {
    let pool = SqlitePool::connect(&get_database_url()).await?;
    let now = Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        INSERT INTO file_processing (file_path, agent_type, status, created_at)
        VALUES (?, ?, 'pending', ?)
        "#
    )
    .bind(file_path)
    .bind(agent_type)
    .bind(&now)
    .execute(&pool)
    .await?;

    info!("Logged file processing: {} with {}", file_path, agent_type);
    Ok(())
}

/// Update file processing status
pub async fn update_file_processing_status(
    file_path: &str,
    status: &str,
    result: Option<&str>,
    error_message: Option<&str>,
    processing_time_ms: Option<i64>,
) -> Result<()> {
    let pool = SqlitePool::connect(&get_database_url()).await?;
    let now = Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        UPDATE file_processing 
        SET status = ?, result = ?, error_message = ?, processing_time_ms = ?, completed_at = ?
        WHERE file_path = ? AND status = 'pending'
        "#
    )
    .bind(status)
    .bind(result)
    .bind(error_message)
    .bind(processing_time_ms)
    .bind(&now)
    .bind(file_path)
    .execute(&pool)
    .await?;

    info!("Updated file processing status: {} -> {}", file_path, status);
    Ok(())
}

/// Save application settings
pub async fn save_settings(settings: &Settings) -> Result<()> {
    let pool = SqlitePool::connect(&get_database_url()).await?;
    let now = Utc::now().to_rfc3339();
    
    let settings_json = serde_json::to_string(settings)?;
    
    sqlx::query(
        r#"
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES ('app_settings', ?, ?)
        "#
    )
    .bind(&settings_json)
    .bind(&now)
    .execute(&pool)
    .await?;

    info!("Settings saved successfully");
    Ok(())
}

/// Load application settings
pub async fn load_settings() -> Result<Option<Settings>> {
    let pool = SqlitePool::connect(&get_database_url()).await?;
    
    let row = sqlx::query(
        r#"
        SELECT value FROM settings WHERE key = 'app_settings'
        "#
    )
    .fetch_optional(&pool)
    .await?;

    match row {
        Some(row) => {
            let value: String = row.get("value");
            let settings: Settings = serde_json::from_str(&value)?;
            Ok(Some(settings))
        }
        None => Ok(None)
    }
}

/// Update agent status
pub async fn update_agent_status(status: &AgentStatus) -> Result<()> {
    let pool = SqlitePool::connect(&get_database_url()).await?;
    let now = Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        INSERT OR REPLACE INTO agents (name, status, last_activity, memory_usage, cpu_usage, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&status.name)
    .bind(&status.status)
    .bind(&status.last_activity)
    .bind(status.memory_usage)
    .bind(status.cpu_usage)
    .bind(&now)
    .bind(&now)
    .execute(&pool)
    .await?;

    info!("Updated agent status: {} -> {}", status.name, status.status);
    Ok(())
}

/// Get agent status from database
pub async fn get_agent_status(agent_name: &str) -> Result<Option<AgentStatus>> {
    let pool = SqlitePool::connect(&get_database_url()).await?;
    
    let row = sqlx::query(
        r#"
        SELECT name, status, last_activity, memory_usage, cpu_usage
        FROM agents WHERE name = ?
        "#
    )
    .bind(agent_name)
    .fetch_optional(&pool)
    .await?;

    match row {
        Some(row) => {
            let status = AgentStatus {
                name: row.get("name"),
                status: row.get("status"),
                last_activity: row.get("last_activity"),
                memory_usage: row.get("memory_usage"),
                cpu_usage: row.get("cpu_usage"),
            };
            Ok(Some(status))
        }
        None => Ok(None)
    }
}

/// Get recent file processing history
pub async fn get_file_processing_history(limit: i64) -> Result<Vec<FileProcessingRecord>> {
    let pool = SqlitePool::connect(&get_database_url()).await?;
    
    let rows = sqlx::query(
        r#"
        SELECT file_path, agent_type, status, result, error_message, processing_time_ms, created_at, completed_at
        FROM file_processing 
        ORDER BY created_at DESC 
        LIMIT ?
        "#
    )
    .bind(limit)
    .fetch_all(&pool)
    .await?;

    let mut records = Vec::new();
    for row in rows {
        records.push(FileProcessingRecord {
            file_path: row.get("file_path"),
            agent_type: row.get("agent_type"),
            status: row.get("status"),
            result: row.get("result"),
            error_message: row.get("error_message"),
            processing_time_ms: row.get("processing_time_ms"),
            created_at: row.get("created_at"),
            completed_at: row.get("completed_at"),
        });
    }

    Ok(records)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileProcessingRecord {
    pub file_path: String,
    pub agent_type: String,
    pub status: String,
    pub result: Option<String>,
    pub error_message: Option<String>,
    pub processing_time_ms: Option<i64>,
    pub created_at: String,
    pub completed_at: Option<String>,
} 
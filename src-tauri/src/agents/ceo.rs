use anyhow::Result;
use tracing::info;
use std::path::Path;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use crate::commands::AgentStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub agent_name: String,
    pub task_type: String,
    pub parameters: serde_json::Value,
    pub priority: i32,
    pub status: TaskStatus,
    pub created_at: String,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub result: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentInfo {
    pub name: String,
    pub status: String,
    pub health_score: f64,
    pub memory_usage: i64,
    pub cpu_usage: f64,
    pub last_activity: String,
    pub capabilities: Vec<String>,
    pub current_task: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub total_memory: i64,
    pub used_memory: i64,
    pub cpu_usage: f64,
    pub disk_usage: f64,
    pub active_tasks: i32,
    pub completed_tasks: i32,
    pub failed_tasks: i32,
    pub uptime: f64,
}

#[derive(Debug, Clone)]
pub struct CeoAgent {
    pub status: String,
    pub memory_usage: i64,
    pub cpu_usage: f64,
    pub last_activity: String,
    pub task_queue: Arc<Mutex<Vec<Task>>>,
    pub agent_registry: Arc<Mutex<HashMap<String, AgentInfo>>>,
    pub system_metrics: Arc<Mutex<SystemMetrics>>,
    pub max_concurrent_tasks: i32,
    pub task_timeout: i32,
}

impl CeoAgent {
    pub fn new() -> Self {
        Self {
            status: "stopped".to_string(),
            memory_usage: 0,
            cpu_usage: 0.0,
            last_activity: chrono::Utc::now().to_rfc3339(),
            task_queue: Arc::new(Mutex::new(Vec::new())),
            agent_registry: Arc::new(Mutex::new(HashMap::new())),
            system_metrics: Arc::new(Mutex::new(SystemMetrics {
                total_memory: 0,
                used_memory: 0,
                cpu_usage: 0.0,
                disk_usage: 0.0,
                active_tasks: 0,
                completed_tasks: 0,
                failed_tasks: 0,
                uptime: 0.0,
            })),
            max_concurrent_tasks: 5,
            task_timeout: 300, // 5 minutes
        }
    }

    pub fn start(&mut self) -> Result<AgentStatus> {
        info!("Starting CEO LAG agent");
        
        self.status = "running".to_string();
        self.last_activity = chrono::Utc::now().to_rfc3339();
        
        // Initialize agent registry
        self.initialize_agent_registry()?;
        
        // Start task processor
        self.start_task_processor()?;
        
        // Start health monitoring
        self.start_health_monitoring()?;
        
        Ok(self.get_status())
    }

    pub fn stop(&mut self) -> Result<AgentStatus> {
        info!("Stopping CEO LAG agent");
        
        self.status = "stopped".to_string();
        self.last_activity = chrono::Utc::now().to_rfc3339();
        
        Ok(self.get_status())
    }

    pub fn get_status(&self) -> AgentStatus {
        AgentStatus {
            name: "CEO_LAG".to_string(),
            status: self.status.clone(),
            last_activity: self.last_activity.clone(),
            memory_usage: self.memory_usage,
            cpu_usage: self.cpu_usage,
        }
    }

    pub fn process_file(&self, file_path: &str, options: serde_json::Value) -> Result<String> {
        info!("CEO LAG processing file: {}", file_path);
        
        // Validate file exists
        if !Path::new(file_path).exists() {
            return Err(anyhow::anyhow!("File not found: {}", file_path));
        }

        // Create orchestration task
        let task = self.create_orchestration_task(file_path, options)?;
        
        // Add to task queue
        self.add_task(task.clone())?;
        
        // Return task ID for tracking
        Ok(serde_json::to_string(&serde_json::json!({
            "task_id": task.id,
            "status": "queued",
            "message": "Task added to orchestration queue"
        }))?)
    }

    fn initialize_agent_registry(&self) -> Result<()> {
        info!("Initializing agent registry");
        
        let mut registry = self.agent_registry.lock().unwrap();
        
        // Register core agents
        registry.insert("vitra_lag".to_string(), AgentInfo {
            name: "VITRA_LAG".to_string(),
            status: "available".to_string(),
            health_score: 1.0,
            memory_usage: 0,
            cpu_usage: 0.0,
            last_activity: chrono::Utc::now().to_rfc3339(),
            capabilities: vec!["transcription".to_string(), "translation".to_string()],
            current_task: None,
        });
        
        registry.insert("ghost_lag".to_string(), AgentInfo {
            name: "GHOST_LAG".to_string(),
            status: "available".to_string(),
            health_score: 1.0,
            memory_usage: 0,
            cpu_usage: 0.0,
            last_activity: chrono::Utc::now().to_rfc3339(),
            capabilities: vec!["content_generation".to_string(), "optimization".to_string()],
            current_task: None,
        });
        
        registry.insert("ceo_lag".to_string(), AgentInfo {
            name: "CEO_LAG".to_string(),
            status: "running".to_string(),
            health_score: 1.0,
            memory_usage: 0,
            cpu_usage: 0.0,
            last_activity: chrono::Utc::now().to_rfc3339(),
            capabilities: vec!["orchestration".to_string(), "task_management".to_string()],
            current_task: None,
        });
        
        info!("Agent registry initialized with {} agents", registry.len());
        Ok(())
    }

    fn start_task_processor(&self) -> Result<()> {
        info!("Starting task processor");
        
        let task_queue = self.task_queue.clone();
        let agent_registry = self.agent_registry.clone();
        
        // Spawn task processor thread
        std::thread::spawn(move || {
            loop {
                // Process pending tasks
                let mut queue = task_queue.lock().unwrap();
                let mut registry = agent_registry.lock().unwrap();
                
                for task in queue.iter_mut() {
                    if matches!(task.status, TaskStatus::Pending) {
                        // Find available agent
                        if let Some(agent) = registry.get_mut(&task.agent_name) {
                            if agent.status == "available" {
                                // Assign task to agent
                                task.status = TaskStatus::Running;
                                task.started_at = Some(chrono::Utc::now().to_rfc3339());
                                agent.current_task = Some(task.id.clone());
                                agent.status = "busy".to_string();
                                
                                info!("Assigned task {} to agent {}", task.id, task.agent_name);
                            }
                        }
                    }
                }
                
                drop(queue);
                drop(registry);
                
                std::thread::sleep(std::time::Duration::from_secs(1));
            }
        });
        
        Ok(())
    }

    fn start_health_monitoring(&self) -> Result<()> {
        info!("Starting health monitoring");
        
        let agent_registry = self.agent_registry.clone();
        let system_metrics = self.system_metrics.clone();
        
        // Spawn health monitoring thread
        std::thread::spawn(move || {
            loop {
                // Update system metrics
                let mut metrics = system_metrics.lock().unwrap();
                metrics.uptime += 1.0;
                
                // Update agent health scores
                let mut registry = agent_registry.lock().unwrap();
                for agent in registry.values_mut() {
                    // Simulate health monitoring
                    agent.health_score = 0.95 + (rand::random::<f64>() * 0.05);
                    agent.last_activity = chrono::Utc::now().to_rfc3339();
                }
                
                drop(metrics);
                drop(registry);
                
                std::thread::sleep(std::time::Duration::from_secs(5));
            }
        });
        
        Ok(())
    }

    fn create_orchestration_task(&self, file_path: &str, options: serde_json::Value) -> Result<Task> {
        let task_id = uuid::Uuid::new_v4().to_string();
        
        // Determine which agent to use based on file type
        let agent_name = self.determine_agent_for_file(file_path)?;
        
        let task = Task {
            id: task_id,
            agent_name,
            task_type: "file_processing".to_string(),
            parameters: serde_json::json!({
                "file_path": file_path,
                "options": options
            }),
            priority: 1,
            status: TaskStatus::Pending,
            created_at: chrono::Utc::now().to_rfc3339(),
            started_at: None,
            completed_at: None,
            result: None,
            error: None,
        };
        
        Ok(task)
    }

    fn determine_agent_for_file(&self, file_path: &str) -> Result<String> {
        let extension = Path::new(file_path)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();
        
        match extension.as_str() {
            "mp3" | "wav" | "mp4" | "avi" | "mov" => Ok("vitra_lag".to_string()),
            "txt" | "md" | "doc" | "docx" => Ok("ghost_lag".to_string()),
            _ => Ok("ghost_lag".to_string()), // Default to GHOST_LAG
        }
    }

    fn add_task(&self, task: Task) -> Result<()> {
        let task_id = task.id.clone();
        let task_priority = task.priority;
        let mut queue = self.task_queue.lock().unwrap();
        queue.push(task);
        queue.sort_by(|a, b| b.priority.cmp(&a.priority)); // Higher priority first
        
        info!("Added task {} to queue (priority: {})", task_id, task_priority);
        Ok(())
    }

    pub fn get_task_status(&self, task_id: &str) -> Result<serde_json::Value> {
        let queue = self.task_queue.lock().unwrap();
        
        if let Some(task) = queue.iter().find(|t| t.id == task_id) {
            Ok(serde_json::json!({
                "task_id": task.id,
                "status": format!("{:?}", task.status),
                "agent": task.agent_name,
                "created_at": task.created_at,
                "started_at": task.started_at,
                "completed_at": task.completed_at,
                "result": task.result,
                "error": task.error
            }))
        } else {
            Err(anyhow::anyhow!("Task not found: {}", task_id))
        }
    }

    pub fn get_queue_status(&self) -> Result<serde_json::Value> {
        let queue = self.task_queue.lock().unwrap();
        let registry = self.agent_registry.lock().unwrap();
        
        let pending = queue.iter().filter(|t| matches!(t.status, TaskStatus::Pending)).count();
        let running = queue.iter().filter(|t| matches!(t.status, TaskStatus::Running)).count();
        let completed = queue.iter().filter(|t| matches!(t.status, TaskStatus::Completed)).count();
        let failed = queue.iter().filter(|t| matches!(t.status, TaskStatus::Failed)).count();
        
        Ok(serde_json::json!({
            "queue_stats": {
                "pending": pending,
                "running": running,
                "completed": completed,
                "failed": failed,
                "total": queue.len()
            },
            "agents": registry.values().collect::<Vec<_>>(),
            "max_concurrent_tasks": self.max_concurrent_tasks
        }))
    }

    pub fn get_system_metrics(&self) -> Result<serde_json::Value> {
        let metrics = self.system_metrics.lock().unwrap();
        Ok(serde_json::to_value(&*metrics)?)
    }

    pub fn cancel_task(&self, task_id: &str) -> Result<()> {
        let mut queue = self.task_queue.lock().unwrap();
        
        if let Some(task) = queue.iter_mut().find(|t| t.id == task_id) {
            task.status = TaskStatus::Cancelled;
            info!("Cancelled task: {}", task_id);
            Ok(())
        } else {
            Err(anyhow::anyhow!("Task not found: {}", task_id))
        }
    }

    pub fn clear_completed_tasks(&self) -> Result<()> {
        let mut queue = self.task_queue.lock().unwrap();
        queue.retain(|task| !matches!(task.status, TaskStatus::Completed | TaskStatus::Failed | TaskStatus::Cancelled));
        
        info!("Cleared completed tasks from queue");
        Ok(())
    }

    pub fn get_agent_info(&self) -> serde_json::Value {
        serde_json::json!({
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "task_timeout": self.task_timeout,
            "status": self.status,
            "last_activity": self.last_activity
        })
    }
} 
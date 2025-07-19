use tauri::State;
use anyhow::Result;
use tracing::{info, error};
use serde::{Deserialize, Serialize};
use crate::agents::{vitra::VitraAgent, ghost::GhostAgent, ceo::CeoAgent};
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentStatus {
    pub name: String,
    pub status: String,
    pub last_activity: String,
    pub memory_usage: i64,
    pub cpu_usage: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub theme: String,
    pub auto_save: bool,
    pub notifications: bool,
    pub max_memory: i64,
    pub cpu_limit: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessFileRequest {
    pub file_path: String,
    pub agent_type: String,
    pub options: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateSettingsRequest {
    pub settings: serde_json::Value,
}

#[tauri::command]
pub async fn start_agent(agent_name: String) -> Result<AgentStatus, String> {
    info!("Starting agent: {}", agent_name);
    
    match agent_name.as_str() {
        "vitra_lag" => {
            tokio::task::spawn_blocking(move || {
                let mut agent = VitraAgent::new();
                agent.start().map_err(|e| e.to_string())
            }).await.map_err(|e| e.to_string()).and_then(|r| r)
        }
        "ghost_lag" => {
            tokio::task::spawn_blocking(move || {
                let mut agent = GhostAgent::new();
                agent.start().map_err(|e| e.to_string())
            }).await.map_err(|e| e.to_string()).and_then(|r| r)
        }
        "ceo_lag" => {
            tokio::task::spawn_blocking(move || {
                let mut agent = CeoAgent::new();
                agent.start().map_err(|e| e.to_string())
            }).await.map_err(|e| e.to_string()).and_then(|r| r)
        }
        _ => Err(format!("Unknown agent: {}", agent_name))
    }
}

#[tauri::command]
pub async fn stop_agent(agent_name: String) -> Result<AgentStatus, String> {
    info!("Stopping agent: {}", agent_name);
    
    match agent_name.as_str() {
        "vitra_lag" => {
            tokio::task::spawn_blocking(move || {
                let mut agent = VitraAgent::new();
                agent.stop().map_err(|e| e.to_string())
            }).await.map_err(|e| e.to_string()).and_then(|r| r)
        }
        "ghost_lag" => {
            tokio::task::spawn_blocking(move || {
                let mut agent = GhostAgent::new();
                agent.stop().map_err(|e| e.to_string())
            }).await.map_err(|e| e.to_string()).and_then(|r| r)
        }
        "ceo_lag" => {
            tokio::task::spawn_blocking(move || {
                let mut agent = CeoAgent::new();
                agent.stop().map_err(|e| e.to_string())
            }).await.map_err(|e| e.to_string()).and_then(|r| r)
        }
        _ => Err(format!("Unknown agent: {}", agent_name))
    }
}

#[tauri::command]
pub async fn get_agent_status(agent_name: String) -> Result<AgentStatus, String> {
    info!("Getting status for agent: {}", agent_name);
    
    match agent_name.as_str() {
        "vitra_lag" => {
            tokio::task::spawn_blocking(move || {
                let agent = VitraAgent::new();
                Ok(agent.get_status())
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        "ghost_lag" => {
            tokio::task::spawn_blocking(move || {
                let agent = GhostAgent::new();
                Ok(agent.get_status())
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        "ceo_lag" => {
            tokio::task::spawn_blocking(move || {
                let agent = CeoAgent::new();
                Ok(agent.get_status())
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        _ => Err(format!("Unknown agent: {}", agent_name))
    }
}

#[tauri::command]
pub async fn process_file(request: ProcessFileRequest) -> Result<String, String> {
    info!("Processing file: {} with agent: {}", request.file_path, request.agent_type);
    
    match request.agent_type.as_str() {
        "vitra_lag" => {
            let file_path = request.file_path.clone();
            let options = request.options.clone();
            tokio::task::spawn_blocking(move || {
                let agent = VitraAgent::new();
                agent.process_file(&file_path, options)
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        "ghost_lag" => {
            let file_path = request.file_path.clone();
            let options = request.options.clone();
            tokio::task::spawn_blocking(move || {
                let agent = GhostAgent::new();
                agent.process_file(&file_path, options)
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        "ceo_lag" => {
            let file_path = request.file_path.clone();
            let options = request.options.clone();
            tokio::task::spawn_blocking(move || {
                let agent = CeoAgent::new();
                agent.process_file(&file_path, options)
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        _ => Err(format!("Unknown agent: {}", request.agent_type))
    }
}

#[tauri::command]
pub async fn get_agent_info(agent_name: String) -> Result<serde_json::Value, String> {
    info!("Getting info for agent: {}", agent_name);
    
    match agent_name.as_str() {
        "vitra_lag" => {
            tokio::task::spawn_blocking(move || {
                let agent = VitraAgent::new();
                Ok(agent.get_model_info())
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        "ghost_lag" => {
            tokio::task::spawn_blocking(move || {
                let agent = GhostAgent::new();
                Ok(agent.get_agent_info())
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        "ceo_lag" => {
            tokio::task::spawn_blocking(move || {
                let agent = CeoAgent::new();
                Ok(agent.get_agent_info())
            }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
        }
        _ => Err(format!("Unknown agent: {}", agent_name))
    }
}

#[tauri::command]
pub async fn get_queue_status() -> Result<serde_json::Value, String> {
    info!("Getting queue status");
    
    let agent = CeoAgent::new();
    tokio::task::spawn_blocking(move || {
        agent.get_queue_status()
    }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
}

#[tauri::command]
pub async fn get_system_metrics() -> Result<serde_json::Value, String> {
    info!("Getting system metrics");
    
    let agent = CeoAgent::new();
    tokio::task::spawn_blocking(move || {
        agent.get_system_metrics()
    }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
}

#[tauri::command]
pub async fn get_task_status(task_id: String) -> Result<serde_json::Value, String> {
    info!("Getting task status: {}", task_id);
    
    let agent = CeoAgent::new();
    tokio::task::spawn_blocking(move || {
        agent.get_task_status(&task_id)
    }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
}

#[tauri::command]
pub async fn cancel_task(task_id: String) -> Result<(), String> {
    info!("Cancelling task: {}", task_id);
    
    let agent = CeoAgent::new();
    tokio::task::spawn_blocking(move || {
        agent.cancel_task(&task_id)
    }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
}

#[tauri::command]
pub async fn clear_completed_tasks() -> Result<(), String> {
    info!("Clearing completed tasks");
    
    let agent = CeoAgent::new();
    tokio::task::spawn_blocking(move || {
        agent.clear_completed_tasks()
    }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
}

#[tauri::command]
pub async fn get_ghost_models() -> Result<Vec<String>, String> {
    info!("Getting available Ghost models");
    
    let agent = GhostAgent::new();
    tokio::task::spawn_blocking(move || {
        agent.get_available_models()
    }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
}

#[tauri::command]
pub async fn get_vitra_languages() -> Result<Vec<String>, String> {
    info!("Getting supported VITRA languages");
    
    let agent = VitraAgent::new();
    tokio::task::spawn_blocking(move || {
        Ok(agent.get_supported_languages())
    }).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e: anyhow::Error| e.to_string()))
}

#[tauri::command]
pub async fn get_workflow_status() -> Result<Vec<serde_json::Value>, String> {
    info!("Getting workflow status");
    
    // Mock workflow status for now
    let workflows = vec![
        serde_json::json!({
            "id": "1",
            "name": "Video Transcription Pipeline",
            "status": "running",
            "progress": 0.75
        }),
        serde_json::json!({
            "id": "2", 
            "name": "Content Generation Workflow",
            "status": "pending",
            "progress": 0.0
        })
    ];
    
    Ok(workflows)
}

#[tauri::command]
pub async fn update_settings(request: UpdateSettingsRequest) -> Result<(), String> {
    info!("Updating settings");
    
    // Mock settings update
    info!("Settings updated: {:?}", request.settings);
    
    Ok(())
}

#[tauri::command]
pub async fn trigger_n8n_workflow(workflow_name: String, payload: serde_json::Value) -> Result<String, String> {
    info!("Triggering n8n workflow: {}", workflow_name);
    
    // TODO: Implement n8n workflow triggering
    // This would typically make an HTTP request to n8n's webhook endpoint
    Ok(format!("Workflow {} triggered successfully", workflow_name))
}

#[tauri::command]
pub async fn get_n8n_workflows() -> Result<Vec<serde_json::Value>, String> {
    info!("Getting n8n workflows");
    
    // TODO: Implement n8n workflow listing
    // This would typically make an HTTP request to n8n's API
    Ok(vec![])
}

#[tauri::command]
pub async fn deploy_n8n_workflow(workflow_data: serde_json::Value) -> Result<String, String> {
    info!("Deploying n8n workflow");
    
    // TODO: Implement n8n workflow deployment
    // This would typically make an HTTP request to n8n's API
    Ok("Workflow deployed successfully".to_string())
}

#[tauri::command]
pub async fn run_system_tests() -> Result<serde_json::Value, String> {
    info!("Running system tests");
    
    use crate::tests::TestSuite;
    
    match TestSuite::new().await {
        Ok(test_suite) => {
            match test_suite.run_all_tests().await {
                Ok(results) => {
                    let summary = results.summary();
                    let all_passed = results.all_passed();
                    
                    let result_json = serde_json::json!({
                        "summary": summary,
                        "all_passed": all_passed,
                        "database": format!("{}", results.database),
                        "agents": format!("{}", results.agents),
                        "system": format!("{}", results.system),
                        "performance": format!("{}", results.performance),
                        "security": format!("{}", results.security)
                    });
                    
                    Ok(result_json)
                }
                Err(e) => Err(format!("Test execution failed: {}", e))
            }
        }
        Err(e) => Err(format!("Test suite initialization failed: {}", e))
    }
} 
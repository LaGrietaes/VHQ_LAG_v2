pub mod vitra;
pub mod ghost;
pub mod ceo;

use serde::{Deserialize, Serialize};
use anyhow::Result;
use tracing::{info, error};

use crate::commands::AgentStatus;
use crate::database;

/// Common agent trait for all agents
pub trait Agent {
    fn name(&self) -> &str;
    fn start(&mut self) -> Result<()>;
    fn stop(&mut self) -> Result<()>;
    fn get_status(&self) -> AgentStatus;
    fn process_file(&self, file_path: &str, options: serde_json::Value) -> Result<String>;
}

/// Agent manager for coordinating all agents
pub struct AgentManager {
    agents: std::collections::HashMap<String, Box<dyn Agent>>,
}

impl AgentManager {
    pub fn new() -> Self {
        Self {
            agents: std::collections::HashMap::new(),
        }
    }

    pub fn register_agent(&mut self, agent: Box<dyn Agent>) {
        let name = agent.name().to_string();
        info!("Registering agent: {}", name);
        self.agents.insert(name, agent);
    }

    pub fn start_agent(&mut self, name: &str) -> Result<()> {
        if let Some(agent) = self.agents.get_mut(name) {
            info!("Starting agent: {}", name);
            agent.start()?;
            
            // Update status in database
            let status = agent.get_status();
            // Note: database update would need to be async, but this is sync context
            // For now, we'll skip the database update in this sync method
            
            Ok(())
        } else {
            Err(anyhow::anyhow!("Agent not found: {}", name))
        }
    }

    pub fn stop_agent(&mut self, name: &str) -> Result<()> {
        if let Some(agent) = self.agents.get_mut(name) {
            info!("Stopping agent: {}", name);
            agent.stop()?;
            
            // Update status in database
            let status = agent.get_status();
            // Note: database update would need to be async, but this is sync context
            // For now, we'll skip the database update in this sync method
            
            Ok(())
        } else {
            Err(anyhow::anyhow!("Agent not found: {}", name))
        }
    }

    pub fn get_agent_status(&self, name: &str) -> Option<AgentStatus> {
        self.agents.get(name).map(|agent| agent.get_status())
    }

    pub fn process_file_with_agent(&self, name: &str, file_path: &str, options: serde_json::Value) -> Result<String> {
        if let Some(agent) = self.agents.get(name) {
            info!("Processing file {} with agent {}", file_path, name);
            agent.process_file(file_path, options)
        } else {
            Err(anyhow::anyhow!("Agent not found: {}", name))
        }
    }

    pub fn get_all_agents(&self) -> Vec<&str> {
        self.agents.keys().map(|k| k.as_str()).collect()
    }
}

/// Common agent status implementation
pub fn create_agent_status(
    name: &str,
    status: &str,
    memory_usage: i64,
    cpu_usage: f64,
) -> AgentStatus {
    AgentStatus {
        name: name.to_string(),
        status: status.to_string(),
        last_activity: chrono::Utc::now().to_rfc3339(),
        memory_usage,
        cpu_usage,
    }
}

/// Common file processing utilities
pub mod utils {
    use std::path::Path;
    use anyhow::Result;
    use tracing::info;

    /// Validate file exists and is accessible
    pub fn validate_file(file_path: &str) -> Result<()> {
        let path = Path::new(file_path);
        if !path.exists() {
            return Err(anyhow::anyhow!("File does not exist: {}", file_path));
        }
        if !path.is_file() {
            return Err(anyhow::anyhow!("Path is not a file: {}", file_path));
        }
        Ok(())
    }

    /// Get file extension
    pub fn get_file_extension(file_path: &str) -> Option<String> {
        Path::new(file_path)
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_lowercase())
    }

    /// Check if file is audio/video
    pub fn is_media_file(file_path: &str) -> bool {
        let audio_extensions = ["mp3", "wav", "flac", "aac", "ogg", "m4a"];
        let video_extensions = ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm"];
        
        if let Some(ext) = get_file_extension(file_path) {
            audio_extensions.contains(&ext.as_str()) || video_extensions.contains(&ext.as_str())
        } else {
            false
        }
    }

    /// Check if file is text-based
    pub fn is_text_file(file_path: &str) -> bool {
        let text_extensions = ["txt", "md", "json", "xml", "html", "css", "js", "ts", "rs", "py"];
        
        if let Some(ext) = get_file_extension(file_path) {
            text_extensions.contains(&ext.as_str())
        } else {
            false
        }
    }

    /// Create output path for processed files
    pub fn create_output_path(input_path: &str, suffix: &str) -> String {
        let path = Path::new(input_path);
        let stem = path.file_stem().unwrap_or_default();
        let extension = path.extension().unwrap_or_default();
        
        format!("{}_{}.{}", stem.to_string_lossy(), suffix, extension.to_string_lossy())
    }
} 
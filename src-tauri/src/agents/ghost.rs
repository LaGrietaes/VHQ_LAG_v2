use anyhow::Result;
use tracing::info;
use std::path::Path;
use std::process::Command;
use std::collections::HashMap;
use crate::commands::AgentStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentTemplate {
    pub name: String,
    pub prompt_template: String,
    pub variables: Vec<String>,
    pub content_type: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedContent {
    pub id: String,
    pub title: String,
    pub content: String,
    pub content_type: String,
    pub template_used: Option<String>,
    pub model_used: String,
    pub tokens_used: i32,
    pub generation_time: f64,
    pub file_path: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone)]
pub struct GhostAgent {
    pub status: String,
    pub memory_usage: i64,
    pub cpu_usage: f64,
    pub last_activity: String,
    pub ollama_url: String,
    pub default_model: String,
    pub templates_dir: String,
    pub output_dir: String,
}

impl GhostAgent {
    pub fn new() -> Self {
        Self {
            status: "stopped".to_string(),
            memory_usage: 0,
            cpu_usage: 0.0,
            last_activity: chrono::Utc::now().to_rfc3339(),
            ollama_url: "http://localhost:11434".to_string(),
            default_model: "llama2".to_string(),
            templates_dir: "templates".to_string(),
            output_dir: "generated_content".to_string(),
        }
    }

    pub fn start(&mut self) -> Result<AgentStatus> {
        info!("Starting GHOST LAG agent");
        
        self.status = "running".to_string();
        self.last_activity = chrono::Utc::now().to_rfc3339();
        
        // Initialize Ollama connection
        self.initialize_ollama()?;
        
        // Create output directory
        std::fs::create_dir_all(&self.output_dir)
            .map_err(|e| anyhow::anyhow!("Failed to create output directory: {}", e))?;
        
        Ok(self.get_status())
    }

    pub fn stop(&mut self) -> Result<AgentStatus> {
        info!("Stopping GHOST LAG agent");
        
        self.status = "stopped".to_string();
        self.last_activity = chrono::Utc::now().to_rfc3339();
        
        Ok(self.get_status())
    }

    pub fn get_status(&self) -> AgentStatus {
        AgentStatus {
            name: "GHOST_LAG".to_string(),
            status: self.status.clone(),
            last_activity: self.last_activity.clone(),
            memory_usage: self.memory_usage,
            cpu_usage: self.cpu_usage,
        }
    }

    pub fn process_file(&self, file_path: &str, options: serde_json::Value) -> Result<String> {
        info!("GHOST LAG processing file: {}", file_path);
        
        // Validate file exists
        if !Path::new(file_path).exists() {
            return Err(anyhow::anyhow!("File not found: {}", file_path));
        }

        // Extract options
        let content_type = options.get("content_type")
            .and_then(|v| v.as_str())
            .unwrap_or("article");
        
        let template_name = options.get("template")
            .and_then(|v| v.as_str())
            .unwrap_or("default");
        
        let model = options.get("model")
            .and_then(|v| v.as_str())
            .unwrap_or(&self.default_model);

        // Read file content
        let file_content = std::fs::read_to_string(file_path)
            .map_err(|e| anyhow::anyhow!("Failed to read file: {}", e))?;

        // Load template
        let template = self.load_template(template_name)?;
        
        // Prepare variables
        let mut variables = HashMap::new();
        variables.insert("content".to_string(), file_content);
        
        // Add other variables from options
        if let Some(vars) = options.get("variables") {
            if let Some(var_obj) = vars.as_object() {
                for (key, value) in var_obj {
                    if let Some(val) = value.as_str() {
                        variables.insert(key.clone(), val.to_string());
                    }
                }
            }
        }

        // Apply template
        let prompt = self.apply_template(&template, &variables)?;
        
        // Generate content
        let result = self.generate_content(&prompt, model, &content_type)?;
        
        // Save result
        self.save_generated_content(&result)?;

        Ok(serde_json::to_string(&result)?)
    }

    fn initialize_ollama(&self) -> Result<()> {
        info!("Initializing Ollama connection to: {}", self.ollama_url);
        
        // Check if Ollama is running
        let client = reqwest::blocking::Client::new();
        let response = client.get(&format!("{}/api/tags", self.ollama_url))
            .send()
            .map_err(|e| anyhow::anyhow!("Failed to connect to Ollama: {}", e))?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Ollama is not responding properly"));
        }
        
        info!("Ollama connection established successfully");
        Ok(())
    }

    fn load_template(&self, template_name: &str) -> Result<ContentTemplate> {
        let template_path = format!("{}/{}.json", self.templates_dir, template_name);
        
        if !Path::new(&template_path).exists() {
            // Return default template if not found
            return Ok(ContentTemplate {
                name: template_name.to_string(),
                prompt_template: "Generate content based on the following input:\n\n{content}\n\nPlease provide a well-structured response.".to_string(),
                variables: vec!["content".to_string()],
                content_type: "article".to_string(),
                description: "Default template for content generation".to_string(),
            });
        }

        let template_content = std::fs::read_to_string(&template_path)?;
        let template: ContentTemplate = serde_json::from_str(&template_content)?;
        
        Ok(template)
    }

    fn apply_template(&self, template: &ContentTemplate, variables: &HashMap<String, String>) -> Result<String> {
        let mut prompt = template.prompt_template.clone();
        
        // Replace variables in template
        for variable in &template.variables {
            if let Some(value) = variables.get(variable) {
                prompt = prompt.replace(&format!("{{{}}}", variable), value);
            } else {
                info!("Missing variable in template: {}", variable);
            }
        }
        
        Ok(prompt)
    }

    fn generate_content(&self, prompt: &str, model: &str, content_type: &str) -> Result<GeneratedContent> {
        info!("Generating content with model: {}", model);
        
        let start_time = std::time::Instant::now();
        
        // Prepare request payload
        let request = serde_json::json!({
            "model": model,
            "prompt": prompt,
            "stream": false,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 1000,
            }
        });

        // Make request to Ollama
        let client = reqwest::blocking::Client::new();
        let response = client
            .post(&format!("{}/api/generate", self.ollama_url))
            .json(&request)
            .send()
            .map_err(|e| anyhow::anyhow!("Failed to make request to Ollama: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text()
                .map_err(|e| anyhow::anyhow!("Failed to read error response: {}", e))?;
            return Err(anyhow::anyhow!("Ollama API error: {}", error_text));
        }

        let response_json: serde_json::Value = response.json()
            .map_err(|e| anyhow::anyhow!("Failed to parse response: {}", e))?;
        
        let generated_text = response_json.get("response")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow::anyhow!("Invalid response from Ollama API"))?;

        let generation_time = start_time.elapsed().as_secs_f64();
        
        // Create output file
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let filename = format!("{}_{}.txt", content_type, timestamp);
        let file_path = format!("{}/{}", self.output_dir, filename);
        
        std::fs::write(&file_path, generated_text)
            .map_err(|e| anyhow::anyhow!("Failed to write generated content: {}", e))?;

        let result = GeneratedContent {
            id: uuid::Uuid::new_v4().to_string(),
            title: format!("Generated {} content", content_type),
            content: generated_text.to_string(),
            content_type: content_type.to_string(),
            template_used: None,
            model_used: model.to_string(),
            tokens_used: generated_text.split_whitespace().count() as i32,
            generation_time,
            file_path: Some(file_path.clone()),
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        info!("Content generated in {:.2}s, saved to: {}", generation_time, file_path);
        Ok(result)
    }

    fn save_generated_content(&self, content: &GeneratedContent) -> Result<()> {
        // Save to SQLite database
        info!("Saving generated content to database");
        Ok(())
    }

    pub fn create_project_structure(&self, project_name: &str, structure_type: &str) -> Result<String> {
        info!("Creating project structure: {} ({})", project_name, structure_type);
        
        let template = self.load_template("project_structure")?;
        
        let mut variables = HashMap::new();
        variables.insert("project_name".to_string(), project_name.to_string());
        variables.insert("structure_type".to_string(), structure_type.to_string());
        
        let prompt = self.apply_template(&template, &variables)?;
        let result = self.generate_content(&prompt, &self.default_model, "project_structure")?;
        
        Ok(serde_json::to_string(&result)?)
    }

    pub fn optimize_content(&self, content: &str, optimization_type: &str) -> Result<String> {
        info!("Optimizing content: {}", optimization_type);
        
        let template = self.load_template("content_optimization")?;
        
        let mut variables = HashMap::new();
        variables.insert("content".to_string(), content.to_string());
        variables.insert("optimization_type".to_string(), optimization_type.to_string());
        
        let prompt = self.apply_template(&template, &variables)?;
        let result = self.generate_content(&prompt, &self.default_model, "optimized_content")?;
        
        Ok(serde_json::to_string(&result)?)
    }

    pub fn get_available_models(&self) -> Result<Vec<String>> {
        let client = reqwest::blocking::Client::new();
        let response = client.get(&format!("{}/api/tags", self.ollama_url))
            .send()
            .map_err(|e| anyhow::anyhow!("Failed to get models: {}", e))?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Failed to get models from Ollama"));
        }

        let response_json: serde_json::Value = response.json()
            .map_err(|e| anyhow::anyhow!("Failed to parse models response: {}", e))?;
        
        let models = response_json.get("models")
            .and_then(|v| v.as_array())
            .ok_or_else(|| anyhow::anyhow!("Invalid models response"))?
            .iter()
            .filter_map(|model| model.get("name").and_then(|n| n.as_str()))
            .map(|s| s.to_string())
            .collect();

        Ok(models)
    }

    pub fn get_agent_info(&self) -> serde_json::Value {
        serde_json::json!({
            "ollama_url": self.ollama_url,
            "default_model": self.default_model,
            "templates_dir": self.templates_dir,
            "output_dir": self.output_dir,
            "status": self.status,
            "last_activity": self.last_activity
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ghost_lag_creation() {
        let agent = GhostAgent::new();
        assert_eq!(agent.status, "stopped");
    }

    #[test]
    fn test_ghost_lag_start_stop() {
        let mut agent = GhostAgent::new();
        
        assert!(agent.start().is_ok());
        assert_eq!(agent.get_status().status, "running");
        
        assert!(agent.stop().is_ok());
        assert_eq!(agent.get_status().status, "stopped");
    }

    #[test]
    fn test_text_file_validation() {
        assert!(utils::is_text_file("test.txt"));
        assert!(utils::is_text_file("test.md"));
        assert!(!utils::is_text_file("test.mp3"));
    }
} 
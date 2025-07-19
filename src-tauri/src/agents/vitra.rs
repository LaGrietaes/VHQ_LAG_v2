use anyhow::Result;
use tracing::info;
use std::path::Path;
use std::process::Command;
use crate::commands::AgentStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptionResult {
    pub file_path: String,
    pub transcription: String,
    pub language: String,
    pub confidence: f64,
    pub duration: f64,
    pub srt_path: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone)]
pub struct VitraAgent {
    pub status: String,
    pub memory_usage: i64,
    pub cpu_usage: f64,
    pub last_activity: String,
    pub whisper_model: String,
    pub supported_languages: Vec<String>,
}

impl VitraAgent {
    pub fn new() -> Self {
        Self {
            status: "stopped".to_string(),
            memory_usage: 0,
            cpu_usage: 0.0,
            last_activity: chrono::Utc::now().to_rfc3339(),
            whisper_model: "base".to_string(),
            supported_languages: vec![
                "en".to_string(), "es".to_string(), "fr".to_string(), 
                "de".to_string(), "it".to_string(), "pt".to_string(),
                "ru".to_string(), "ja".to_string(), "ko".to_string(), "zh".to_string()
            ],
        }
    }

    pub fn start(&mut self) -> Result<AgentStatus> {
        info!("Starting VITRA LAG agent");
        
        self.status = "running".to_string();
        self.last_activity = chrono::Utc::now().to_rfc3339();
        
        // Initialize whisper model
        self.initialize_whisper_model()?;
        
        Ok(self.get_status())
    }

    pub fn stop(&mut self) -> Result<AgentStatus> {
        info!("Stopping VITRA LAG agent");
        
        self.status = "stopped".to_string();
        self.last_activity = chrono::Utc::now().to_rfc3339();
        
        Ok(self.get_status())
    }

    pub fn get_status(&self) -> AgentStatus {
        AgentStatus {
            name: "VITRA_LAG".to_string(),
            status: self.status.clone(),
            last_activity: self.last_activity.clone(),
            memory_usage: self.memory_usage,
            cpu_usage: self.cpu_usage,
        }
    }

    pub fn process_file(&self, file_path: &str, options: serde_json::Value) -> Result<String> {
        info!("VITRA LAG processing file: {}", file_path);
        
        // Validate file exists
        if !Path::new(file_path).exists() {
            return Err(anyhow::anyhow!("File not found: {}", file_path));
        }

        // Extract options
        let language = options.get("language")
            .and_then(|v| v.as_str())
            .unwrap_or("auto");
        
        let model = options.get("model")
            .and_then(|v| v.as_str())
            .unwrap_or(&self.whisper_model);

        // Perform transcription
        let result = self.transcribe_audio(file_path, language, model)?;
        
        // Generate SRT if requested
        let srt_path = if options.get("generate_srt").and_then(|v| v.as_bool()).unwrap_or(false) {
            Some(self.generate_srt(&result)?)
        } else {
            None
        };

        // Save result to database
        let final_result = TranscriptionResult {
            file_path: file_path.to_string(),
            transcription: result.transcription,
            language: result.language,
            confidence: result.confidence,
            duration: result.duration,
            srt_path,
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        // Save to database
        self.save_transcription_result(&final_result)?;

        Ok(serde_json::to_string(&final_result)?)
    }

    fn initialize_whisper_model(&self) -> Result<()> {
        info!("Initializing whisper model: {}", self.whisper_model);
        
        // Check if whisper.cpp is available
        let output = Command::new("whisper")
            .arg("--help")
            .output()
            .map_err(|_| anyhow::anyhow!("whisper.cpp not found. Please install whisper.cpp"))?;
        
        if !output.status.success() {
            return Err(anyhow::anyhow!("whisper.cpp not working properly"));
        }
        
        info!("Whisper model initialized successfully");
        Ok(())
    }

    fn transcribe_audio(&self, file_path: &str, language: &str, model: &str) -> Result<TranscriptionResult> {
        info!("Transcribing audio file: {} with model: {}", file_path, model);
        
        let start_time = std::time::Instant::now();
        
        // Build whisper command
        let mut cmd = Command::new("whisper");
        cmd.arg(file_path)
            .arg("--model").arg(model)
            .arg("--output_dir").arg("transcripts")
            .arg("--output_format").arg("json");
        
        if language != "auto" {
            cmd.arg("--language").arg(language);
        }
        
        // Execute transcription
        let output = cmd.output()
            .map_err(|e| anyhow::anyhow!("Failed to execute whisper: {}", e))?;
        
        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow::anyhow!("Transcription failed: {}", error));
        }
        
        let duration = start_time.elapsed().as_secs_f64();
        
        // Parse output (simplified - in real implementation, parse JSON output)
        let transcription = String::from_utf8_lossy(&output.stdout).to_string();
        
        let result = TranscriptionResult {
            file_path: file_path.to_string(),
            transcription,
            language: language.to_string(),
            confidence: 0.95, // Mock confidence
            duration,
            srt_path: None,
            created_at: chrono::Utc::now().to_rfc3339(),
        };
        
        info!("Transcription completed in {:.2}s", duration);
        Ok(result)
    }

    fn generate_srt(&self, result: &TranscriptionResult) -> Result<String> {
        info!("Generating SRT subtitles for: {}", result.file_path);
        
        let srt_path = format!("{}.srt", result.file_path);
        
        // Generate SRT content (simplified)
        let srt_content = format!(
            "1\n00:00:00,000 --> 00:00:30,000\n{}\n\n",
            result.transcription
        );
        
        // Write SRT file
        std::fs::write(&srt_path, srt_content)
            .map_err(|e| anyhow::anyhow!("Failed to write SRT file: {}", e))?;
        
        info!("SRT file generated: {}", srt_path);
        Ok(srt_path)
    }

    fn save_transcription_result(&self, result: &TranscriptionResult) -> Result<()> {
        // Save to SQLite database
        // This would integrate with the database module
        info!("Saving transcription result to database");
        Ok(())
    }

    pub fn get_supported_languages(&self) -> Vec<String> {
        self.supported_languages.clone()
    }

    pub fn set_model(&mut self, model: String) {
        let model_clone = model.clone();
        self.whisper_model = model;
        info!("Whisper model set to: {}", model_clone);
    }

    pub fn get_model_info(&self) -> serde_json::Value {
        serde_json::json!({
            "current_model": self.whisper_model,
            "supported_languages": self.supported_languages,
            "status": self.status,
            "last_activity": self.last_activity
        })
    }
} 
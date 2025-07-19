// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tracing::{info, error};

mod commands;
mod database;
mod agents;
mod system;
mod tests;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();
    info!("Starting VHQ LAG v2...");

    // Initialize database with error handling
    match database::init().await {
        Ok(_) => info!("Database initialized successfully"),
        Err(e) => {
            error!("Failed to initialize database: {}", e);
            // Continue anyway for now
        }
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::start_agent,
            commands::stop_agent,
            commands::get_agent_status,
            commands::get_agent_info,
            commands::process_file,
            commands::get_queue_status,
            commands::get_system_metrics,
            commands::get_task_status,
            commands::cancel_task,
            commands::clear_completed_tasks,
            commands::get_ghost_models,
            commands::get_vitra_languages,
            commands::get_workflow_status,
            commands::update_settings,
            commands::trigger_n8n_workflow,
            commands::get_n8n_workflows,
            commands::deploy_n8n_workflow,
            commands::run_system_tests
        ])
        .setup(|_app| {
            info!("VHQ LAG v2 initialized successfully");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 
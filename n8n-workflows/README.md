# VHQ_LAG n8n Workflows

This directory contains n8n workflows for orchestrating the VHQ_LAG system.

## Workflow Structure

### Core Workflows
- `vitra-pipeline.json` - Audio/video transcription pipeline
- `ghost-pipeline.json` - Content generation pipeline  
- `ceo-orchestration.json` - Task orchestration and management
- `file-monitor.json` - File system monitoring and triggers

### Integration Workflows
- `agent-health-monitor.json` - Agent health monitoring
- `system-metrics.json` - System performance monitoring
- `error-handling.json` - Error handling and recovery

## Setup Instructions

1. Install n8n globally:
```bash
npm install -g n8n
```

2. Start n8n:
```bash
n8n start
```

3. Import workflows from this directory

4. Configure environment variables:
- `VHQ_AGENTS_PATH` - Path to Rust agents
- `VHQ_DATABASE_PATH` - SQLite database path
- `VHQ_OUTPUT_PATH` - Output directory for processed files

## Workflow Descriptions

### VITRA Pipeline
Triggers on new audio/video files and processes them through VITRA_LAG agent.

### GHOST Pipeline  
Triggers on new text files and processes them through GHOST_LAG agent.

### CEO Orchestration
Manages task queue and coordinates between agents.

### File Monitor
Monitors file system for new files and triggers appropriate workflows.

## Usage

1. Start the n8n server
2. Import the workflows
3. Configure the file paths and agent locations
4. Activate the workflows
5. Monitor through the n8n dashboard

## Integration with Tauri

The Tauri application communicates with n8n via HTTP API calls to:
- Trigger workflows
- Get workflow status
- Monitor system health
- Manage task queues 
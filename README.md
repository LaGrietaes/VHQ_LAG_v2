# VHQ_LAG_v2 - Multi-Agent AI System

## 🎯 Project Overview

**VHQ_LAG_v2** is a high-performance, offline-capable multi-agent AI system built with Rust, n8n orchestration, and Tauri desktop UI.

### **Architecture**
- **Rust Agents**: High-performance AI agents for transcription, content generation, and orchestration
- **n8n Orchestration**: Workflow automation and agent coordination
- **Tauri Desktop UI**: Native desktop application with React frontend
- **SQLite Database**: Local data storage and logging
- **Local AI Models**: whisper.cpp, Ollama, NLLB-200 for offline operation

### **Key Features**
- ✅ **Offline Operation**: No internet dependencies
- ✅ **High Performance**: 10-100x faster than Python equivalents
- ✅ **Native UI**: Desktop application with rich user experience
- ✅ **Workflow Automation**: n8n orchestration for complex tasks
- ✅ **Cross-Platform**: Windows, macOS, Linux support

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VHQ_LAG HYBRID SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Tauri UI   │  │   Web UI    │  │  Remote API │       │
│  │ (Desktop)   │  │ (Remote)    │  │  (HTTP/WS)  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    n8n ORCHESTRATION LAYER                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Workflow   │  │   Trigger   │  │   Router    │       │
│  │  Engine     │  │  Manager    │  │   System    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    RUST AGENTS LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  VITRA_LAG  │  │  GHOST_LAG  │  │  CEO_LAG    │       │
│  │(Transcription│  │(Content Gen)│  │(Orchestration│       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    STORAGE LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   SQLite    │  │   File      │  │   Logs      │       │
│  │ (Database)  │  │  System     │  │  (JSONL)    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### **Prerequisites**
- Rust 1.70+ (`rustup install stable`)
- Node.js 18+ (`node --version`)
- Git (`git --version`)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/LaGrietaes/VHQ_LAG_v2.git
cd VHQ_LAG_v2

# Install Rust dependencies
cargo build

# Install frontend dependencies
npm install

# Start development
npm run tauri dev
```

### **Development Setup**
```bash
# Install development tools
cargo install tauri-cli
npm install -g n8n

# Setup n8n workflows
n8n start

# Run tests
cargo test
npm test
```

## 📁 Project Structure

```
VHQ_LAG_v2/
├── README.md                    # This file
├── Cargo.toml                   # Rust workspace
├── src-tauri/                   # Tauri backend
│   ├── src/
│   │   ├── main.rs             # Tauri app entry point
│   │   ├── commands.rs         # Agent control commands
│   │   └── database.rs         # SQLite operations
│   └── tauri.conf.json         # Tauri configuration
├── src/                         # React frontend
│   ├── components/              # UI components
│   ├── lib/                     # Utilities and types
│   └── styles/                  # CSS and styling
├── agents/                      # Rust agents
│   ├── vitra_lag/              # Transcription agent
│   ├── ghost_lag/              # Content generation agent
│   └── ceo_lag/                # Orchestration agent
├── n8n-workflows/              # n8n orchestration
├── docs/                        # Documentation
├── scripts/                     # Development scripts
├── tests/                       # Test files
└── config/                      # Configuration files
```

## 🤖 Core Agents

### **VITRA_LAG** - Transcription Agent
- Audio/video transcription using whisper.cpp
- Multi-language support (EN, ES, TR, etc.)
- SRT subtitle generation
- Real-time processing

### **GHOST_LAG** - Content Generation Agent
- Local LLM content generation (Ollama)
- Template-based content creation
- Project structure management
- Content optimization

### **CEO_LAG** - Orchestration Agent
- Task queue management
- Agent health monitoring
- Resource allocation
- Workflow coordination

## 📊 Performance Targets

- **Startup Time**: < 5 seconds
- **Memory Usage**: < 1GB total system
- **Response Time**: < 2 seconds for UI operations
- **Transcription**: < 1s per minute of audio
- **Content Generation**: < 5s for standard content

## 🛠️ Development

### **Adding New Agents**
```bash
# Create new agent
cargo new --bin agents/new_agent
cd agents/new_agent

# Add to workspace
echo 'new_agent = { path = "agents/new_agent" }' >> Cargo.toml
```

### **Creating n8n Workflows**
```bash
# Start n8n
n8n start

# Access workflow editor
# http://localhost:5678
```

### **Testing**
```bash
# Run all tests
cargo test
npm test

# Run specific agent tests
cargo test --package vitra_lag
```

## 📚 Documentation

- **[Master Plan](docs/MASTER_PLAN.md)**: Complete project roadmap
- **[Development Strategy](docs/DEVELOPMENT_STRATEGY.md)**: Implementation approach
- **[Project Checklist](docs/PROJECT_CHECKLIST.md)**: Task tracking
- **[Project Rules](docs/PROJECT_RULES.md)**: Development guidelines
- **[API Documentation](docs/API.md)**: Agent and UI APIs
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Production setup

## 🎯 Success Criteria

### **Technical Success**
- ✅ All agents implemented in Rust
- ✅ n8n orchestrates workflows successfully
- ✅ Tauri app provides rich desktop experience
- ✅ System runs completely offline
- ✅ Cross-platform compatibility

### **Business Success**
- ✅ 90% reduction in manual intervention
- ✅ 10x faster content processing
- ✅ 99.9% system uptime
- ✅ Zero cloud dependencies
- ✅ Complete automation of workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/LaGrietaes/VHQ_LAG_v2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LaGrietaes/VHQ_LAG_v2/discussions)

---

**🎯 Mission**: Build the most efficient, reliable, and user-friendly multi-agent AI system for business automation. 
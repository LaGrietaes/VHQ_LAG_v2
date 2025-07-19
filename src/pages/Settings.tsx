import { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Bot, 
  FileText, 
  Save,
  RefreshCw,
  CheckCircle
} from 'lucide-react'

interface SystemSettings {
  database_path: string
  max_concurrent_tasks: number
  auto_start_agents: boolean
  log_level: 'debug' | 'info' | 'warn' | 'error'
  backup_enabled: boolean
  backup_interval_hours: number
}

interface AgentSettings {
  vitra_lag: {
    model: string
    language: string
    output_format: string
    max_file_size_mb: number
  }
  ghost_lag: {
    model: string
    temperature: number
    max_tokens: number
    context_window: number
  }
  ceo_lag: {
    max_concurrent_tasks: number
    task_timeout_seconds: number
    health_check_interval_seconds: number
  }
}

const defaultSystemSettings: SystemSettings = {
  database_path: './data/vhq_lag.db',
  max_concurrent_tasks: 5,
  auto_start_agents: false,
  log_level: 'info',
  backup_enabled: true,
  backup_interval_hours: 24
}

const defaultAgentSettings: AgentSettings = {
  vitra_lag: {
    model: 'whisper-base',
    language: 'auto',
    output_format: 'srt',
    max_file_size_mb: 500
  },
  ghost_lag: {
    model: 'llama2',
    temperature: 0.7,
    max_tokens: 1000,
    context_window: 4096
  },
  ceo_lag: {
    max_concurrent_tasks: 5,
    task_timeout_seconds: 300,
    health_check_interval_seconds: 30
  }
}

export default function Settings() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings)
  const [agentSettings, setAgentSettings] = useState<AgentSettings>(defaultAgentSettings)
  const [activeTab, setActiveTab] = useState<'system' | 'agents' | 'logs'>('system')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setSystemSettings(defaultSystemSettings)
    setAgentSettings(defaultAgentSettings)
  }

  const tabs = [
    { id: 'system', name: 'System', icon: SettingsIcon },
    { id: 'agents', name: 'Agents', icon: Bot },
    { id: 'logs', name: 'Logs', icon: FileText }
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure system and agent settings</p>
      </div>

      {/* Settings Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Settings */}
            <div className="card">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>System Configuration</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Database Path
                  </label>
                  <input
                    type="text"
                    value={systemSettings.database_path}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, database_path: e.target.value }))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Concurrent Tasks
                  </label>
                  <input
                    type="number"
                    value={systemSettings.max_concurrent_tasks}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, max_concurrent_tasks: parseInt(e.target.value) }))}
                    className="input"
                    min="1"
                    max="20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Log Level
                  </label>
                  <select
                    value={systemSettings.log_level}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, log_level: e.target.value as any }))}
                    className="input"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Backup Interval (hours)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.backup_interval_hours}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, backup_interval_hours: parseInt(e.target.value) }))}
                    className="input"
                    min="1"
                    max="168"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={systemSettings.auto_start_agents}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, auto_start_agents: e.target.checked }))}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Auto-start agents on launch</span>
                </label>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={systemSettings.backup_enabled}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, backup_enabled: e.target.checked }))}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Enable automatic backups</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            {/* VITRA LAG Settings */}
            <div className="card">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>VITRA LAG Settings</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Model
                  </label>
                  <select
                    value={agentSettings.vitra_lag.model}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      vitra_lag: { ...prev.vitra_lag, model: e.target.value }
                    }))}
                    className="input"
                  >
                    <option value="whisper-tiny">Whisper Tiny</option>
                    <option value="whisper-base">Whisper Base</option>
                    <option value="whisper-small">Whisper Small</option>
                    <option value="whisper-medium">Whisper Medium</option>
                    <option value="whisper-large">Whisper Large</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Language
                  </label>
                  <select
                    value={agentSettings.vitra_lag.language}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      vitra_lag: { ...prev.vitra_lag, language: e.target.value }
                    }))}
                    className="input"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Output Format
                  </label>
                  <select
                    value={agentSettings.vitra_lag.output_format}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      vitra_lag: { ...prev.vitra_lag, output_format: e.target.value }
                    }))}
                    className="input"
                  >
                    <option value="srt">SRT</option>
                    <option value="vtt">VTT</option>
                    <option value="txt">Plain Text</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={agentSettings.vitra_lag.max_file_size_mb}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      vitra_lag: { ...prev.vitra_lag, max_file_size_mb: parseInt(e.target.value) }
                    }))}
                    className="input"
                    min="1"
                    max="2000"
                  />
                </div>
              </div>
            </div>

            {/* GHOST LAG Settings */}
            <div className="card">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>GHOST LAG Settings</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Model
                  </label>
                  <select
                    value={agentSettings.ghost_lag.model}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      ghost_lag: { ...prev.ghost_lag, model: e.target.value }
                    }))}
                    className="input"
                  >
                    <option value="llama2">Llama 2</option>
                    <option value="llama2-uncensored">Llama 2 Uncensored</option>
                    <option value="codellama">Code Llama</option>
                    <option value="mistral">Mistral</option>
                    <option value="neural-chat">Neural Chat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={agentSettings.ghost_lag.temperature}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      ghost_lag: { ...prev.ghost_lag, temperature: parseFloat(e.target.value) }
                    }))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={agentSettings.ghost_lag.max_tokens}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      ghost_lag: { ...prev.ghost_lag, max_tokens: parseInt(e.target.value) }
                    }))}
                    className="input"
                    min="1"
                    max="8192"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Context Window
                  </label>
                  <input
                    type="number"
                    value={agentSettings.ghost_lag.context_window}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      ghost_lag: { ...prev.ghost_lag, context_window: parseInt(e.target.value) }
                    }))}
                    className="input"
                    min="512"
                    max="32768"
                  />
                </div>
              </div>
            </div>

            {/* CEO LAG Settings */}
            <div className="card">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>CEO LAG Settings</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Concurrent Tasks
                  </label>
                  <input
                    type="number"
                    value={agentSettings.ceo_lag.max_concurrent_tasks}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      ceo_lag: { ...prev.ceo_lag, max_concurrent_tasks: parseInt(e.target.value) }
                    }))}
                    className="input"
                    min="1"
                    max="20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Task Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={agentSettings.ceo_lag.task_timeout_seconds}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      ceo_lag: { ...prev.ceo_lag, task_timeout_seconds: parseInt(e.target.value) }
                    }))}
                    className="input"
                    min="30"
                    max="3600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Health Check Interval (seconds)
                  </label>
                  <input
                    type="number"
                    value={agentSettings.ceo_lag.health_check_interval_seconds}
                    onChange={(e) => setAgentSettings(prev => ({ 
                      ...prev, 
                      ceo_lag: { ...prev.ceo_lag, health_check_interval_seconds: parseInt(e.target.value) }
                    }))}
                    className="input"
                    min="5"
                    max="300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>System Logs</span>
            </h2>
            
            <div className="bg-muted/50 border border-border p-4 h-64 overflow-y-auto">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">[INFO]</span>
                  <span className="text-foreground">System initialized successfully</span>
                  <span className="text-muted-foreground">2024-01-15 10:30:00</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">[DEBUG]</span>
                  <span className="text-foreground">Loading agent configurations</span>
                  <span className="text-muted-foreground">2024-01-15 10:30:01</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">[WARN]</span>
                  <span className="text-foreground">Database backup overdue</span>
                  <span className="text-muted-foreground">2024-01-15 10:30:02</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">[INFO]</span>
                  <span className="text-foreground">VITRA LAG agent started</span>
                  <span className="text-muted-foreground">2024-01-15 10:30:03</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">[INFO]</span>
                  <span className="text-foreground">GHOST LAG agent started</span>
                  <span className="text-muted-foreground">2024-01-15 10:30:04</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">[INFO]</span>
                  <span className="text-foreground">CEO LAG agent started</span>
                  <span className="text-muted-foreground">2024-01-15 10:30:05</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="btn-secondary flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Logs</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Export Logs</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {saved && (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Settings saved successfully</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <div className="animate-spin h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  )
} 
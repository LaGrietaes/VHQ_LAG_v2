import { useState } from 'react'
import { 
  Play, 
  Square, 
  Plus, 
  Settings, 
  Activity, 
  Clock,
  FileText,
  Workflow,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface WorkflowStep {
  id: string
  name: string
  agent_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input_file?: string
  output_file?: string
  duration?: number
  error?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'completed' | 'failed'
  steps: WorkflowStep[]
  created_at: string
  updated_at: string
  total_duration?: number
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Video Transcription Pipeline',
    description: 'Transcribe video files and generate SRT subtitles',
    status: 'running',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z',
    total_duration: 180,
    steps: [
      {
        id: '1-1',
        name: 'Video Processing',
        agent_type: 'vitra_lag',
        status: 'completed',
        input_file: 'video.mp4',
        output_file: 'video_processed.mp4',
        duration: 45
      },
      {
        id: '1-2',
        name: 'Audio Extraction',
        agent_type: 'vitra_lag',
        status: 'completed',
        input_file: 'video_processed.mp4',
        output_file: 'audio.wav',
        duration: 30
      },
      {
        id: '1-3',
        name: 'Transcription',
        agent_type: 'vitra_lag',
        status: 'running',
        input_file: 'audio.wav',
        duration: 60
      },
      {
        id: '1-4',
        name: 'SRT Generation',
        agent_type: 'vitra_lag',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    name: 'Content Generation Workflow',
    description: 'Generate content from transcriptions using AI',
    status: 'draft',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    steps: [
      {
        id: '2-1',
        name: 'Content Analysis',
        agent_type: 'ghost_lag',
        status: 'pending'
      },
      {
        id: '2-2',
        name: 'Template Generation',
        agent_type: 'ghost_lag',
        status: 'pending'
      },
      {
        id: '2-3',
        name: 'Content Creation',
        agent_type: 'ghost_lag',
        status: 'pending'
      }
    ]
  }
]

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'status-processing'
      case 'completed':
        return 'status-running'
      case 'failed':
        return 'status-stopped'
      case 'draft':
        return 'text-muted-foreground'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'running':
        return <Activity className="h-4 w-4 text-yellow-400 animate-pulse" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const startWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'running' as const } : w
    ))
  }

  const stopWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'draft' as const } : w
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground">Manage automated processing pipelines</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => {
          const isSelected = selectedWorkflow === workflow.id
          const completedSteps = workflow.steps.filter(s => s.status === 'completed').length
          const totalSteps = workflow.steps.length
          const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
          
          return (
            <div 
              key={workflow.id} 
              className={`card cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedWorkflow(isSelected ? null : workflow.id)}
            >
              {/* Workflow Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Workflow className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                <span className={getStatusClass(workflow.status)}>
                  {workflow.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{completedSteps}/{totalSteps} steps</span>
                </div>
                <div className="w-full bg-muted border border-border">
                  <div 
                    className="bg-primary h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Workflow Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {workflow.total_duration ? formatDuration(workflow.total_duration) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {workflow.steps.length} steps
                  </span>
                </div>
              </div>

              {/* Workflow Actions */}
              <div className="flex space-x-2">
                {workflow.status === 'running' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      stopWorkflow(workflow.id)
                    }}
                    className="btn-secondary flex items-center space-x-1 flex-1 justify-center"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startWorkflow(workflow.id)
                    }}
                    className="btn-primary flex items-center space-x-1 flex-1 justify-center"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start</span>
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Open workflow settings
                  }}
                  className="btn-secondary px-3"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              {/* Workflow Steps */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Steps</h4>
                  <div className="space-y-2">
                    {workflow.steps.map((step) => (
                      <div key={step.id} className="flex items-center justify-between p-2 bg-muted/50 border border-border">
                        <div className="flex items-center space-x-2">
                          {getStepStatusIcon(step.status)}
                          <span className="text-sm text-foreground">{step.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {step.duration && (
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(step.duration)}
                            </span>
                          )}
                          <span className={`text-xs ${getStatusClass(step.status)}`}>
                            {step.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Create New Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter workflow name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Enter workflow description"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button className="btn-primary flex-1">
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
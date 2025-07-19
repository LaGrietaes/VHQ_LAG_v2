import { useState } from 'react'
import { 
  Upload, 
  FileText, 
  Video, 
  Music, 
  Image, 
  Play,
  Square,
  Clock,
  X,
  Download,
  Trash2
} from 'lucide-react'

interface FileRecord {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'document'
  size: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  agent_type?: string
  created_at: string
  processed_at?: string
  duration?: number
  error?: string
}

const mockFiles: FileRecord[] = [
  {
    id: '1',
    name: 'presentation_video.mp4',
    type: 'video',
    size: 157286400, // 150MB
    status: 'completed',
    agent_type: 'vitra_lag',
    created_at: '2024-01-15T10:30:00Z',
    processed_at: '2024-01-15T10:45:00Z',
    duration: 900 // 15 minutes
  },
  {
    id: '2',
    name: 'interview_audio.wav',
    type: 'audio',
    size: 52428800, // 50MB
    status: 'processing',
    agent_type: 'vitra_lag',
    created_at: '2024-01-15T11:00:00Z',
    duration: 600 // 10 minutes
  },
  {
    id: '3',
    name: 'meeting_recording.mp3',
    type: 'audio',
    size: 31457280, // 30MB
    status: 'pending',
    created_at: '2024-01-15T11:15:00Z'
  },
  {
    id: '4',
    name: 'document_scan.pdf',
    type: 'document',
    size: 2097152, // 2MB
    status: 'failed',
    agent_type: 'ghost_lag',
    created_at: '2024-01-15T09:00:00Z',
    error: 'Unsupported file format'
  }
]

export default function Files() {
  const [files, setFiles] = useState<FileRecord[]>(mockFiles)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-6 w-6 text-blue-400" />
      case 'audio':
        return <Music className="h-6 w-6 text-green-400" />
      case 'image':
        return <Image className="h-6 w-6 text-purple-400" />
      default:
        return <FileText className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-running'
      case 'processing':
        return 'status-processing'
      case 'failed':
        return 'status-stopped'
      default:
        return 'text-muted-foreground'
    }
  }



  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const processFile = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'processing' as const } : f
    ))
  }

  const stopProcessing = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'pending' as const } : f
    ))
  }

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    if (selectedFile === fileId) {
      setSelectedFile(null)
    }
  }

  const handleFileUpload = (files: FileList) => {
    const newFiles: FileRecord[] = Array.from(files).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 
            file.type.startsWith('audio/') ? 'audio' : 
            file.type.startsWith('image/') ? 'image' : 'document',
      size: file.size,
      status: 'pending' as const,
      created_at: new Date().toISOString()
    }))
    
    setFiles(prev => [...newFiles, ...prev])
    setShowUploadModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Files</h1>
          <p className="text-muted-foreground">Manage and process media files</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {files.map((file) => {
          const isSelected = selectedFile === file.id
          
          return (
            <div 
              key={file.id} 
              className={`card cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedFile(isSelected ? null : file.id)}
            >
              {/* File Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <h3 className="font-semibold text-foreground truncate">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <span className={getStatusClass(file.status)}>
                  {file.status}
                </span>
              </div>

              {/* File Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>
                {file.duration && (
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(file.duration)}
                    </span>
                  </div>
                )}
              </div>

              {/* File Actions */}
              <div className="flex space-x-2">
                {file.status === 'processing' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      stopProcessing(file.id)
                    }}
                    className="btn-secondary flex items-center space-x-1 flex-1 justify-center"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
                ) : file.status === 'pending' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      processFile(file.id)
                    }}
                    className="btn-primary flex items-center space-x-1 flex-1 justify-center"
                  >
                    <Play className="h-4 w-4" />
                    <span>Process</span>
                  </button>
                ) : file.status === 'completed' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Download processed file
                    }}
                    className="btn-secondary flex items-center space-x-1 flex-1 justify-center"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      processFile(file.id)
                    }}
                    className="btn-primary flex items-center space-x-1 flex-1 justify-center"
                  >
                    <Play className="h-4 w-4" />
                    <span>Retry</span>
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(file.id)
                  }}
                  className="btn-secondary px-3 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* File Details */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground capitalize">{file.type}</span>
                    </div>
                    {file.agent_type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Agent:</span>
                        <span className="text-foreground">{file.agent_type}</span>
                      </div>
                    )}
                    {file.processed_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Processed:</span>
                        <span className="text-foreground">
                          {new Date(file.processed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {file.error && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Error:</span>
                        <span className="text-red-400">{file.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed border-border p-8 text-center transition-colors duration-200 ${
                  dragOver ? 'border-primary bg-primary/10' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFileUpload(e.dataTransfer.files)
                }}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground mb-2">Drag and drop files here</p>
                <p className="text-sm text-muted-foreground">or</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn-primary inline-flex items-center space-x-2 mt-4">
                  <span>Browse Files</span>
                </label>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
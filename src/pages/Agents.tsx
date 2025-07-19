import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface AgentStatus {
  name: string;
  status: string;
  last_activity: string;
  memory_usage: number;
  cpu_usage: number;
}

interface AgentInfo {
  [key: string]: any;
}

interface QueueStatus {
  queue_stats: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    total: number;
  };
  agents: Array<{
    name: string;
    status: string;
    health_score: number;
    memory_usage: number;
    cpu_usage: number;
    last_activity: string;
    capabilities: string[];
    current_task?: string;
  }>;
  max_concurrent_tasks: number;
}

interface SystemMetrics {
  total_memory: number;
  used_memory: number;
  cpu_usage: number;
  disk_usage: number;
  active_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  uptime: number;
}

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [ghostModels, setGhostModels] = useState<string[]>([]);
  const [vitraLanguages, setVitraLanguages] = useState<string[]>([]);

  const agentNames = ['vitra_lag', 'ghost_lag', 'ceo_lag'];

  useEffect(() => {
    loadAgentData();
    const interval = setInterval(loadAgentData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      
      // Load agent statuses
      const statusPromises = agentNames.map(name => 
        invoke<AgentStatus>('get_agent_status', { agentName: name })
      );
      const statuses = await Promise.all(statusPromises);
      setAgents(statuses);

      // Load agent info (for future use)
      try {
        const infoPromises = agentNames.map(name => 
          invoke<AgentInfo>('get_agent_info', { agentName: name })
        );
        await Promise.all(infoPromises);
      } catch (error) {
        console.log('Agent info not available:', error);
      }

      // Load queue status
      const queue = await invoke<QueueStatus>('get_queue_status');
      setQueueStatus(queue);

      // Load system metrics
      const metrics = await invoke<SystemMetrics>('get_system_metrics');
      setSystemMetrics(metrics);

      // Load additional data
      try {
        const models = await invoke<string[]>('get_ghost_models');
        setGhostModels(models);
      } catch (error) {
        console.log('Ghost models not available:', error);
      }

      try {
        const languages = await invoke<string[]>('get_vitra_languages');
        setVitraLanguages(languages);
      } catch (error) {
        console.log('VITRA languages not available:', error);
      }

    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAgent = async (agentName: string) => {
    try {
      await invoke('start_agent', { agentName });
      await loadAgentData();
    } catch (error) {
      console.error(`Error starting ${agentName}:`, error);
    }
  };

  const stopAgent = async (agentName: string) => {
    try {
      await invoke('stop_agent', { agentName });
      await loadAgentData();
    } catch (error) {
      console.error(`Error stopping ${agentName}:`, error);
    }
  };

  const clearCompletedTasks = async () => {
    try {
      await invoke('clear_completed_tasks');
      await loadAgentData();
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Agent Management</h1>
        <Button onClick={loadAgentData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      {systemMetrics && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatBytes(systemMetrics.used_memory)}</div>
                <div className="text-sm text-gray-400">Memory Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{systemMetrics.cpu_usage.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">CPU Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{systemMetrics.active_tasks}</div>
                <div className="text-sm text-gray-400">Active Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatUptime(systemMetrics.uptime)}</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Queue Status */}
      {queueStatus && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Task Queue</CardTitle>
              <Button onClick={clearCompletedTasks} variant="outline" size="sm">
                Clear Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{queueStatus.queue_stats.pending}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{queueStatus.queue_stats.running}</div>
                <div className="text-sm text-gray-400">Running</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{queueStatus.queue_stats.completed}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{queueStatus.queue_stats.failed}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{queueStatus.max_concurrent_tasks}</div>
                <div className="text-sm text-gray-400">Max Concurrent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {agents.map((agent, index) => {
           const queueAgent = queueStatus?.agents.find(a => a.name.toLowerCase().includes(agent.name.toLowerCase()));
          
          return (
            <Card key={agent.name} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                      <span className="text-sm text-gray-400 capitalize">{agent.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startAgent(agentNames[index])}
                      size="sm"
                      disabled={agent.status === 'running'}
                    >
                      Start
                    </Button>
                                         <Button
                       onClick={() => stopAgent(agentNames[index])}
                       size="sm"
                       variant="outline"
                       disabled={agent.status === 'stopped'}
                       className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                     >
                       Stop
                     </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agent Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Memory</div>
                    <div className="text-white font-medium">{formatBytes(agent.memory_usage)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">CPU</div>
                    <div className="text-white font-medium">{agent.cpu_usage.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Health Score */}
                {queueAgent && (
                  <div>
                    <div className="text-sm text-gray-400">Health Score</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${queueAgent.health_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">{(queueAgent.health_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                {queueAgent?.capabilities && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Capabilities</div>
                    <div className="flex flex-wrap gap-1">
                      {queueAgent.capabilities.map((cap, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Task */}
                {queueAgent?.current_task && (
                  <div>
                    <div className="text-sm text-gray-400">Current Task</div>
                    <div className="text-white text-sm truncate">{queueAgent.current_task}</div>
                  </div>
                )}

                {/* Agent-specific info */}
                {agent.name === 'VITRA_LAG' && vitraLanguages.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-400">Supported Languages</div>
                    <div className="flex flex-wrap gap-1">
                      {vitraLanguages.slice(0, 5).map((lang, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {vitraLanguages.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{vitraLanguages.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {agent.name === 'GHOST_LAG' && ghostModels.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-400">Available Models</div>
                    <div className="flex flex-wrap gap-1">
                      {ghostModels.slice(0, 3).map((model, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                      {ghostModels.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{ghostModels.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Activity */}
                <div>
                  <div className="text-sm text-gray-400">Last Activity</div>
                  <div className="text-white text-sm">
                    {new Date(agent.last_activity).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Agents; 
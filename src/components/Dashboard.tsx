import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Button } from './ui/button'
import { Server, BackupConfig, BackupJob } from '../App'
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle, Play } from '@phosphor-icons/react'

type DashboardProps = {
  servers: Server[]
  configs: BackupConfig[]
  jobs: BackupJob[]
}

export function Dashboard({ servers, configs, jobs }: DashboardProps) {
  const onlineServers = servers.filter(s => s.status === 'online').length
  const enabledConfigs = configs.filter(c => c.enabled).length
  const recentJobs = jobs.slice(-5).reverse()
  const runningJobs = jobs.filter(j => j.status === 'running')
  const failedJobs = jobs.filter(j => j.status === 'failed').length

  const getStatusIcon = (status: BackupJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'failed':
        return <XCircle className="text-red-500" size={16} />
      case 'running':
        return <Play className="text-blue-500" size={16} />
      default:
        return <Clock className="text-gray-500" size={16} />
    }
  }

  const getStatusBadge = (status: BackupJob['status']) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      queued: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Monitor your Proxmox backup operations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Servers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineServers}</div>
            <p className="text-xs text-muted-foreground">
              of {servers.length} total servers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Configs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledConfigs}</div>
            <p className="text-xs text-muted-foreground">
              scheduled backup configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedJobs}</div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Running Jobs */}
      {runningJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Backup Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningJobs.map((job) => {
              const config = configs.find(c => c.id === job.configId)
              const server = servers.find(s => s.id === job.serverId)
              
              return (
                <div key={job.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{config?.name || 'Unknown Config'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {server?.name || 'Unknown Server'} • Started {new Date(job.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Backup Activity</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job) => {
                const config = configs.find(c => c.id === job.configId)
                const server = servers.find(s => s.id === job.serverId)
                
                return (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium text-sm">{config?.name || 'Unknown Config'}</p>
                        <p className="text-xs text-muted-foreground">
                          {server?.name || 'Unknown Server'} • {new Date(job.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p>No backup activity yet</p>
              <p className="text-sm">Configure your first backup to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
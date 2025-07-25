import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Server, BackupConfig, BackupJob } from '../App'
import { Database, CheckCircle, XCircle, Clock, Eye, Download } from '@phosphor-icons/react'

type BackupHistoryProps = {
  jobs: BackupJob[]
  configs: BackupConfig[]
  servers: Server[]
}

export function BackupHistory({ jobs, configs, servers }: BackupHistoryProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedServer, setSelectedServer] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null)

  const filteredJobs = jobs.filter(job => {
    const config = configs.find(c => c.id === job.configId)
    const server = servers.find(s => s.id === job.serverId)
    
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
    const matchesServer = selectedServer === 'all' || job.serverId === selectedServer
    const matchesSearch = !searchTerm || 
      config?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesServer && matchesSearch
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

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

  const getStatusIcon = (status: BackupJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'failed':
        return <XCircle className="text-red-500" size={16} />
      case 'running':
        return <Clock className="text-blue-500" size={16} />
      default:
        return <Clock className="text-gray-500" size={16} />
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`
    }
    return `${diffMins}m`
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const stats = {
    total: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    running: jobs.filter(j => j.status === 'running').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Backup History</h2>
        <p className="text-muted-foreground">View and analyze your backup job history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search configurations or servers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Server</label>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Servers</SelectItem>
                  {servers.map(server => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Jobs ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Server</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const config = configs.find(c => c.id === job.configId)
                  const server = servers.find(s => s.id === job.serverId)
                  
                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">
                            {config?.name || 'Unknown Config'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{server?.name || 'Unknown Server'}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(job.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(job.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(job.startTime, job.endTime)}</TableCell>
                      <TableCell>{formatFileSize(job.size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedJob(job)}
                              >
                                <Eye size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Backup Job Details</DialogTitle>
                              </DialogHeader>
                              
                              {selectedJob && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Configuration
                                      </label>
                                      <p className="font-medium">
                                        {configs.find(c => c.id === selectedJob.configId)?.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Server
                                      </label>
                                      <p className="font-medium">
                                        {servers.find(s => s.id === selectedJob.serverId)?.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                      </label>
                                      <div className="mt-1">
                                        {getStatusBadge(selectedJob.status)}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Duration
                                      </label>
                                      <p className="font-medium">
                                        {formatDuration(selectedJob.startTime, selectedJob.endTime)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Logs
                                    </label>
                                    <ScrollArea className="h-64 mt-2 p-4 border rounded-md bg-muted">
                                      <div className="space-y-1 font-mono text-sm">
                                        {selectedJob.logs.map((log, index) => (
                                          <div key={index}>{log}</div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {job.status === 'completed' && (
                            <Button variant="ghost" size="sm">
                              <Download size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Database size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No backup jobs found</h3>
              <p className="text-muted-foreground">
                {jobs.length === 0 
                  ? 'No backup jobs have been executed yet'
                  : 'No jobs match your current filters'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
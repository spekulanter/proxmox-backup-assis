import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Server, BackupConfig } from '../App'
import { Plus, Clock, Server as ServerIcon, Play, Pause, Trash, Shield } from '@phosphor-icons/react'
import { toast } from 'sonner'

type BackupConfigurationsProps = {
  servers: Server[]
  configs: BackupConfig[]
}

export function BackupConfigurations({ servers, configs }: BackupConfigurationsProps) {
  const [, setConfigs] = useKV<BackupConfig[]>('backup-configs', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<BackupConfig | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    serverId: '',
    backupType: 'all' as BackupConfig['backupType'],
    scheduleEnabled: false,
    frequency: 'daily' as BackupConfig['schedule']['frequency'],
    time: '02:00',
    day: 1,
    retentionCount: 7,
    retentionUnit: 'days' as BackupConfig['retention']['unit'],
    enabled: true
  })

  const resetForm = () => {
    setFormData({
      name: '',
      serverId: '',
      backupType: 'all',
      scheduleEnabled: false,
      frequency: 'daily',
      time: '02:00',
      day: 1,
      retentionCount: 7,
      retentionUnit: 'days',
      enabled: true
    })
    setEditingConfig(null)
  }

  const handleEdit = (config: BackupConfig) => {
    setFormData({
      name: config.name,
      serverId: config.serverId,
      backupType: config.backupType,
      scheduleEnabled: config.schedule.enabled,
      frequency: config.schedule.frequency,
      time: config.schedule.time,
      day: config.schedule.day || 1,
      retentionCount: config.retention.count,
      retentionUnit: config.retention.unit,
      enabled: config.enabled
    })
    setEditingConfig(config)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.serverId) {
      toast.error('Please fill in all required fields')
      return
    }

    const configData: BackupConfig = {
      id: editingConfig?.id || Date.now().toString(),
      name: formData.name,
      serverId: formData.serverId,
      backupType: formData.backupType,
      schedule: {
        enabled: formData.scheduleEnabled,
        frequency: formData.frequency,
        time: formData.time,
        day: formData.frequency === 'weekly' ? formData.day : undefined
      },
      retention: {
        count: formData.retentionCount,
        unit: formData.retentionUnit
      },
      enabled: formData.enabled
    }

    setConfigs(currentConfigs => {
      if (editingConfig) {
        return currentConfigs.map(c => c.id === editingConfig.id ? configData : c)
      } else {
        return [...currentConfigs, configData]
      }
    })

    toast.success(editingConfig ? 'Configuration updated' : 'Configuration created')
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setConfigs(currentConfigs => currentConfigs.filter(c => c.id !== id))
    toast.success('Configuration deleted')
  }

  const toggleConfig = (id: string) => {
    setConfigs(currentConfigs => 
      currentConfigs.map(c => 
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    )
  }

  const getBackupTypeLabel = (type: BackupConfig['backupType']) => {
    const labels = {
      vms: 'Virtual Machines',
      containers: 'LXC Containers',
      host: 'Host Configuration',
      all: 'Everything'
    }
    return labels[type]
  }

  const getScheduleText = (config: BackupConfig) => {
    if (!config.schedule.enabled) return 'Manual only'
    
    const { frequency, time, day } = config.schedule
    const timeStr = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    switch (frequency) {
      case 'daily':
        return `Daily at ${timeStr}`
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return `${days[day || 0]} at ${timeStr}`
      case 'monthly':
        return `Monthly on day ${day || 1} at ${timeStr}`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Backup Configurations</h2>
          <p className="text-muted-foreground">Manage your backup schedules and settings</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus size={16} className="mr-2" />
              New Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Edit Backup Configuration' : 'Create Backup Configuration'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Daily VM Backup"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="server">Proxmox Server</Label>
                <Select
                  value={formData.serverId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serverId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select server" />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.map(server => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name} ({server.host})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backupType">Backup Type</Label>
                <Select
                  value={formData.backupType}
                  onValueChange={(value: BackupConfig['backupType']) => 
                    setFormData(prev => ({ ...prev, backupType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everything</SelectItem>
                    <SelectItem value="vms">Virtual Machines</SelectItem>
                    <SelectItem value="containers">LXC Containers</SelectItem>
                    <SelectItem value="host">Host Configuration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Enable Scheduling</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.scheduleEnabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, scheduleEnabled: checked }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.scheduleEnabled ? 'Automatic' : 'Manual only'}
                  </span>
                </div>
              </div>
              
              {formData.scheduleEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value: BackupConfig['schedule']['frequency']) => 
                        setFormData(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  
                  {formData.frequency !== 'daily' && (
                    <div className="space-y-2 col-span-2">
                      <Label>
                        {formData.frequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
                      </Label>
                      <Select
                        value={formData.day.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, day: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.frequency === 'weekly' ? (
                            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                              .map((day, index) => (
                                <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                              ))
                          ) : (
                            Array.from({ length: 31 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                Day {i + 1}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              
              <div className="space-y-2">
                <Label>Retention Count</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.retentionCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, retentionCount: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Retention Unit</Label>
                <Select
                  value={formData.retentionUnit}
                  onValueChange={(value: BackupConfig['retention']['unit']) => 
                    setFormData(prev => ({ ...prev, retentionUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingConfig ? 'Update' : 'Create'} Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configurations List */}
      <div className="space-y-4">
        {configs.length > 0 ? (
          configs.map((config) => {
            const server = servers.find(s => s.id === config.serverId)
            
            return (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <Badge variant={config.enabled ? 'default' : 'secondary'}>
                        {config.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleConfig(config.id)}
                      >
                        {config.enabled ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(config)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <ServerIcon size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {server?.name || 'Unknown Server'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {getBackupTypeLabel(config.backupType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {getScheduleText(config)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Retention: {config.retention.count} {config.retention.unit}
                      </span>
                      {config.lastRun && (
                        <span>
                          Last run: {new Date(config.lastRun).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No backup configurations</h3>
              <p className="text-muted-foreground mb-4">
                Create your first backup configuration to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Configuration
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
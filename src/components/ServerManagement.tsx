import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Server } from '../App'
import { Plus, Server as ServerIcon, CheckCircle, XCircle, Clock, Trash, Edit, Wifi } from '@phosphor-icons/react'
import { toast } from 'sonner'

type ServerManagementProps = {
  servers: Server[]
}

export function ServerManagement({ servers }: ServerManagementProps) {
  const [, setServers] = useKV<Server[]>('proxmox-servers', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 8006,
    username: '',
    password: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      host: '',
      port: 8006,
      username: '',
      password: ''
    })
    setEditingServer(null)
  }

  const handleEdit = (server: Server) => {
    setFormData({
      name: server.name,
      host: server.host,
      port: server.port,
      username: server.username,
      password: server.password
    })
    setEditingServer(server)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.host || !formData.username || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    const serverData: Server = {
      id: editingServer?.id || Date.now().toString(),
      name: formData.name,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      password: formData.password,
      status: 'offline',
      lastChecked: new Date().toISOString()
    }

    setServers(currentServers => {
      if (editingServer) {
        return currentServers.map(s => s.id === editingServer.id ? serverData : s)
      } else {
        return [...currentServers, serverData]
      }
    })

    toast.success(editingServer ? 'Server updated' : 'Server added')
    setIsDialogOpen(false)
    resetForm()
    
    // Simulate connection test
    setTimeout(() => {
      testConnection(serverData.id)
    }, 1000)
  }

  const handleDelete = (id: string) => {
    setServers(currentServers => currentServers.filter(s => s.id !== id))
    toast.success('Server removed')
  }

  const testConnection = (serverId: string) => {
    setServers(currentServers => 
      currentServers.map(s => 
        s.id === serverId 
          ? { ...s, status: 'checking', lastChecked: new Date().toISOString() } 
          : s
      )
    )

    // Simulate connection test (random result for demo)
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate for demo
      setServers(currentServers => 
        currentServers.map(s => 
          s.id === serverId 
            ? { 
                ...s, 
                status: success ? 'online' : 'offline',
                lastChecked: new Date().toISOString()
              } 
            : s
        )
      )
      
      if (success) {
        toast.success('Connection successful')
      } else {
        toast.error('Connection failed')
      }
    }, 2000)
  }

  const getStatusIcon = (status: Server['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="text-green-500" size={16} />
      case 'offline':
        return <XCircle className="text-red-500" size={16} />
      case 'checking':
        return <Clock className="text-blue-500 animate-spin" size={16} />
      default:
        return <XCircle className="text-gray-500" size={16} />
    }
  }

  const getStatusBadge = (status: Server['status']) => {
    const variants = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      checking: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const onlineCount = servers.filter(s => s.status === 'online').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Server Management</h2>
          <p className="text-muted-foreground">Manage your Proxmox server connections</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus size={16} className="mr-2" />
              Add Server
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingServer ? 'Edit Proxmox Server' : 'Add Proxmox Server'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Server Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Production Proxmox"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host/IP Address</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="192.168.1.100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 8006 }))}
                    placeholder="8006"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="root@pam"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingServer ? 'Update' : 'Add'} Server
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{servers.length - onlineCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Servers List */}
      <div className="space-y-4">
        {servers.length > 0 ? (
          servers.map((server) => (
            <Card key={server.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(server.status)}
                      {server.name}
                    </CardTitle>
                    {getStatusBadge(server.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testConnection(server.id)}
                      disabled={server.status === 'checking'}
                    >
                      <Wifi size={16} />
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(server)}
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(server.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Connection
                    </label>
                    <p className="font-mono text-sm">
                      {server.host}:{server.port}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Username
                    </label>
                    <p className="text-sm">{server.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Checked
                    </label>
                    <p className="text-sm">
                      {server.lastChecked 
                        ? new Date(server.lastChecked).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ServerIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No servers configured</h3>
              <p className="text-muted-foreground mb-4">
                Add your first Proxmox server to start managing backups
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Server
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
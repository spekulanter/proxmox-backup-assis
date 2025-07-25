import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dashboard } from './components/Dashboard'
import { BackupConfigurations } from './components/BackupConfigurations'
import { BackupHistory } from './components/BackupHistory'
import { ServerManagement } from './components/ServerManagement'
import { Navigation } from './components/Navigation'
import { Toaster } from './components/ui/sonner'

export type Server = {
  id: string
  name: string
  host: string
  port: number
  username: string
  password: string
  status: 'online' | 'offline' | 'checking'
  lastChecked?: string
}

export type BackupConfig = {
  id: string
  name: string
  serverId: string
  backupType: 'vms' | 'containers' | 'host' | 'all'
  schedule: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    day?: number
  }
  retention: {
    count: number
    unit: 'days' | 'weeks' | 'months'
  }
  enabled: boolean
  lastRun?: string
  nextRun?: string
}

export type BackupJob = {
  id: string
  configId: string
  serverId: string
  status: 'running' | 'completed' | 'failed' | 'queued'
  startTime: string
  endTime?: string
  progress: number
  logs: string[]
  size?: number
}

type ActiveTab = 'dashboard' | 'configurations' | 'history' | 'servers'

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [servers] = useKV<Server[]>('proxmox-servers', [
    {
      id: '1',
      name: 'Production Server',
      host: '192.168.1.100',
      port: 8006,
      username: 'root@pam',
      password: 'demo123',
      status: 'online',
      lastChecked: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Development Server',
      host: '192.168.1.101',
      port: 8006,
      username: 'root@pam',
      password: 'demo123',
      status: 'offline',
      lastChecked: new Date(Date.now() - 3600000).toISOString()
    }
  ])
  const [configs] = useKV<BackupConfig[]>('backup-configs', [
    {
      id: '1',
      name: 'Daily VM Backup',
      serverId: '1',
      backupType: 'vms',
      schedule: {
        enabled: true,
        frequency: 'daily',
        time: '02:00'
      },
      retention: {
        count: 7,
        unit: 'days'
      },
      enabled: true,
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: new Date(Date.now() + 3600000).toISOString()
    },
    {
      id: '2',
      name: 'Weekly Full Backup',
      serverId: '1',
      backupType: 'all',
      schedule: {
        enabled: true,
        frequency: 'weekly',
        time: '01:00',
        day: 0
      },
      retention: {
        count: 4,
        unit: 'weeks'
      },
      enabled: true,
      lastRun: new Date(Date.now() - 604800000).toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString()
    }
  ])
  const [jobs] = useKV<BackupJob[]>('backup-jobs', [
    {
      id: '1',
      configId: '1',
      serverId: '1',
      status: 'completed',
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() - 86400000 + 1800000).toISOString(),
      progress: 100,
      logs: [
        'Starting VM backup...',
        'Backing up VM 100 (web-server)',
        'Backing up VM 101 (database)',
        'Backup completed successfully',
        'Total size: 2.3 GB'
      ],
      size: 2468013568
    },
    {
      id: '2',
      configId: '2',
      serverId: '1',
      status: 'failed',
      startTime: new Date(Date.now() - 172800000).toISOString(),
      endTime: new Date(Date.now() - 172800000 + 900000).toISOString(),
      progress: 45,
      logs: [
        'Starting full backup...',
        'Backing up VMs...',
        'Error: Insufficient storage space',
        'Backup failed'
      ],
      size: 0
    },
    {
      id: '3',
      configId: '1',
      serverId: '1',
      status: 'running',
      startTime: new Date().toISOString(),
      progress: 67,
      logs: [
        'Starting VM backup...',
        'Backing up VM 100 (web-server)',
        'Progress: 67%'
      ]
    }
  ])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard servers={servers} configs={configs} jobs={jobs} />
      case 'configurations':
        return <BackupConfigurations servers={servers} configs={configs} />
      case 'history':
        return <BackupHistory jobs={jobs} configs={configs} servers={servers} />
      case 'servers':
        return <ServerManagement servers={servers} />
      default:
        return <Dashboard servers={servers} configs={configs} jobs={jobs} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
      <Toaster />
    </div>
  )
}

export default App
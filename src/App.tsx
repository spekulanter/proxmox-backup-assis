import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dashboard } from './components/Dashboard'
import { BackupConfigurations } from './components/BackupConfigurations'
import { BackupHistory } from './components/BackupHistory'
import { ServerManagement } from './components/ServerManagement'
import { InstallationScript } from './components/InstallationScript'
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
  backupType: 'network' | 'storage' | 'users' | 'certs' | 'system' | 'full-config'
  configPaths: string[]
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

type ActiveTab = 'dashboard' | 'configurations' | 'history' | 'servers' | 'install'

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
      name: 'Network Configuration Backup',
      serverId: '1',
      backupType: 'network',
      configPaths: ['/etc/network/interfaces', '/etc/hosts', '/etc/hostname'],
      schedule: {
        enabled: true,
        frequency: 'daily',
        time: '02:00'
      },
      retention: {
        count: 30,
        unit: 'days'
      },
      enabled: true,
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: new Date(Date.now() + 3600000).toISOString()
    },
    {
      id: '2',
      name: 'Storage & Cluster Configuration',
      serverId: '1',
      backupType: 'storage',
      configPaths: ['/etc/pve/storage.cfg', '/etc/pve/datacenter.cfg', '/etc/pve/corosync.conf'],
      schedule: {
        enabled: true,
        frequency: 'weekly',
        time: '01:00',
        day: 0
      },
      retention: {
        count: 12,
        unit: 'weeks'
      },
      enabled: true,
      lastRun: new Date(Date.now() - 604800000).toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: '3',
      name: 'Complete System Configuration',
      serverId: '1',
      backupType: 'full-config',
      configPaths: [
        '/etc/pve/',
        '/etc/network/',
        '/etc/hosts',
        '/etc/hostname',
        '/etc/resolv.conf',
        '/etc/postfix/',
        '/etc/ssh/',
        '/etc/ssl/certs/'
      ],
      schedule: {
        enabled: true,
        frequency: 'weekly',
        time: '03:00',
        day: 6
      },
      retention: {
        count: 8,
        unit: 'weeks'
      },
      enabled: true,
      lastRun: new Date(Date.now() - 604800000).toISOString(),
      nextRun: new Date(Date.now() + 172800000).toISOString()
    }
  ])
  const [jobs] = useKV<BackupJob[]>('backup-jobs', [
    {
      id: '1',
      configId: '1',
      serverId: '1',
      status: 'completed',
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() - 86400000 + 180000).toISOString(),
      progress: 100,
      logs: [
        'Starting network configuration backup...',
        'Backing up /etc/network/interfaces',
        'Backing up /etc/hosts',
        'Backing up /etc/hostname',
        'Network configuration backup completed successfully',
        'Total size: 8.2 KB'
      ],
      size: 8396
    },
    {
      id: '2',
      configId: '2',
      serverId: '1',
      status: 'completed',
      startTime: new Date(Date.now() - 172800000).toISOString(),
      endTime: new Date(Date.now() - 172800000 + 240000).toISOString(),
      progress: 100,
      logs: [
        'Starting storage & cluster configuration backup...',
        'Backing up /etc/pve/storage.cfg',
        'Backing up /etc/pve/datacenter.cfg',
        'Backing up /etc/pve/corosync.conf',
        'Storage configuration backup completed',
        'Total size: 12.4 KB'
      ],
      size: 12704
    },
    {
      id: '3',
      configId: '3',
      serverId: '1',
      status: 'running',
      startTime: new Date().toISOString(),
      progress: 78,
      logs: [
        'Starting complete system configuration backup...',
        'Backing up /etc/pve/ directory...',
        'Backing up network configuration...',
        'Backing up SSL certificates...',
        'Progress: 78%'
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
      case 'install':
        return <InstallationScript />
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
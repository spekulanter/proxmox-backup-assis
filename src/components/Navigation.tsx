import { Button } from './ui/button'
import { Server, Shield, Clock, Database, Terminal } from '@phosphor-icons/react'

type NavigationProps = {
  activeTab: string
  onTabChange: (tab: 'dashboard' | 'configurations' | 'history' | 'servers' | 'install') => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'configurations', label: 'Backup Configs', icon: Clock },
    { id: 'history', label: 'History', icon: Database },
    { id: 'servers', label: 'Servers', icon: Server },
    { id: 'install', label: 'Install Script', icon: Terminal },
  ] as const

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield size={32} className="text-primary" />
            <h1 className="text-xl font-bold text-foreground">Proxmox Backup Manager</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange(id as any)}
                className="flex items-center gap-2"
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
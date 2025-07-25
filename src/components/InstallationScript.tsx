import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { toast } from 'sonner'
import { Download, Copy, Server, FileText, Terminal, Globe } from '@phosphor-icons/react'

export type InstallScript = {
  id: string
  name: string
  description: string
  domain: string
  repositoryUrl: string
  scriptContent: string
  installCommand: string
  createdAt: string
  updatedAt: string
}

export function InstallationScript() {
  const [scripts, setScripts] = useKV<InstallScript[]>('installation-scripts', [])
  const [newScript, setNewScript] = useState({
    name: 'Proxmox Backup Manager',
    description: 'Complete Proxmox configuration backup and restore solution',
    domain: 'proxmox-backup.example.com',
    repositoryUrl: 'https://github.com/user/proxmox-backup-manager'
  })

  const generateScriptContent = () => {
    const scriptContent = `#!/bin/bash

# Proxmox Configuration Backup Manager Installation Script
# Version: 1.0.0
# Author: Your Name
# Description: Automated installation script for Proxmox backup management system

set -e  # Exit on any error

# Color definitions for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "\${BLUE}[INFO]\${NC} \$1"
}

log_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} \$1"
}

log_warning() {
    echo -e "\${YELLOW}[WARNING]\${NC} \$1"
}

log_error() {
    echo -e "\${RED}[ERROR]\${NC} \$1"
}

# Check if running as root
check_root() {
    if [[ \$EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# Detect OS and version
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=\$ID
        VERSION=\$VERSION_ID
    else
        log_error "Cannot detect operating system"
        exit 1
    fi
    
    log_info "Detected OS: \$OS \$VERSION"
}

# Check if we're running on Proxmox
check_proxmox() {
    if [[ ! -f /etc/pve/local/pve-ssl.pem ]]; then
        log_warning "This doesn't appear to be a Proxmox VE system"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! \$REPLY =~ ^[Yy]\$ ]]; then
            exit 1
        fi
    else
        log_success "Proxmox VE detected"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing required dependencies..."
    
    apt-get update -qq
    apt-get install -y \\
        curl \\
        wget \\
        tar \\
        gzip \\
        rsync \\
        cron \\
        jq \\
        python3 \\
        python3-pip \\
        python3-venv \\
        nginx \\
        certbot \\
        python3-certbot-nginx
    
    log_success "Dependencies installed successfully"
}

# Create backup user and directories
setup_backup_user() {
    log_info "Setting up backup user and directories..."
    
    # Create backup user
    useradd -r -s /bin/bash -d /opt/proxmox-backup -m proxmox-backup || true
    
    # Create necessary directories
    mkdir -p /opt/proxmox-backup/{backups,scripts,logs,config}
    mkdir -p /var/log/proxmox-backup
    
    # Set permissions
    chown -R proxmox-backup:proxmox-backup /opt/proxmox-backup
    chown -R proxmox-backup:proxmox-backup /var/log/proxmox-backup
    chmod 755 /opt/proxmox-backup
    chmod 700 /opt/proxmox-backup/backups
    
    log_success "Backup user and directories created"
}

# Download and install backup manager
install_backup_manager() {
    log_info "Downloading Proxmox Backup Manager..."
    
    cd /tmp
    wget -O proxmox-backup-manager.tar.gz "${newScript.repositoryUrl}/archive/refs/heads/main.tar.gz"
    tar -xzf proxmox-backup-manager.tar.gz
    
    # Move files to proper location
    cp -r proxmox-backup-manager-main/* /opt/proxmox-backup/
    
    # Install Python dependencies
    cd /opt/proxmox-backup
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Make scripts executable
    chmod +x /opt/proxmox-backup/scripts/*.sh
    
    log_success "Backup manager installed"
}

# Configure web interface
setup_web_interface() {
    log_info "Setting up web interface..."
    
    # Copy nginx configuration
    cat > /etc/nginx/sites-available/proxmox-backup << 'EOF'
server {
    listen 80;
    server_name ${newScript.domain};
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/proxmox-backup /etc/nginx/sites-enabled/
    nginx -t
    systemctl reload nginx
    
    log_success "Web interface configured"
}

# Setup SSL certificate
setup_ssl() {
    log_info "Setting up SSL certificate..."
    
    if [[ "${newScript.domain}" != *".local" && "${newScript.domain}" != "localhost" ]]; then
        certbot --nginx -d ${newScript.domain} --non-interactive --agree-tos --email admin@${newScript.domain}
        log_success "SSL certificate obtained"
    else
        log_warning "Skipping SSL for local domain"
    fi
}

# Create systemd service
create_service() {
    log_info "Creating systemd service..."
    
    cat > /etc/systemd/system/proxmox-backup.service << 'EOF'
[Unit]
Description=Proxmox Backup Manager
After=network.target

[Service]
Type=simple
User=proxmox-backup
WorkingDirectory=/opt/proxmox-backup
Environment=PATH=/opt/proxmox-backup/venv/bin
ExecStart=/opt/proxmox-backup/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable proxmox-backup
    systemctl start proxmox-backup
    
    log_success "Service created and started"
}

# Setup backup jobs
setup_backup_jobs() {
    log_info "Setting up backup jobs..."
    
    # Add cron jobs for automatic backups
    cat > /etc/cron.d/proxmox-backup << 'EOF'
# Proxmox Configuration Backup Jobs
0 2 * * * proxmox-backup /opt/proxmox-backup/scripts/backup-config.sh daily
0 3 * * 0 proxmox-backup /opt/proxmox-backup/scripts/backup-config.sh weekly
0 4 1 * * proxmox-backup /opt/proxmox-backup/scripts/backup-config.sh monthly
EOF
    
    log_success "Backup jobs configured"
}

# Main installation function
main() {
    echo "=========================================="
    echo "Proxmox Configuration Backup Manager"
    echo "Installation Script"
    echo "=========================================="
    echo
    
    check_root
    detect_os
    check_proxmox
    install_dependencies
    setup_backup_user
    install_backup_manager
    setup_web_interface
    setup_ssl
    create_service
    setup_backup_jobs
    
    echo
    echo "=========================================="
    log_success "Installation completed successfully!"
    echo "=========================================="
    echo
    echo "Access your backup manager at:"
    echo "  http://${newScript.domain}"
    if [[ "${newScript.domain}" != *".local" && "${newScript.domain}" != "localhost" ]]; then
        echo "  https://${newScript.domain}"
    fi
    echo
    echo "Default credentials:"
    echo "  Username: admin"
    echo "  Password: admin (change immediately)"
    echo
    echo "Service commands:"
    echo "  Start:   systemctl start proxmox-backup"
    echo "  Stop:    systemctl stop proxmox-backup"
    echo "  Status:  systemctl status proxmox-backup"
    echo "  Logs:    journalctl -u proxmox-backup -f"
    echo
    echo "Configuration files:"
    echo "  Main config: /opt/proxmox-backup/config/"
    echo "  Backups:     /opt/proxmox-backup/backups/"
    echo "  Logs:        /var/log/proxmox-backup/"
    echo
}

# Run main function
main "\$@"`

    return scriptContent
  }

  const generateInstallCommand = (scriptId: string) => {
    const baseUrl = newScript.repositoryUrl.replace('github.com', 'raw.githubusercontent.com').replace('/archive/refs/heads/main.tar.gz', '') + '/main'
    return `bash -c "$(wget -qLO - ${baseUrl}/install.sh)"`
  }

  const createScript = () => {
    const script: InstallScript = {
      id: Date.now().toString(),
      name: newScript.name,
      description: newScript.description,
      domain: newScript.domain,
      repositoryUrl: newScript.repositoryUrl,
      scriptContent: generateScriptContent(),
      installCommand: generateInstallCommand(Date.now().toString()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setScripts(current => [...current, script])
    toast.success('Installation script created successfully!')
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard!`)
  }

  const downloadScript = (script: InstallScript) => {
    const blob = new Blob([script.scriptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'install.sh'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Script downloaded!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Installation Script Generator</h1>
        <p className="text-muted-foreground">
          Generate automated installation scripts for deploying Proxmox backup manager
        </p>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Script Generator</TabsTrigger>
          <TabsTrigger value="scripts">Generated Scripts</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Create Installation Script
              </CardTitle>
              <CardDescription>
                Configure your installation script parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="script-name">Script Name</Label>
                  <Input
                    id="script-name"
                    value={newScript.name}
                    onChange={(e) => setNewScript(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="script-domain">Domain</Label>
                  <Input
                    id="script-domain"
                    value={newScript.domain}
                    onChange={(e) => setNewScript(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="backup.example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="script-description">Description</Label>
                <Input
                  id="script-description"
                  value={newScript.description}
                  onChange={(e) => setNewScript(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repository-url">Repository URL</Label>
                <Input
                  id="repository-url"
                  value={newScript.repositoryUrl}
                  onChange={(e) => setNewScript(prev => ({ ...prev, repositoryUrl: e.target.value }))}
                  placeholder="https://github.com/user/proxmox-backup-manager"
                />
              </div>

              <Button onClick={createScript} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate Installation Script
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          {scripts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Terminal className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No installation scripts created yet.<br />
                  Use the generator to create your first script.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {scripts.map((script) => (
                <Card key={script.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5" />
                          {script.name}
                        </CardTitle>
                        <CardDescription>{script.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Globe className="w-3 h-3 mr-1" />
                        {script.domain}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>One-line Installation Command</Label>
                      <div className="flex gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm font-mono overflow-x-auto">
                          {script.installCommand}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(script.installCommand, 'Install command')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Complete Installation Script</Label>
                      <Textarea
                        value={script.scriptContent}
                        readOnly
                        className="font-mono text-xs h-32"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => downloadScript(script)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Script
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(script.scriptContent, 'Full script')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Script
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(script.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
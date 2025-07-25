import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { toast } from 'sonner'
import { Download, Copy, Server, FileText, Terminal, Globe } from '@phosphor-icons/react'

export type InstallScript = {
  id: string
  name: string
  description: string
  updatedAt: str

  const [scripts, setSc
    name: 'Proxmox Backu
    domain: 'proxmo
  })
 

# Version: 1.0.0
# Description: Automated installation script for Proxmox backup management system
set -e  # Exit on any error
# Color definitions for output
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'

log_

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
    # Install Python dependencies
    python3 -m venv venv
    
    # Make scripts ex
    
}
# Configure web interface
    log_info "Setting up web interface...
    
server {
 

        proxy_http_version 1.1;
        proxy_set_header C
        proxy_set_header X-Real-IP \$remote_addr;
    
    }
EOF
    # Enable site
    
    
}
# Se
    log_info "Setting up SSL cert
    if [[ "${newScript.dom
        log_success "SSL
        log_warning "Skippin
}
# Cr
    log_info "Creating system
    cat > /etc/systemd/system/proxmox-backup.
Desc

T

ExecStart=/opt/proxmox-ba
RestartSec=10
[Install]
EOF
    systemctl daemon-reload
    systemctl start proxmox-backup
    log_

setup_backup_jobs() {
    
    cat > /etc/c
0 2 * * * proxmox-backup /opt/proxmox-bac
0 4 1 * * proxmox-backup /opt/p
    
}
# Main installation function
    echo "=======================================
    echo "Installation Script"
    echo
    check_root
    c
 
   
    
    
    echo "=========================================="
    echo "==
    echo "Access your back
    
    fi
 

    echo "Service comma
    echo "  S
    echo "  Logs:    journalctl -u proxmox-b
    
    echo "  Backups:     /opt/proxmox-backup/backups/"
    echo

main "\$
    return scriptContent

 

  const createScript = (
      id: Date.now
      description: newScript.description,
    
      installCommand: generateInstallCommand(Date.now().toStr
      

    toast.success('I

    navig
  }
  const downloadScr
    const url = URL.createObjectURL(
    a.href = url
    a.click()
    toast.succ


        <
          Generate automat
   
    
          <TabsTrigger valu
        </TabsList>
        <TabsContent value="genera
    
                <Terminal className="w-5 h-5"
 

            </CardH
              <div cl
                  <Label htmlFor="script
    
                    onChange={(e) => setN
                </div>
                  <Label htmlFor="s
                    id="script-domain"
                    onChange={(e) => setNewScript(prev => ({ ...prev, domain
                  />
   
    
                <Input
 


        
                  id="repository-url"
                  onChange={(e) => setNewScript
                />

        
    
          </Ca

          {script
              <CardConte
                <p cl
                  Use the 
              </CardCon
          ) :
              {scr
                  <Ca
    
        
                        </CardTitle>
                      </div>
                        <Globe className="w-3 h-3 mr-
        
                  </CardHeader>
                    <div className="spa
                      <div className="flex gap-2">
                          {script.installCom
      
        
                        >
                        </Bu
                    </div>
        
                      <Texta
                        readOnly
                      />

                      <Button
        
                        <Downlo
                      </Button>
                        variant="outline"
                      >
        
 

                   
           

        </TabsContent>
   







































































































































































































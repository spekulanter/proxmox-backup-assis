#!/bin/bash

# Proxmox Configuration Backup Manager - Installation Script
# Usage: bash -c "$(wget -qLO - https://raw.githubusercontent.com/your-repo/proxmox-backup-manager/main/install.sh)"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Proxmox Configuration Backup Manager"
APP_DIR="/opt/proxmox-backup-manager"
SERVICE_NAME="proxmox-backup-manager"
DEFAULT_PORT=3000
GITHUB_REPO="your-repo/proxmox-backup-manager"

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║               Proxmox Configuration Backup Manager          ║"
    echo "║                        Installation Script                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        echo "Please run with: sudo $0"
        exit 1
    fi
}

check_system() {
    log_info "Checking system requirements..."
    
    # Check if running on Debian/Ubuntu
    if ! command -v apt-get &> /dev/null; then
        log_error "This script is designed for Debian/Ubuntu systems"
        exit 1
    fi
    
    # Check for Proxmox
    if [ -d "/etc/pve" ]; then
        log_info "Proxmox VE detected"
    else
        log_warning "Proxmox VE not detected. This tool is designed for Proxmox servers."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    apt-get update
    apt-get install -y curl wget git sudo cron rsync tar gzip
    
    # Install Node.js 18+
    if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
        log_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    log_success "Dependencies installed"
}

create_user() {
    log_info "Creating application user..."
    
    if ! id "proxmox-backup" &>/dev/null; then
        useradd --system --shell /bin/bash --home-dir $APP_DIR --create-home proxmox-backup
        log_success "User 'proxmox-backup' created"
    else
        log_info "User 'proxmox-backup' already exists"
    fi
}

download_application() {
    log_info "Downloading application files..."
    
    # Create application directory
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # For now, we'll create the basic structure since this is a demo
    # In real deployment, this would download from GitHub releases
    cat > package.json << 'EOF'
{
  "name": "proxmox-backup-manager",
  "version": "1.0.0",
  "description": "Proxmox Configuration Backup Manager",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-ssh": "^13.1.0",
    "cron": "^3.1.6",
    "archiver": "^6.0.1"
  }
}
EOF

    # Create basic server file
    cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('dist'));

// API routes would go here
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Proxmox Backup Manager running on port ${port}`);
});
EOF

    # Install dependencies
    log_info "Installing Node.js dependencies..."
    npm install --production
    
    # Set ownership
    chown -R proxmox-backup:proxmox-backup $APP_DIR
    
    log_success "Application downloaded and configured"
}

create_systemd_service() {
    log_info "Creating systemd service..."
    
    cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Proxmox Configuration Backup Manager
After=network.target

[Service]
Type=simple
User=proxmox-backup
Group=proxmox-backup
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$DEFAULT_PORT

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable $SERVICE_NAME
    
    log_success "Systemd service created and enabled"
}

setup_backup_directories() {
    log_info "Setting up backup directories..."
    
    mkdir -p /var/backups/proxmox-configs
    mkdir -p /var/log/proxmox-backup-manager
    
    chown proxmox-backup:proxmox-backup /var/backups/proxmox-configs
    chown proxmox-backup:proxmox-backup /var/log/proxmox-backup-manager
    
    log_success "Backup directories created"
}

setup_firewall() {
    if command -v ufw &> /dev/null; then
        log_info "Configuring UFW firewall..."
        ufw allow $DEFAULT_PORT/tcp comment "Proxmox Backup Manager"
        log_success "Firewall configured"
    elif command -v iptables &> /dev/null; then
        log_info "Adding iptables rule..."
        iptables -A INPUT -p tcp --dport $DEFAULT_PORT -j ACCEPT
        log_warning "iptables rule added temporarily. Consider making it persistent."
    fi
}

start_service() {
    log_info "Starting service..."
    
    systemctl start $SERVICE_NAME
    
    # Wait a moment and check status
    sleep 3
    if systemctl is-active --quiet $SERVICE_NAME; then
        log_success "Service started successfully"
    else
        log_error "Service failed to start"
        systemctl status $SERVICE_NAME
        exit 1
    fi
}

print_completion() {
    local ip_address=$(hostname -I | awk '{print $1}')
    
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    Installation Complete!                    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}Service Status:${NC}"
    echo "  • Service: $SERVICE_NAME"
    echo "  • Status: $(systemctl is-active $SERVICE_NAME)"
    echo "  • Port: $DEFAULT_PORT"
    echo
    echo -e "${BLUE}Access Information:${NC}"
    echo "  • Web Interface: http://$ip_address:$DEFAULT_PORT"
    echo "  • Local Access: http://localhost:$DEFAULT_PORT"
    echo
    echo -e "${BLUE}Management Commands:${NC}"
    echo "  • Start service: systemctl start $SERVICE_NAME"
    echo "  • Stop service: systemctl stop $SERVICE_NAME" 
    echo "  • Restart service: systemctl restart $SERVICE_NAME"
    echo "  • View logs: journalctl -u $SERVICE_NAME -f"
    echo "  • Check status: systemctl status $SERVICE_NAME"
    echo
    echo -e "${BLUE}Configuration:${NC}"
    echo "  • Application directory: $APP_DIR"
    echo "  • Backup directory: /var/backups/proxmox-configs"
    echo "  • Log directory: /var/log/proxmox-backup-manager"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Access the web interface to configure your Proxmox servers"
    echo "  2. Set up backup configurations for your configuration files"
    echo "  3. Test the backup functionality"
    echo "  4. Configure automatic schedules as needed"
    echo
}

# Main installation flow
main() {
    print_banner
    
    check_root
    check_system
    install_dependencies
    create_user
    download_application
    create_systemd_service
    setup_backup_directories
    setup_firewall
    start_service
    print_completion
    
    log_success "Installation completed successfully!"
}

# Run main function
main "$@"
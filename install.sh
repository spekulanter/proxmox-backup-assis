#!/bin/bash




YELLOW

# Configuration
APP_DIR="/opt/pr
DEFAULT_PORT=3000
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Proxmox Configuration Backup Manager"
APP_DIR="/opt/proxmox-backup-manager"
SERVICE_NAME="proxmox-backup-manager"
DEFAULT_PORT=3000
GITHUB_REPO="your-repo/proxmox-backup-manager"

log_error() {
}
check_root() {
        log_error "This script must be run as root"
        exit 1
}
check_system() {
 

        exit
    
 

        read -p
        if [[ ! $REPLY =~ ^[Yy]$ ]]; th
 

install_depende
    
 

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"


check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        echo "Please run with: sudo $0"
        exit 1
    fi
 

check_system() {
    log_info "Checking system requirements..."
}
    # Check if running on Debian/Ubuntu
    if ! command -v apt-get &> /dev/null; then
        log_error "This script is designed for Debian/Ubuntu systems"

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
 

install_dependencies() {
    log_info "Installing dependencies..."
    
    apt-get update
    apt-get install -y curl wget git sudo cron rsync tar gzip
    
    # Install Node.js 18+
    if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    
[Unit]
After=network.target
[Servi
    
WorkingDirectory=$APP_DIR
R


NoNewPrivileges=yes
Prot
ReadWritePaths=$APP_DIR
[Install]
EOF
    syst
    
}
s

    mkdir -p /var/log/pr
    chown proxmox-backup:proxmox-backup /var/ba
    
}
setup_firewall() {
        log_inf
    
        log_info "Adding iptables rule..."
        log_warning "iptables rule added temporarily. Consider mak
}
s
    
    
    sleep 3
        log_success "S
        log_er
        exit 1
}
prin
    
    echo -e "${GREEN}╔═══
    echo -e "${GREEN}╚════
    echo -e "${BLUE}S
    echo "  • Status: $(
   
 
   

    echo "  • Restart service:
    echo "  • Check status: 
    echo -e "${BLUE}Configuration:$
    echo "  • Backup director
    echo
    echo "  1. Access the web interfac

    echo


    
    check_system
    create_user
   

    print_comple
    log_success "Installatio

mai



















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















































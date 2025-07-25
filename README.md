# Proxmox Configuration Backup Manager

A web-based application for backing up and managing Proxmox VE system configurations.

## Features

- 🔧 **System Configuration Backup**: Network, storage, cluster, and SSL configurations
- 📅 **Scheduled Backups**: Automated daily, weekly, or monthly backup schedules  
- 🖥️ **Multi-Server Management**: Manage multiple Proxmox servers from one interface
- 📊 **Backup History**: Track all backup jobs with detailed logs and status
- 🔐 **Secure Access**: SSH-based secure connections to Proxmox servers
- 📦 **Configuration Restore**: Easy restoration of backed-up configurations

## Quick Installation

For the fastest setup, use our one-line installer:

```bash
bash -c "$(wget -qLO - https://raw.githubusercontent.com/your-repo/proxmox-backup-manager/main/install.sh)"
```

This will:
- Install all dependencies (Node.js, etc.)
- Create a dedicated user account
- Set up the systemd service
- Configure firewall rules
- Start the web interface

## Manual Installation

### Prerequisites

- Debian/Ubuntu-based system
- Node.js 18+ 
- Root access for installation

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/your-repo/proxmox-backup-manager.git
cd proxmox-backup-manager
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the application:**
```bash
npm run build
```

4. **Start the server:**
```bash
npm start
```

The web interface will be available at `http://localhost:3000`

## Configuration

### Adding Proxmox Servers

1. Navigate to the "Servers" tab
2. Click "Add Server"
3. Enter your Proxmox server details:
   - **Name**: Friendly name for the server
   - **Host**: IP address or hostname
   - **Port**: SSH port (usually 22)
   - **Username**: SSH username (usually `root`)
   - **Password**: SSH password

### Setting Up Backup Configurations

1. Go to the "Configurations" tab
2. Click "Create Configuration"
3. Configure:
   - **Backup Type**: Choose what to backup (network, storage, etc.)
   - **Schedule**: Set automatic backup frequency
   - **Retention**: How long to keep backups
   - **Custom Paths**: Add specific configuration files

### Backup Types

- **Network Configuration**: `/etc/network/`, `/etc/hosts`, DNS settings
- **Storage Configuration**: `/etc/pve/storage.cfg`, datacenter settings
- **User & Authentication**: User accounts, permissions, certificates
- **SSL Certificates**: SSL/TLS certificates and keys
- **System Configuration**: Complete system configuration
- **Full Configuration**: Everything above combined

## Usage

### Dashboard

The dashboard provides an overview of:
- Server status and connectivity
- Recent backup jobs
- Upcoming scheduled backups
- Storage usage statistics

### Manual Backups

1. Select a configuration from the list
2. Click "Run Now" to start an immediate backup
3. Monitor progress in real-time
4. View detailed logs and results

### Scheduled Backups

Backups run automatically based on your schedule:
- **Daily**: Every day at specified time
- **Weekly**: Specific day of week at specified time  
- **Monthly**: Specific day of month at specified time

### Viewing History

The History tab shows:
- All completed backup jobs
- Success/failure status
- Backup size and duration
- Detailed execution logs
- Download links for backup files

## API Endpoints

The application provides REST API endpoints:

- `GET /api/health` - Service health check
- `GET /api/servers` - List configured servers
- `POST /api/servers/test` - Test server connection
- `POST /api/backup/execute` - Start manual backup
- `GET /api/backup/history` - Get backup history

## System Requirements

### Minimum Requirements
- **RAM**: 512MB
- **Storage**: 1GB (plus space for backups)
- **CPU**: 1 core
- **Network**: SSH access to Proxmox servers

### Recommended Requirements
- **RAM**: 1GB+
- **Storage**: 10GB+ (depending on backup retention)
- **CPU**: 2+ cores
- **Network**: Gigabit LAN for faster backups

## Security Considerations

- The application stores SSH credentials securely
- All connections use SSH encryption
- Backup files are stored with restricted permissions
- Regular security updates are recommended

## Troubleshooting

### Connection Issues
- Verify SSH credentials and network connectivity
- Check firewall rules on both systems
- Ensure Proxmox SSH service is running

### Backup Failures
- Check available disk space
- Verify file permissions
- Review backup logs for specific errors

### Service Issues
```bash
# Check service status
systemctl status proxmox-backup-manager

# View logs
journalctl -u proxmox-backup-manager -f

# Restart service
systemctl restart proxmox-backup-manager
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/your-repo/proxmox-backup-manager/wiki)
- 🐛 [Report Issues](https://github.com/your-repo/proxmox-backup-manager/issues)
- 💬 [Discussions](https://github.com/your-repo/proxmox-backup-manager/discussions)
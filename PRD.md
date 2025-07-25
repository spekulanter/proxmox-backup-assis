# Proxmox Configuration Backup Manager

A centralized tool for managing and scheduling Proxmox server configuration backups with monitoring and restoration capabilities.

**Experience Qualities**:
1. **Reliable** - Users need absolute confidence that their critical server configurations are safely backed up
2. **Intuitive** - Complex backup operations should feel simple and approachable for system administrators
3. **Professional** - Clean, enterprise-grade interface that inspires trust in mission-critical operations

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple backup scheduling features, configuration management, and basic monitoring without requiring user accounts or complex server infrastructure

## Essential Features

### Backup Configuration Manager
- **Functionality**: Create, edit, and manage backup configurations for multiple Proxmox servers
- **Purpose**: Centralize backup settings and make them reusable across different servers
- **Trigger**: User clicks "Add Backup Config" or edits existing configuration
- **Progression**: Select server → Configure backup type (VMs, containers, host config) → Set schedule → Define retention policy → Save configuration
- **Success criteria**: Configuration saves successfully and appears in the active configurations list

### Backup Scheduler
- **Functionality**: Schedule automatic backups with flexible timing options (daily, weekly, monthly)
- **Purpose**: Automate backup processes to ensure consistent protection without manual intervention
- **Trigger**: User enables scheduling on a backup configuration
- **Progression**: Select configuration → Choose schedule type → Set time/frequency → Configure notifications → Activate schedule
- **Success criteria**: Schedule shows as active with next run time displayed

### Backup Monitoring Dashboard
- **Functionality**: Real-time status of backup jobs, success/failure rates, and storage usage
- **Purpose**: Provide visibility into backup health and quickly identify issues
- **Trigger**: User opens the app or navigates to dashboard
- **Progression**: View dashboard → Check recent backup status → Review alerts/warnings → Take action if needed
- **Success criteria**: Dashboard displays current status and recent backup history accurately

### Backup History & Logs
- **Functionality**: Detailed logs of all backup operations with filtering and search capabilities
- **Purpose**: Troubleshoot issues and maintain audit trail of backup activities
- **Trigger**: User clicks on "View Logs" or a specific backup entry
- **Progression**: Open logs → Filter by date/server/status → View detailed log entries → Export if needed
- **Success criteria**: Logs display complete backup history with searchable, filterable interface

## Edge Case Handling
- **Network Connectivity Issues**: Display offline status and queue backup operations for retry when connection is restored
- **Storage Full Scenarios**: Alert users before storage limits are reached and suggest cleanup actions
- **Authentication Failures**: Clear error messages with guidance for credential updates
- **Corrupted Backup Files**: Automatic integrity checking with notifications for failed verifications
- **Concurrent Backup Operations**: Prevent conflicts and queue operations with clear status indicators

## Design Direction
The design should feel professional and trustworthy like enterprise monitoring tools, with a clean dashboard-focused layout that prioritizes status visibility and quick access to critical functions.

## Color Selection
Complementary (opposite colors) - Using a professional blue-orange scheme where blue conveys reliability and trust for primary actions, while orange serves as attention-grabbing alerts and warnings.

- **Primary Color**: Deep Professional Blue (oklch(0.45 0.15 250)) - Communicates reliability and trust for primary actions
- **Secondary Colors**: Light Blue (oklch(0.85 0.08 250)) for secondary buttons and Neutral Gray (oklch(0.75 0.02 250)) for backgrounds
- **Accent Color**: Alert Orange (oklch(0.65 0.18 50)) - Attention-grabbing highlight for warnings, errors, and important status indicators
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0.02 250)) - Ratio 15.8:1 ✓
  - Card (Light Gray oklch(0.98 0.01 250)): Dark Gray text (oklch(0.2 0.02 250)) - Ratio 14.2:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(1 0 0)) - Ratio 8.9:1 ✓
  - Secondary (Light Blue oklch(0.85 0.08 250)): Dark Blue text (oklch(0.3 0.15 250)) - Ratio 7.2:1 ✓
  - Accent (Alert Orange oklch(0.65 0.18 50)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓

## Font Selection
Modern technical typeface that conveys precision and clarity - Inter for its excellent readability in data-heavy interfaces and professional appearance.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal letter spacing  
  - H3 (Card Titles): Inter Medium/18px/normal letter spacing
  - Body Text: Inter Regular/16px/relaxed line height
  - Small Text (Status/Meta): Inter Regular/14px/normal letter spacing
  - Code/Technical: Inter Regular/14px/monospace fallback for technical details

## Animations
Subtle and functional animations that enhance workflow efficiency - gentle transitions that communicate state changes without disrupting focus on critical backup operations.

- **Purposeful Meaning**: Motion reinforces the reliable, professional brand with smooth state transitions and gentle loading indicators that build confidence
- **Hierarchy of Movement**: Status indicators and progress bars get priority animation focus, followed by navigation transitions, with decorative motion kept minimal

## Component Selection
- **Components**: Cards for backup configurations and status displays, Tables for backup history, Dialogs for configuration editing, Progress bars for backup status, Badges for status indicators, Buttons with clear hierarchy, Forms for server connection settings
- **Customizations**: Custom status indicator components with color-coded states, specialized backup progress components showing detailed transfer information
- **States**: Buttons show loading states during backup operations, form inputs validate server connections in real-time, status badges pulse for active operations
- **Icon Selection**: Server icons for Proxmox instances, Clock for scheduled backups, Shield for successful backups, Alert triangle for warnings, Download for backup operations
- **Spacing**: Consistent 4-unit spacing (16px) between major sections, 2-unit (8px) for related elements, 6-unit (24px) for page margins
- **Mobile**: Cards stack vertically on mobile, table columns collapse to essential information with expandable details, navigation transforms to bottom tab bar for quick access to dashboard and configurations
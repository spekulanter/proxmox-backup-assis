const express = require('express');
const path = require('path');
const { NodeSSH } = require('node-ssh');
const cron = require('cron');
const archiver = require('archiver');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Server management endpoints
app.get('/api/servers', async (req, res) => {
    try {
        // In production, this would read from a database
        res.json([]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/servers/test', async (req, res) => {
    const { host, port, username, password } = req.body;
    
    try {
        const ssh = new NodeSSH();
        
        await ssh.connect({
            host,
            port: port || 22,
            username,
            password,
            readyTimeout: 10000
        });
        
        // Test Proxmox availability
        const result = await ssh.execCommand('pvesh get /version');
        
        ssh.dispose();
        
        res.json({ 
            success: true, 
            message: 'Connection successful',
            proxmoxVersion: result.stdout
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Backup endpoints
app.post('/api/backup/execute', async (req, res) => {
    const { configId, serverId } = req.body;
    
    try {
        // This would implement the actual backup logic
        // For now, return a mock response
        res.json({
            success: true,
            jobId: Date.now().toString(),
            message: 'Backup job started'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/backup/history', async (req, res) => {
    try {
        // Return backup history from database
        res.json([]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Proxmox Backup Manager running on port ${port}`);
    console.log(`📊 Web interface: http://localhost:${port}`);
    console.log(`🔧 API endpoint: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Received SIGINT, shutting down gracefully');
    process.exit(0);
});
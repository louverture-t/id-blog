#!/usr/bin/env node

const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from docs directory
app.use(express.static(path.join(__dirname, 'docs')));

// Handle all routes by serving index.html (for SPA-like behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🦠 Infectious Disease Blog server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});

// Watch for file changes and rebuild
const watcher = chokidar.watch(['src/**/*'], { ignoreInitial: true });

watcher.on('change', (path) => {
    console.log(`📝 File changed: ${path}`);
    console.log('🔄 Rebuilding site...');
    
    exec('npm run build', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Build error:', error);
            return;
        }
        console.log('✅ Site rebuilt successfully');
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    watcher.close();
    server.close(() => {
        console.log('👋 Server stopped');
        process.exit(0);
    });
});

module.exports = app;
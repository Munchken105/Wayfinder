const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// 1. Detect Local LAN IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (localhost) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const IP = getLocalIP();
console.log('==========================================');
console.log('🧭 Wayfinder Cross-Platform Launcher');
console.log(`📍 Detected Host IP: ${IP}`);
console.log('==========================================');

// 2. Write IP to frontend/.env.local
const envContent = `VITE_LOCAL_IP=${IP}\n`;
const envPath = path.join(__dirname, 'frontend', '.env.local');
try {
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Injected VITE_LOCAL_IP=${IP} into frontend/.env.local`);
} catch (err) {
    console.error('❌ Failed to write .env.local:', err);
}

// Helper to spawn processes
function runProcess(name, command, args, cwd) {
    const isWin = process.platform === 'win32';
    const shell = isWin ? true : false;

    console.log(`🚀 Starting ${name}...`);

    const proc = spawn(command, args, {
        cwd: cwd,
        shell: true,
        stdio: 'inherit',
        env: { ...process.env }
    });

    proc.on('error', (err) => {
        console.error(`❌ ${name} failed to start:`, err);
    });

    return proc;
}

// 3. Start Backend
const backendProc = runProcess('Backend', 'npm', ['run', 'dev'], path.join(__dirname, 'backend'));

// 4. Start Frontend
const frontendProc = runProcess('Frontend', 'npm', ['run', 'dev', '--', '--host'], path.join(__dirname, 'frontend'));

// 5. Cleanup on Exit
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping servers...');
    backendProc.kill();
    frontendProc.kill();
    process.exit();
});

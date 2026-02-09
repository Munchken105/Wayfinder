const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// 1. Detect Local LAN IP
function getLocalIP() {
    // 1. Check for manual override
    if (process.env.HOST_IP) {
        console.log(`ℹ️ Using manual override IP: ${process.env.HOST_IP}`);
        return process.env.HOST_IP;
    }

    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (localhost) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                candidates.push({ name, address: iface.address });
            }
        }
    }

    if (candidates.length === 0) return 'localhost';

    console.log('🔎 Detected Network Interfaces:');
    candidates.forEach(c => console.log(`   - ${c.name}: ${c.address}`));

    // 2. Prioritize common LAN interface names (Wi-Fi, Ethernet, wlan, en)
    // Avoid common VM/container interfaces (docker, vether, br, vmnet, wsl)
    const preferred = candidates.find(c => {
        const n = c.name.toLowerCase();
        return (n.includes('wi-fi') || n.includes('wlan') || n.includes('en') || n.includes('eth')) &&
            !n.includes('docker') && !n.includes('veth') && !n.includes('br') && !n.includes('vmnet') && !n.includes('wsl');
    });

    if (preferred) {
        console.log(`✅ Selected preferred interface: ${preferred.name}`);
        return preferred.address;
    }

    // 3. Fallback to the first candidate
    const first = candidates[0];
    console.log(`⚠️ No preferred interface found. Defaulting to: ${first.name}`);
    return first.address;
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

// 5. Windows Firewall Warning
if (process.platform === 'win32') {
    console.log('\n⚠️  WINDOWS FIREWALL DETECTED  ⚠️');
    console.log('If you cannot connect from your phone (site stuck loading), usually the Firewall is blocking it.');
    console.log('------------------------------------------------------------------------------------------');
    console.log('✅ SOLUTION 1: When the "Windows Security Alert" pops up, check BOTH "Private" and "Public" boxes and click "Allow Access".');
    console.log('------------------------------------------------------------------------------------------');
    console.log('✅ SOLUTION 2 (If you missed the popup):');
    console.log('   Run this command in PowerShell as Administrator to open the ports:');
    console.log('   New-NetFirewallRule -DisplayName "Allow Wayfinder" -Direction Inbound -LocalPort 5000,5173 -Protocol TCP -Action Allow');
    console.log('------------------------------------------------------------------------------------------\n');
}

// 5. Cleanup on Exit
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping servers...');
    backendProc.kill();
    frontendProc.kill();
    process.exit();
});

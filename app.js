// Hostinger Node.js entry point bridge
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, 'dist', 'server.cjs');

console.log('Current Directory:', __dirname);
console.log('Searching for server at:', serverPath);

if (!fs.existsSync(serverPath)) {
    console.error('FATAL: server.cjs not found at ' + serverPath);
    console.error('Please ensure you have run "npm run build" before deploying.');
    process.exit(1);
}

process.env.NODE_ENV = 'production';
import('./dist/server.cjs').catch(err => {
    console.error('Failed to load server.cjs:', err);
    process.exit(1);
});

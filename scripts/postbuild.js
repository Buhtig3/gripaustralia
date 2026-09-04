import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Running Pagefind search indexing...');
execSync('npx pagefind --site dist', { stdio: 'inherit' });

const distPagefind = path.resolve('dist', 'pagefind');
const publicPagefind = path.resolve('public', 'pagefind');

if (fs.existsSync(distPagefind)) {
  fs.cpSync(distPagefind, publicPagefind, { recursive: true });
  console.log('✓ Synced Pagefind assets to public/pagefind for dev and preview environments.');
}

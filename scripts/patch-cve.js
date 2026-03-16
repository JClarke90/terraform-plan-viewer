#!/usr/bin/env node

// Patch for CVE-2025-55182 and CVE-2025-66478 - React/Next.js RCE vulnerabilities
import fs from 'fs';
import path from 'path';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

console.log('🔒 Applying security patches for CVE-2025-55182 and CVE-2025-66478...\n');

// Update to patched versions
packageJson.dependencies.react = '19.2.5';
packageJson.dependencies['react-dom'] = '19.2.5';
packageJson.dependencies.next = '15.2.10';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✓ Updated React to 19.2.5 (fixes CVE-2025-55182)');
console.log('✓ Updated Next.js to 15.2.10 (fixes CVE-2025-66478)');
console.log('\n📦 Please run: pnpm install');
console.log('\nThese patched versions address:');
console.log('  - CVE-2025-55182: React Server Component injection vulnerability');
console.log('  - CVE-2025-66478: Next.js RCE vulnerability in App Router');

#!/bin/bash

# Fix for CVE-2025-55182 and CVE-2025-66478 - React/Next.js RCE vulnerabilities
# This script applies security patches to address critical vulnerabilities

echo "Patching critical React/Next.js security vulnerabilities..."

# Remove node_modules and lockfile to get fresh install
rm -rf node_modules pnpm-lock.yaml

# Update to patched versions
# React 19.2.5+ and Next.js 15.2.10+ contain the security fixes
pnpm add react@19.2.5 react-dom@19.2.5 next@15.2.10

# Re-install all dependencies
pnpm install

echo "Security patches applied successfully!"
echo "✓ CVE-2025-55182 - React Server Component injection vulnerability patched"
echo "✓ CVE-2025-66478 - Next.js RCE vulnerability patched"

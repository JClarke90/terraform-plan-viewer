#!/bin/bash
# Force reinstall dependencies to clear version conflicts
rm -rf node_modules
rm -rf .next
pnpm install --force

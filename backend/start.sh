#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Installing dependencies (may take a while)..."
npm install
echo "Starting backend (dev)..."
npm run dev

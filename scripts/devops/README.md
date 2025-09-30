# 🔧 DevOps Scripts

This folder contains scripts for development operations, server management, and deployment tasks.

## 📁 Scripts

### `stop-all.sh`
**Purpose**: Stop all running Node.js processes  
**Usage**: `./scripts/devops/stop-all.sh`  
**Description**: Kills all Node.js processes to clean up development environment and resolve port conflicts.

## 🎯 Features

- ✅ **Process management** - Stop conflicting Node.js processes
- ✅ **Port cleanup** - Free up ports for development
- ✅ **Environment reset** - Clean slate for development
- ✅ **Conflict resolution** - Fix port binding issues

## 📋 Use Cases

- **Port conflicts** - When ports are already in use
- **Process cleanup** - Stop all development servers
- **Environment reset** - Start fresh development session
- **Deployment preparation** - Clean environment before deployment

## 🔗 Related Commands

```bash
# Stop all Node.js processes
./scripts/devops/stop-all.sh

# Start development servers
npm run dev:backend
npm run dev:admin
npm run dev:shop
```

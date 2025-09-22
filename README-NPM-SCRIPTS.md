# NPM Scripts Guide

This document describes all available npm scripts for managing the React AdminLTE Clean Architecture project.

## 🚀 Quick Start

```bash
# Start both backend and frontend servers
npm run start

# Stop all servers
npm run stop-all
```

## 📋 Available Scripts

### Start Commands

| Command | Description | Port |
|---------|-------------|------|
| `npm run start` | Start both backend and frontend servers | Backend: 3001, Frontend: 5174 |
| `npm run start:simple` | Alternative start method (without concurrently) | Backend: 3001, Frontend: 5174 |
| `npm run start:backend` | Start only backend server | 3001 |
| `npm run start:frontend` | Start only frontend server | 5174 |
| `npm run dev:all` | Start both servers with concurrently | Backend: 3001, Frontend: 5174 |

### Stop Commands

| Command | Description |
|---------|-------------|
| `npm run stop-all` | Stop all servers (backend + frontend) |
| `npm run stop:backend` | Stop only backend server |
| `npm run stop:frontend` | Stop only frontend server |

### Restart Commands

| Command | Description |
|---------|-------------|
| `npm run restart` | Stop all servers, wait 2 seconds, then start all |
| `npm run restart:backend` | Stop and restart backend server |
| `npm run restart:frontend` | Stop and restart frontend server |

### Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:client` | Build frontend for production |
| `npm run build:server` | Build backend for production |

### Utility Commands

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install dependencies for both admin and backend |
| `npm run preview` | Preview built frontend |
| `npm run server` | Start backend in production mode |

## 🎯 Usage Examples

### Development Workflow

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start development servers
npm run start

# 3. Make your changes...

# 4. Stop servers when done
npm run stop-all
```

### Backend Development Only

```bash
# Start only backend for API development
npm run start:backend

# Stop backend
npm run stop:backend
```

### Frontend Development Only

```bash
# Start only frontend for UI development
npm run start:frontend

# Stop frontend
npm run stop:frontend
```

### Production Build

```bash
# Build both frontend and backend
npm run build:client
npm run build:server

# Start production server
npm run server
```

## 🔧 Troubleshooting

### Port Conflicts

If you get port conflicts, use the stop commands:

```bash
# Stop all servers
npm run stop-all

# Or stop specific servers
npm run stop:backend
npm run stop:frontend
```

### Concurrently Not Found

If you get "concurrently: command not found" error:

```bash
# Install concurrently
npm install concurrently --save-dev

# Or use the simple start method
npm run start:simple
```

### Process Not Stopping

If processes don't stop properly:

```bash
# Force stop all Node.js processes
pkill -f node

# Or use the stop script directly
bash ./scripts/stop-all.sh
```

## 📁 Project Structure

```
react-adminlte-clean-arch/
├── admin/                 # Frontend React application
├── backend/              # Backend NestJS application
├── scripts/
│   └── stop-all.sh      # Stop script for all servers
└── package.json         # Root package.json with scripts
```

## 🌐 Server URLs

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5174
- **Health Check**: http://localhost:3001/api/health

## 📝 Notes

- The `concurrently` package is used to run both servers simultaneously with colored output
- The stop script intelligently finds and stops the correct processes
- All scripts are designed to work with npm workspaces
- The frontend uses Vite for fast development and hot reloading
- The backend uses ts-node-dev for TypeScript development with auto-restart


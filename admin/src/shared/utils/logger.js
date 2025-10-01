/**
 * Custom logger utility for the admin frontend
 * Logs to both console and file for easy debugging
 */

class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 logs in memory
    }

    /**
     * Log info message
     */
    info(message, data = null) {
        this.log('info', message, data);
    }

    /**
     * Log warning message
     */
    warn(message, data = null) {
        this.log('warn', message, data);
    }

    /**
     * Log error message
     */
    error(message, data = null) {
        this.log('error', message, data);
    }

    /**
     * Log debug message
     */
    debug(message, data = null) {
        this.log('debug', message, data);
    }

    /**
     * Core logging method
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Add to memory logs
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove oldest log
        }

        // Console logging with colors
        const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        switch (level) {
            case 'error':
                console.error(consoleMessage, data || '');
                break;
            case 'warn':
                console.warn(consoleMessage, data || '');
                break;
            case 'debug':
                console.debug(consoleMessage, data || '');
                break;
            default:
                console.log(consoleMessage, data || '');
        }

        // Send to server for file logging
        this.sendToServer(logEntry);
    }

    /**
     * Send log entry to server for file logging
     */
    async sendToServer(logEntry) {
        try {
            await fetch('/api/v1/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            // Silently fail if server is not available
            console.debug('Failed to send log to server:', error.message);
        }
    }

    /**
     * Get recent logs
     */
    getLogs(level = null, limit = 100) {
        let filteredLogs = this.logs;

        if (level) {
            filteredLogs = this.logs.filter(log => log.level === level);
        }

        return filteredLogs.slice(-limit);
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Export logs as JSON
     */
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Create singleton instance
const logger = new Logger();

// Global error handler
window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
    });
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
    });
});


// Make logger available globally for debugging
window.logger = logger;

export default logger;

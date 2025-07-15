/**
 * Secure Logging Utility
 * Replaces console.log statements with proper logging that can be configured per environment
 */

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = import.meta.env.VITE_LOG_LEVEL || (this.isDevelopment ? 'debug' : 'warn');
    this.enableConsole = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true' || this.isDevelopment;
  }

  // Log levels: error (0), warn (1), info (2), debug (3)
  getLevelNumber(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] || 0;
  }

  shouldLog(level) {
    return this.getLevelNumber(level) <= this.getLevelNumber(this.logLevel);
  }

  formatMessage(level, component, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${component}]`;
    
    return {
      prefix,
      message,
      args,
      fullMessage: `${prefix} ${message}`
    };
  }

  // Sanitize sensitive data before logging
  sanitizeArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return this.sanitizeObject(arg);
      }
      return arg;
    });
  }

  sanitizeObject(obj) {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'apiKey', 'api_key', 'auth'];
    const sanitized = { ...obj };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  log(level, component, message, ...args) {
    if (!this.shouldLog(level)) return;

    const sanitizedArgs = this.sanitizeArgs(args);
    const formatted = this.formatMessage(level, component, message, ...sanitizedArgs);

    // Console logging (only in development or when explicitly enabled)
    if (this.enableConsole) {
      const consoleMethod = console[level] || console.log;
      consoleMethod(formatted.fullMessage, ...sanitizedArgs);
    }

    // In production, you could send to external logging service here
    if (!this.isDevelopment && level === 'error') {
      this.sendToErrorTracking(formatted, sanitizedArgs);
    }
  }

  sendToErrorTracking(formatted, args) {
    // Placeholder for error tracking service (Sentry, LogRocket, etc.)
    // In production, implement actual error tracking here
    try {
      // Example: window.errorTracker?.captureMessage(formatted.fullMessage, args);
    } catch (e) {
      // Fail silently if error tracking is not available
    }
  }

  // Public logging methods
  error(component, message, ...args) {
    this.log('error', component, message, ...args);
  }

  warn(component, message, ...args) {
    this.log('warn', component, message, ...args);
  }

  info(component, message, ...args) {
    this.log('info', component, message, ...args);
  }

  debug(component, message, ...args) {
    this.log('debug', component, message, ...args);
  }

  // Component-specific loggers
  createComponentLogger(componentName) {
    return {
      error: (message, ...args) => this.error(componentName, message, ...args),
      warn: (message, ...args) => this.warn(componentName, message, ...args),
      info: (message, ...args) => this.info(componentName, message, ...args),
      debug: (message, ...args) => this.debug(componentName, message, ...args)
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export component logger factory
export const createLogger = (componentName) => logger.createComponentLogger(componentName);

// Legacy console replacement (for gradual migration)
export const secureConsole = {
  log: (component, ...args) => logger.info(component, ...args),
  error: (component, ...args) => logger.error(component, ...args),
  warn: (component, ...args) => logger.warn(component, ...args),
  debug: (component, ...args) => logger.debug(component, ...args)
};

export default logger;
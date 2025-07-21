/**
 * Simple Logger Utility for SwedPrime
 * Provides consistent logging across the application
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    // Set log level based on environment
    this.logLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
  }

  error(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.logLevel >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  log(message, ...args) {
    // Alias for info
    this.info(message, ...args);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing or custom instances
export { Logger, LOG_LEVELS };

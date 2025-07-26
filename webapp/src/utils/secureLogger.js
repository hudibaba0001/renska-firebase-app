// Secure logging utility to prevent sensitive data exposure
// This utility sanitizes logs to remove sensitive information

const SENSITIVE_FIELDS = [
  'password',
  'personnummer',
  'email',
  'phone',
  'address',
  'token',
  'secret',
  'key',
  'auth',
  'credential',
  'session',
  'uid'
];

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL === 'debug' ? LOG_LEVELS.DEBUG :
                         import.meta.env.VITE_LOG_LEVEL === 'info' ? LOG_LEVELS.INFO :
                         import.meta.env.VITE_LOG_LEVEL === 'warn' ? LOG_LEVELS.WARN :
                         LOG_LEVELS.ERROR;

const ENABLE_CONSOLE_LOGS = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true' || import.meta.env.DEV;

/**
 * Sanitize an object by removing or masking sensitive fields
 * @param {any} data - Data to sanitize
 * @returns {any} - Sanitized data
 */
function sanitizeData(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Check if string looks like sensitive data
    const lowerData = data.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerData.includes(field))) {
      return '[REDACTED]';
    }
    return data;
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Log function that sanitizes sensitive data
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments
 */
function log(level, message, ...args) {
  const levelValue = LOG_LEVELS[level.toUpperCase()];
  
  if (levelValue > CURRENT_LOG_LEVEL) {
    return; // Don't log if level is too verbose
  }

  if (!ENABLE_CONSOLE_LOGS && level !== 'ERROR') {
    return; // Only log errors in production
  }

  const sanitizedArgs = args.map(arg => sanitizeData(arg));
  const timestamp = new Date().toISOString();
  
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level.toUpperCase()) {
    case 'ERROR':
      console.error(logMessage, ...sanitizedArgs);
      break;
    case 'WARN':
      console.warn(logMessage, ...sanitizedArgs);
      break;
    case 'INFO':
      console.info(logMessage, ...sanitizedArgs);
      break;
    case 'DEBUG':
      console.debug(logMessage, ...sanitizedArgs);
      break;
    default:
      console.log(logMessage, ...sanitizedArgs);
  }
}

/**
 * Secure logger object with different log levels
 */
export const secureLogger = {
  error: (message, ...args) => log('ERROR', message, ...args),
  warn: (message, ...args) => log('WARN', message, ...args),
  info: (message, ...args) => log('INFO', message, ...args),
  debug: (message, ...args) => log('DEBUG', message, ...args),
  
  // Special method for authentication events
  auth: (message, userId = null) => {
    log('INFO', `AUTH: ${message}`, { userId: userId ? '[REDACTED]' : null });
  },
  
  // Special method for data access events
  dataAccess: (message, companyId = null, resourceType = null) => {
    log('INFO', `DATA_ACCESS: ${message}`, { 
      companyId: companyId ? '[REDACTED]' : null,
      resourceType 
    });
  },
  
  // Method to check if logging is enabled for a level
  isEnabled: (level) => {
    const levelValue = LOG_LEVELS[level.toUpperCase()];
    return levelValue <= CURRENT_LOG_LEVEL && ENABLE_CONSOLE_LOGS;
  }
};

export default secureLogger;

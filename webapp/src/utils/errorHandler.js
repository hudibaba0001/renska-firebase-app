/**
 * Centralized Error Handling for SwedPrime
 * Provides consistent error management across the application
 */

import { logger } from './logger.js';
import toast from 'react-hot-toast';

// ============================================================================
// ERROR TYPES
// ============================================================================

export const ERROR_TYPES = {
  // Firebase Errors
  FIRESTORE_ERROR: 'FIRESTORE_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  
  // Business Logic Errors
  PRICING_ERROR: 'PRICING_ERROR',
  BOOKING_ERROR: 'BOOKING_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Permission Errors
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR',
  
  // General Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// ============================================================================
// ERROR SEVERITY LEVELS
// ============================================================================

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// ============================================================================
// ERROR MESSAGES (Swedish)
// ============================================================================

export const ERROR_MESSAGES = {
  // Firebase Errors
  [ERROR_TYPES.FIRESTORE_ERROR]: {
    title: 'Databasfel',
    message: 'Ett fel uppstod vid kommunikation med databasen. Försök igen.',
    userMessage: 'Kunde inte spara data. Kontrollera din internetanslutning och försök igen.'
  },
  
  [ERROR_TYPES.AUTH_ERROR]: {
    title: 'Autentiseringsfel',
    message: 'Ett fel uppstod vid inloggning.',
    userMessage: 'Inloggningen misslyckades. Kontrollera dina uppgifter och försök igen.'
  },
  
  // Validation Errors
  [ERROR_TYPES.VALIDATION_ERROR]: {
    title: 'Valideringsfel',
    message: 'Data validering misslyckades.',
    userMessage: 'Vänligen kontrollera att alla fält är korrekt ifyllda.'
  },
  
  [ERROR_TYPES.SCHEMA_ERROR]: {
    title: 'Schemafel',
    message: 'Data struktur är ogiltig.',
    userMessage: 'Ett tekniskt fel uppstod. Kontakta support om problemet kvarstår.'
  },
  
  // Business Logic Errors
  [ERROR_TYPES.PRICING_ERROR]: {
    title: 'Prisberäkningsfel',
    message: 'Kunde inte beräkna pris.',
    userMessage: 'Kunde inte beräkna pris. Kontrollera dina val och försök igen.'
  },
  
  [ERROR_TYPES.BOOKING_ERROR]: {
    title: 'Bokningsfel',
    message: 'Kunde inte skapa bokning.',
    userMessage: 'Bokningen kunde inte skapas. Försök igen eller kontakta support.'
  },
  
  [ERROR_TYPES.PAYMENT_ERROR]: {
    title: 'Betalningsfel',
    message: 'Ett fel uppstod vid betalning.',
    userMessage: 'Betalningen misslyckades. Kontrollera dina betaluppgifter.'
  },
  
  // Network Errors
  [ERROR_TYPES.NETWORK_ERROR]: {
    title: 'Nätverksfel',
    message: 'Nätverksanslutning misslyckades.',
    userMessage: 'Kontrollera din internetanslutning och försök igen.'
  },
  
  [ERROR_TYPES.TIMEOUT_ERROR]: {
    title: 'Timeout',
    message: 'Förfrågan tog för lång tid.',
    userMessage: 'Förfrågan tog för lång tid. Försök igen.'
  },
  
  // Permission Errors
  [ERROR_TYPES.PERMISSION_ERROR]: {
    title: 'Behörighetsfel',
    message: 'Otillräckliga behörigheter.',
    userMessage: 'Du har inte behörighet att utföra denna åtgärd.'
  },
  
  [ERROR_TYPES.UNAUTHORIZED_ERROR]: {
    title: 'Obehörig',
    message: 'Användaren är inte behörig.',
    userMessage: 'Du måste logga in för att fortsätta.'
  },
  
  // General Errors
  [ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'Okänt fel',
    message: 'Ett oväntat fel uppstod.',
    userMessage: 'Ett oväntat fel uppstod. Försök igen eller kontakta support.'
  }
};

// ============================================================================
// ERROR HANDLER CLASS
// ============================================================================

export class ErrorHandler {
  constructor() {
    this.errorCount = 0;
    this.maxErrorsPerMinute = 10;
    this.errorWindow = 60000; // 1 minute
    this.recentErrors = [];
  }

  /**
   * Handle and log an error
   */
  handleError(error, context = {}, options = {}) {
    const {
      type = ERROR_TYPES.UNKNOWN_ERROR,
      severity = ERROR_SEVERITY.MEDIUM,
      showToast = true,
      logToConsole = true,
      userMessage = null
    } = options;

    // Create error object
    const errorObj = {
      id: this.generateErrorId(),
      type,
      severity,
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Rate limiting
    if (this.shouldRateLimit()) {
      logger.warn('Error rate limit exceeded, skipping error logging', { errorCount: this.errorCount });
      return;
    }

    // Log error
    if (logToConsole) {
      this.logError(errorObj);
    }

    // Show user feedback
    if (showToast) {
      this.showUserFeedback(errorObj, userMessage);
    }

    // Track error
    this.trackError(errorObj);

    return errorObj;
  }

  /**
   * Handle Firebase errors specifically
   */
  handleFirebaseError(error, context = {}) {
    let type = ERROR_TYPES.UNKNOWN_ERROR;
    let severity = ERROR_SEVERITY.MEDIUM;

    // Determine error type based on Firebase error code
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          type = ERROR_TYPES.PERMISSION_ERROR;
          severity = ERROR_SEVERITY.HIGH;
          break;
        case 'unauthenticated':
          type = ERROR_TYPES.UNAUTHORIZED_ERROR;
          severity = ERROR_SEVERITY.HIGH;
          break;
        case 'not-found':
          type = ERROR_TYPES.FIRESTORE_ERROR;
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        case 'already-exists':
          type = ERROR_TYPES.VALIDATION_ERROR;
          severity = ERROR_SEVERITY.LOW;
          break;
        case 'resource-exhausted':
          type = ERROR_TYPES.FIRESTORE_ERROR;
          severity = ERROR_SEVERITY.HIGH;
          break;
        case 'failed-precondition':
          type = ERROR_TYPES.VALIDATION_ERROR;
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        case 'aborted':
          type = ERROR_TYPES.NETWORK_ERROR;
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        case 'out-of-range':
          type = ERROR_TYPES.VALIDATION_ERROR;
          severity = ERROR_SEVERITY.LOW;
          break;
        case 'unimplemented':
          type = ERROR_TYPES.UNKNOWN_ERROR;
          severity = ERROR_SEVERITY.CRITICAL;
          break;
        case 'internal':
          type = ERROR_TYPES.FIRESTORE_ERROR;
          severity = ERROR_SEVERITY.HIGH;
          break;
        case 'unavailable':
          type = ERROR_TYPES.NETWORK_ERROR;
          severity = ERROR_SEVERITY.HIGH;
          break;
        case 'data-loss':
          type = ERROR_TYPES.FIRESTORE_ERROR;
          severity = ERROR_SEVERITY.CRITICAL;
          break;
        default:
          type = ERROR_TYPES.FIRESTORE_ERROR;
          severity = ERROR_SEVERITY.MEDIUM;
      }
    }

    return this.handleError(error, context, {
      type,
      severity,
      showToast: true,
      logToConsole: true
    });
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors, context = {}) {
    const error = new Error('Validation failed');
    error.validationErrors = errors;

    return this.handleError(error, context, {
      type: ERROR_TYPES.VALIDATION_ERROR,
      severity: ERROR_SEVERITY.LOW,
      showToast: true,
      logToConsole: false,
      userMessage: 'Vänligen kontrollera att alla fält är korrekt ifyllda.'
    });
  }

  /**
   * Log error with appropriate level
   */
  logError(errorObj) {
    const { severity, type, message, context } = errorObj;

    const logData = {
      type,
      message,
      context,
      timestamp: errorObj.timestamp
    };

    switch (severity) {
      case ERROR_SEVERITY.LOW:
        logger.warn('Low severity error occurred', logData);
        break;
      case ERROR_SEVERITY.MEDIUM:
        logger.error('Medium severity error occurred', logData);
        break;
      case ERROR_SEVERITY.HIGH:
        logger.error('High severity error occurred', logData);
        break;
      case ERROR_SEVERITY.CRITICAL:
        logger.error('CRITICAL ERROR', logData);
        // Could send to external monitoring service here
        break;
      default:
        logger.error('Unknown severity error occurred', logData);
    }
  }

  /**
   * Show user feedback via toast
   */
  showUserFeedback(errorObj, customMessage = null) {
    const errorConfig = ERROR_MESSAGES[errorObj.type] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
    const message = customMessage || errorConfig.userMessage;

    // Don't show toast for low severity errors
    if (errorObj.severity === ERROR_SEVERITY.LOW) {
      return;
    }

    // Show appropriate toast based on severity
    switch (errorObj.severity) {
      case ERROR_SEVERITY.MEDIUM:
        toast.error(message);
        break;
      case ERROR_SEVERITY.HIGH:
        toast.error(message, { duration: 6000 });
        break;
      case ERROR_SEVERITY.CRITICAL:
        toast.error(message, { 
          duration: 8000,
          style: { 
            background: '#dc2626', 
            color: 'white',
            fontWeight: 'bold'
          }
        });
        break;
      default:
        toast.error(message);
    }
  }

  /**
   * Track error for analytics/monitoring
   */
  trackError(errorObj) {
    this.recentErrors.push(errorObj);
    this.errorCount++;

    // Clean old errors
    const now = Date.now();
    this.recentErrors = this.recentErrors.filter(
      error => now - new Date(error.timestamp).getTime() < this.errorWindow
    );
  }

  /**
   * Check if we should rate limit error logging
   */
  shouldRateLimit() {
    const now = Date.now();
    const recentErrorCount = this.recentErrors.filter(
      error => now - new Date(error.timestamp).getTime() < this.errorWindow
    ).length;

    return recentErrorCount >= this.maxErrorsPerMinute;
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = Date.now();
    const recentErrors = this.recentErrors.filter(
      error => now - new Date(error.timestamp).getTime() < this.errorWindow
    );

    const stats = {
      totalErrors: this.errorCount,
      recentErrors: recentErrors.length,
      errorsByType: {},
      errorsBySeverity: {}
    };

    recentErrors.forEach(error => {
      stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error tracking
   */
  clearErrors() {
    this.errorCount = 0;
    this.recentErrors = [];
  }
}

// ============================================================================
// GLOBAL ERROR HANDLER INSTANCE
// ============================================================================

export const errorHandler = new ErrorHandler();

// ============================================================================
// GLOBAL ERROR HANDLERS
// ============================================================================

/**
 * Global unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  errorHandler.handleError(event.reason, {
    source: 'unhandledrejection',
    event: event
  }, {
    type: ERROR_TYPES.UNKNOWN_ERROR,
    severity: ERROR_SEVERITY.HIGH,
    showToast: true
  });
});

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
  event.preventDefault();
  errorHandler.handleError(event.error || new Error(event.message), {
    source: 'global',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }, {
    type: ERROR_TYPES.UNKNOWN_ERROR,
    severity: ERROR_SEVERITY.HIGH,
    showToast: false // Don't show toast for global errors
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a safe async function wrapper
 */
export function withErrorHandling(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(error, context);
      throw error; // Re-throw for component-level handling
    }
  };
}

/**
 * Create a safe sync function wrapper
 */
export function withErrorHandlingSync(fn, context = {}) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler.handleError(error, context);
      throw error;
    }
  };
} 
/**
 * SwedPrime Iframe Communication System
 * Handles communication between embedded widgets and the main booking system
 */

// Message types for iframe communication
export const MESSAGE_TYPES = {
  ZIP_CODE_SUBMITTED: 'ZIP_CODE_SUBMITTED',
  BOOKING_REQUESTED: 'BOOKING_REQUESTED',
  SERVICE_SELECTED: 'SERVICE_SELECTED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  WIDGET_READY: 'WIDGET_READY',
  PARENT_READY: 'PARENT_READY',
  ERROR: 'ERROR'
}

// Event types for internal communication
export const EVENT_TYPES = {
  ZIP_CODE_VALIDATED: 'ZIP_CODE_VALIDATED',
  BOOKING_FLOW_STARTED: 'BOOKING_FLOW_STARTED',
  BOOKING_FLOW_COMPLETED: 'BOOKING_FLOW_COMPLETED',
  BOOKING_FLOW_CANCELLED: 'BOOKING_FLOW_CANCELLED'
}

/**
 * Iframe Communication Manager
 * Handles bidirectional communication between iframe and parent window
 */
export class IframeCommunicationManager {
  constructor(config = {}) {
    this.config = {
      allowedOrigins: config.allowedOrigins || ['*'],
      tenantId: config.tenantId,
      debug: config.debug || false,
      ...config
    }
    
    this.messageHandlers = new Map()
    this.eventListeners = new Map()
    this.isReady = false
    this.parentOrigin = null
    
    // Bind methods
    this.handleMessage = this.handleMessage.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.registerHandler = this.registerHandler.bind(this)
    this.addEventListener = this.addEventListener.bind(this)
    this.removeEventListener = this.removeEventListener.bind(this)
    
    // Initialize
    this.init()
  }

  /**
   * Initialize the communication system
   */
  init() {
    // Add message listener
    window.addEventListener('message', this.handleMessage)
    
    // Send ready message
    this.sendReadyMessage()
    
    this.log('Iframe communication manager initialized')
  }

  /**
   * Handle incoming messages
   */
  handleMessage(event) {
    try {
      // Validate origin
      if (!this.isOriginAllowed(event.origin)) {
        this.log('Message from unauthorized origin:', event.origin)
        return
      }

      const { type, data, timestamp, tenantId } = event.data

      // Validate message structure
      if (!type || !data) {
        this.log('Invalid message structure:', event.data)
        return
      }

      // Validate tenant ID if required
      if (this.config.tenantId && tenantId && tenantId !== this.config.tenantId) {
        this.log('Message from different tenant:', tenantId)
        return
      }

      this.log('Received message:', { type, data, timestamp })

      // Handle message based on type
      switch (type) {
        case MESSAGE_TYPES.PARENT_READY:
          this.handleParentReady(event.origin)
          break
          
        case MESSAGE_TYPES.ZIP_CODE_SUBMITTED:
          this.handleZipCodeSubmitted(data)
          break
          
        case MESSAGE_TYPES.BOOKING_REQUESTED:
          this.handleBookingRequested(data)
          break
          
        case MESSAGE_TYPES.SERVICE_SELECTED:
          this.handleServiceSelected(data)
          break
          
        case MESSAGE_TYPES.BOOKING_COMPLETED:
          this.handleBookingCompleted(data)
          break
          
        case MESSAGE_TYPES.BOOKING_CANCELLED:
          this.handleBookingCancelled(data)
          break
          
        case MESSAGE_TYPES.ERROR:
          this.handleError(data)
          break
          
        default:
          this.log('Unknown message type:', type)
      }

      // Call registered handlers
      const handlers = this.messageHandlers.get(type)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data, event)
          } catch (error) {
            this.log('Error in message handler:', error)
          }
        })
      }

    } catch (error) {
      this.log('Error handling message:', error)
      this.sendError('Failed to process message', error.message)
    }
  }

  /**
   * Send message to parent window
   */
  sendMessage(type, data = {}) {
    if (!window.parent || window.parent === window) {
      this.log('No parent window available')
      return
    }

    const message = {
      type,
      data: {
        ...data,
        tenantId: this.config.tenantId,
        timestamp: new Date().toISOString()
      }
    }

    // Send to parent
    window.parent.postMessage(message, this.parentOrigin || '*')
    
    this.log('Sent message:', message)
  }

  /**
   * Send ready message
   */
  sendReadyMessage() {
    this.sendMessage(MESSAGE_TYPES.WIDGET_READY, {
      widgetType: 'zip-code-widget',
      version: '1.0.0',
      capabilities: ['zip-code-validation', 'booking-flow']
    })
  }

  /**
   * Send error message
   */
  sendError(message, details = '') {
    this.sendMessage(MESSAGE_TYPES.ERROR, {
      message,
      details,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Register message handler
   */
  registerHandler(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type).push(handler)
  }

  /**
   * Add event listener
   */
  addEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType).push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType, listener) {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emitEvent(eventType, data) {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          this.log('Error in event listener:', error)
        }
      })
    }
  }

  /**
   * Handle parent ready message
   */
  handleParentReady(origin) {
    this.parentOrigin = origin
    this.isReady = true
    this.log('Parent window ready, origin:', origin)
  }

  /**
   * Handle ZIP code submission
   */
  handleZipCodeSubmitted(data) {
    this.log('ZIP code submitted:', data)
    this.emitEvent(EVENT_TYPES.ZIP_CODE_VALIDATED, data)
  }

  /**
   * Handle booking request
   */
  handleBookingRequested(data) {
    this.log('Booking requested:', data)
    this.emitEvent(EVENT_TYPES.BOOKING_FLOW_STARTED, data)
  }

  /**
   * Handle service selection
   */
  handleServiceSelected(data) {
    this.log('Service selected:', data)
  }

  /**
   * Handle booking completion
   */
  handleBookingCompleted(data) {
    this.log('Booking completed:', data)
    this.emitEvent(EVENT_TYPES.BOOKING_FLOW_COMPLETED, data)
  }

  /**
   * Handle booking cancellation
   */
  handleBookingCancelled(data) {
    this.log('Booking cancelled:', data)
    this.emitEvent(EVENT_TYPES.BOOKING_FLOW_CANCELLED, data)
  }

  /**
   * Handle error messages
   */
  handleError(data) {
    this.log('Error received:', data)
  }

  /**
   * Check if origin is allowed
   */
  isOriginAllowed(origin) {
    if (this.config.allowedOrigins.includes('*')) {
      return true
    }
    return this.config.allowedOrigins.includes(origin)
  }

  /**
   * Request booking flow
   */
  requestBooking(zipCode, serviceId = null) {
    this.sendMessage(MESSAGE_TYPES.BOOKING_REQUESTED, {
      zipCode,
      serviceId,
      returnUrl: window.location.href
    })
  }

  /**
   * Complete booking
   */
  completeBooking(bookingData) {
    this.sendMessage(MESSAGE_TYPES.BOOKING_COMPLETED, bookingData)
  }

  /**
   * Cancel booking
   */
  cancelBooking(reason = '') {
    this.sendMessage(MESSAGE_TYPES.BOOKING_CANCELLED, { reason })
  }

  /**
   * Get iframe URL for embedding
   */
  getIframeUrl(tenantId, options = {}) {
    const params = new URLSearchParams({
      tenantId,
      theme: options.theme || 'light',
      size: options.size || 'medium',
      ...options
    })
    
    return `${window.location.origin}/widget/zip-code?${params.toString()}`
  }

  /**
   * Generate iframe embed code
   */
  getEmbedCode(tenantId, options = {}) {
    const iframeUrl = this.getIframeUrl(tenantId, options)
    const width = options.width || 400
    const height = options.height || 300
    
    return `<iframe 
  src="${iframeUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  scrolling="no"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>`
  }

  /**
   * Cleanup
   */
  destroy() {
    window.removeEventListener('message', this.handleMessage)
    this.messageHandlers.clear()
    this.eventListeners.clear()
    this.log('Iframe communication manager destroyed')
  }

  /**
   * Log messages if debug is enabled
   */
  log(...args) {
    if (this.config.debug) {
      // Debug logging handled by constructor debug flag
    }
  }
}

/**
 * Create iframe communication manager
 */
export function createIframeCommunication(config) {
  return new IframeCommunicationManager(config)
}

/**
 * Utility functions for iframe communication
 */

/**
 * Resize iframe to fit content
 */
export function resizeIframe(iframe, height) {
  if (iframe && iframe.contentWindow) {
    iframe.style.height = `${height}px`
    
    // Send resize message to parent
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'IFRAME_RESIZE',
        data: { height }
      }, '*')
    }
  }
}

/**
 * Validate ZIP code format
 */
export function validateZipCode(zipCode) {
  const zipRegex = /^\d{5}$/
  return zipRegex.test(zipCode)
}

/**
 * Check if ZIP code is in service area
 */
export function isInServiceArea(zipCode, serviceAreas) {
  if (!serviceAreas || serviceAreas.length === 0) {
    return true // No restrictions
  }
  return serviceAreas.includes(zipCode)
}

/**
 * Format ZIP code for display
 */
export function formatZipCode(zipCode) {
  return zipCode.replace(/(\d{3})(\d{2})/, '$1 $2')
}

/**
 * Get service area name from ZIP code
 */
export function getServiceAreaName(zipCode) {
  // This could be expanded with a ZIP code database
  // For now, return a simple format
  return `Area ${zipCode}`
} 
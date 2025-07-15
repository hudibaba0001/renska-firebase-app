import React, { useState, useEffect } from 'react'
import { createIframeCommunication, MESSAGE_TYPES, EVENT_TYPES } from '../utils/iframeCommunication.js'
import ZipCodeWidget from '../components/ZipCodeWidget.jsx'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/init.js'

export default function WidgetPage() {
  const [tenantConfig, setTenantConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [iframeComm, setIframeComm] = useState(null)
  const [widgetParams, setWidgetParams] = useState({})

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const tenantId = urlParams.get('tenantId')
    const theme = urlParams.get('theme') || 'light'
    const size = urlParams.get('size') || 'medium'
    
    setWidgetParams({ tenantId, theme, size })

    if (!tenantId) {
      setError('Missing tenant ID')
      setLoading(false)
      return
    }

    // Initialize iframe communication
    const comm = createIframeCommunication({
      tenantId,
      debug: import.meta.env.DEV,
      allowedOrigins: ['*'] // In production, restrict to specific domains
    })

    setIframeComm(comm)

    // Load tenant configuration
    loadTenantConfig(tenantId)

    // Cleanup on unmount
    return () => {
      if (comm) {
        comm.destroy()
      }
    }
  }, [])

  const loadTenantConfig = async (tenantId) => {
    try {
      setLoading(true)
      setError(null)

      // Get tenant configuration from Firestore
      const tenantDoc = await getDoc(doc(db, 'tenants', tenantId))
      
      if (!tenantDoc.exists()) {
        throw new Error('Tenant not found')
      }

      const tenantData = tenantDoc.data()
      setTenantConfig(tenantData)

      // Send ready message to parent
      if (iframeComm) {
        iframeComm.sendMessage(MESSAGE_TYPES.WIDGET_READY, {
          tenantId,
          config: tenantData
        })
      }

    } catch (err) {
      console.error('Error loading tenant config:', err)
      setError(err.message)
      
      // Send error message to parent
      if (iframeComm) {
        iframeComm.sendError('Failed to load tenant configuration', err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleZipCodeSubmit = async (zipCode) => {
    try {
      if (!tenantConfig) {
        throw new Error('Tenant configuration not loaded')
      }

      // Check if ZIP code is in service area
      const serviceAreas = tenantConfig.zipAreas || []
      const inServiceArea = serviceAreas.length === 0 || serviceAreas.includes(zipCode)

      if (!inServiceArea) {
        throw new Error('Service not available in this area')
      }

      // Send ZIP code validation success
      if (iframeComm) {
        iframeComm.sendMessage(MESSAGE_TYPES.ZIP_CODE_SUBMITTED, {
          zipCode,
          inServiceArea: true,
          serviceAreas
        })
      }

      // Trigger booking flow
      setTimeout(() => {
        if (iframeComm) {
          iframeComm.requestBooking(zipCode)
        }
      }, 1000)

    } catch (err) {
      console.error('Error handling ZIP code submission:', err)
      
      if (iframeComm) {
        iframeComm.sendError('ZIP code validation failed', err.message)
      }
    }
  }

  // Add event listeners for iframe communication
  useEffect(() => {
    if (!iframeComm) return

    // Listen for booking flow events
    iframeComm.addEventListener(EVENT_TYPES.BOOKING_FLOW_STARTED, (data) => {
      console.log('Booking flow started:', data)
      // Could redirect to booking page or show booking form
    })

    iframeComm.addEventListener(EVENT_TYPES.BOOKING_FLOW_COMPLETED, (data) => {
      console.log('Booking flow completed:', data)
      // Handle booking completion
    })

    iframeComm.addEventListener(EVENT_TYPES.BOOKING_FLOW_CANCELLED, (data) => {
      console.log('Booking flow cancelled:', data)
      // Handle booking cancellation
    })

  }, [iframeComm])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading widget...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Widget Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!tenantConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No tenant configuration found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ZipCodeWidget
        tenantId={widgetParams.tenantId}
        onZipCodeSubmit={handleZipCodeSubmit}
        serviceAreas={tenantConfig.zipAreas || []}
        theme={widgetParams.theme}
        size={widgetParams.size}
      />
    </div>
  )
} 
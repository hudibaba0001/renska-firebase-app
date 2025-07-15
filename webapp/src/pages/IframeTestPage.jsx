import React, { useState, useEffect } from 'react'
import { Card, Button, TextInput, Label, Alert, Badge, Tabs } from 'flowbite-react'
import { createIframeCommunication, MESSAGE_TYPES, EVENT_TYPES } from '../utils/iframeCommunication.js'
import { 
  CodeBracketIcon, 
  PlayIcon, 
  StopIcon, 
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export default function IframeTestPage() {
  const [tenantId, setTenantId] = useState('test-tenant-123')
  const [iframeUrl, setIframeUrl] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [iframeComm, setIframeComm] = useState(null)
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [widgetOptions, setWidgetOptions] = useState({
    theme: 'light',
    size: 'medium',
    width: 400,
    height: 300
  })

  useEffect(() => {
    // Initialize iframe communication
    const comm = createIframeCommunication({
      debug: import.meta.env.DEV,
      allowedOrigins: ['*']
    })

    setIframeComm(comm)

    // Cleanup on unmount
    return () => {
      if (comm) {
        comm.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (!iframeComm) return

    // Listen for messages from iframe
    const handleMessage = (data, event) => {
      setMessages(prev => [...prev, {
        type: 'received',
        data,
        timestamp: new Date().toISOString(),
        source: event.origin
      }])
    }

    // Register handlers for different message types
    Object.values(MESSAGE_TYPES).forEach(type => {
      iframeComm.registerHandler(type, handleMessage)
    })

    // Listen for events
    iframeComm.addEventListener(EVENT_TYPES.ZIP_CODE_VALIDATED, (data) => {
      setMessages(prev => [...prev, {
        type: 'event',
        event: 'ZIP_CODE_VALIDATED',
        data,
        timestamp: new Date().toISOString()
      }])
    })

    iframeComm.addEventListener(EVENT_TYPES.BOOKING_FLOW_STARTED, (data) => {
      setMessages(prev => [...prev, {
        type: 'event',
        event: 'BOOKING_FLOW_STARTED',
        data,
        timestamp: new Date().toISOString()
      }])
    })

    iframeComm.addEventListener(EVENT_TYPES.BOOKING_FLOW_COMPLETED, (data) => {
      setMessages(prev => [...prev, {
        type: 'event',
        event: 'BOOKING_FLOW_COMPLETED',
        data,
        timestamp: new Date().toISOString()
      }])
    })

    setIsListening(true)

  }, [iframeComm])

  const generateIframeUrl = () => {
    const params = new URLSearchParams({
      tenantId,
      theme: widgetOptions.theme,
      size: widgetOptions.size,
      ...widgetOptions
    })
    
    const url = `${window.location.origin}/widget/zip-code?${params.toString()}`
    setIframeUrl(url)
    
    // Generate embed code
    const code = `<iframe 
  src="${url}" 
  width="${widgetOptions.width}" 
  height="${widgetOptions.height}" 
  frameborder="0" 
  scrolling="no"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>`
    
    setEmbedCode(code)
  }

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      alert('Embed code copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy embed code:', err)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const sendTestMessage = (type) => {
    if (!iframeComm) return

    const testData = {
      zipCode: '12345',
      timestamp: new Date().toISOString()
    }

    iframeComm.sendMessage(type, testData)
    
    setMessages(prev => [...prev, {
      type: 'sent',
      messageType: type,
      data: testData,
      timestamp: new Date().toISOString()
    }])
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Iframe Widget Test</h1>
        <p className="text-gray-600">Test the iframe communication system and widget embedding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Widget Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tenant-id" value="Tenant ID" />
                <TextInput
                  id="tenant-id"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="Enter tenant ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme" value="Theme" />
                  <select
                    id="theme"
                    value={widgetOptions.theme}
                    onChange={(e) => setWidgetOptions(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="primary">Primary</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="size" value="Size" />
                  <select
                    id="size"
                    value={widgetOptions.size}
                    onChange={(e) => setWidgetOptions(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width" value="Width (px)" />
                  <TextInput
                    id="width"
                    type="number"
                    value={widgetOptions.width}
                    onChange={(e) => setWidgetOptions(prev => ({ ...prev, width: parseInt(e.target.value) || 400 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="height" value="Height (px)" />
                  <TextInput
                    id="height"
                    type="number"
                    value={widgetOptions.height}
                    onChange={(e) => setWidgetOptions(prev => ({ ...prev, height: parseInt(e.target.value) || 300 }))}
                  />
                </div>
              </div>

              <Button onClick={generateIframeUrl} color="primary" className="w-full">
                <PlayIcon className="h-4 w-4 mr-2" />
                Generate Widget
              </Button>
            </div>
          </Card>

          {/* Communication Controls */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Communication Controls</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge color={isListening ? "success" : "gray"}>
                  {isListening ? "Listening" : "Not Listening"}
                </Badge>
                <span className="text-sm text-gray-600">
                  {isListening ? "Receiving messages from iframe" : "Not receiving messages"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  color="secondary"
                  onClick={() => sendTestMessage(MESSAGE_TYPES.PARENT_READY)}
                >
                  Send Parent Ready
                </Button>
                
                <Button 
                  size="sm" 
                  color="secondary"
                  onClick={() => sendTestMessage(MESSAGE_TYPES.BOOKING_REQUESTED)}
                >
                  Request Booking
                </Button>
              </div>

              <Button onClick={clearMessages} color="gray" size="sm" className="w-full">
                <StopIcon className="h-4 w-4 mr-2" />
                Clear Messages
              </Button>
            </div>
          </Card>

          {/* Embed Code */}
          {embedCode && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Embed Code</h2>
                <Button size="sm" onClick={copyEmbedCode}>
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
            </Card>
          )}
        </div>

        {/* Preview and Messages */}
        <div className="space-y-6">
          {/* Widget Preview */}
          {iframeUrl && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Widget Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={iframeUrl}
                  width={widgetOptions.width}
                  height={widgetOptions.height}
                  frameBorder="0"
                  scrolling="no"
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  title="SwedPrime Widget"
                />
              </div>
            </Card>
          )}

          {/* Message Log */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Message Log</h2>
              <Badge color="info">{messages.length} messages</Badge>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      message.type === 'sent' 
                        ? 'bg-blue-50 border-blue-200' 
                        : message.type === 'received'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge color={
                        message.type === 'sent' ? 'info' :
                        message.type === 'received' ? 'success' : 'warning'
                      }>
                        {message.type === 'sent' ? 'Sent' :
                         message.type === 'received' ? 'Received' : 'Event'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      {message.messageType && (
                        <p className="font-medium text-gray-700">
                          Type: {message.messageType}
                        </p>
                      )}
                      {message.event && (
                        <p className="font-medium text-gray-700">
                          Event: {message.event}
                        </p>
                      )}
                      {message.source && (
                        <p className="text-gray-600">From: {message.source}</p>
                      )}
                      <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 
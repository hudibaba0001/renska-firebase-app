import React, { useState, useEffect } from 'react'
import { Button, TextInput, Label, Alert, Spinner } from 'flowbite-react'
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function ZipCodeWidget({ 
  tenantId, 
  onZipCodeSubmit, 
  serviceAreas = [],
  theme = 'light',
  size = 'medium'
}) {
  const [zipCode, setZipCode] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInServiceArea, setIsInServiceArea] = useState(false)

  // Theme configurations
  const themes = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
      button: 'primary'
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-white',
      border: 'border-gray-600',
      button: 'secondary'
    },
    primary: {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      button: 'primary'
    }
  }

  const sizes = {
    small: {
      padding: 'p-3',
      text: 'text-sm',
      input: 'text-sm',
      button: 'text-sm px-3 py-1.5'
    },
    medium: {
      padding: 'p-4',
      text: 'text-base',
      input: 'text-base',
      button: 'text-base px-4 py-2'
    },
    large: {
      padding: 'p-6',
      text: 'text-lg',
      input: 'text-lg',
      button: 'text-lg px-6 py-3'
    }
  }

  const currentTheme = themes[theme] || themes.light
  const currentSize = sizes[size] || sizes.medium

  useEffect(() => {
    // Validate ZIP code format
    const zipRegex = /^\d{5}$/
    const isValidFormat = zipRegex.test(zipCode)
    
    // Check if in service area
    const inServiceArea = serviceAreas.length === 0 || serviceAreas.includes(zipCode)
    
    setIsValid(isValidFormat && inServiceArea)
    setIsInServiceArea(inServiceArea)
    
    if (zipCode && !isValidFormat) {
      setError('Please enter a valid 5-digit ZIP code')
    } else if (zipCode && !inServiceArea) {
      setError('Sorry, we don\'t service this area yet')
    } else {
      setError('')
    }
  }, [zipCode, serviceAreas])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValid) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Send message to parent window
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'ZIP_CODE_SUBMITTED',
          data: {
            zipCode,
            tenantId,
            timestamp: new Date().toISOString()
          }
        }, '*')
      }
      
      // Call local callback if provided
      if (onZipCodeSubmit) {
        await onZipCodeSubmit(zipCode)
      }
      
      // Show success state briefly
      setTimeout(() => {
        setZipCode('')
        setIsLoading(false)
      }, 1000)
      
    } catch {
      setError('Failed to submit ZIP code. Please try again.')
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit(e)
    }
  }

  return (
    <div className={`
      ${currentTheme.bg} 
      ${currentTheme.border} 
      ${currentSize.padding} 
      border rounded-lg shadow-sm
      max-w-sm mx-auto
    `}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <MapPinIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className={`${currentTheme.text} ${currentSize.text} font-semibold mb-1`}>
            Check Service Availability
          </h3>
          <p className={`${currentTheme.text} opacity-75 ${currentSize.text === 'text-sm' ? 'text-xs' : 'text-sm'}`}>
            Enter your ZIP code to see if we service your area
          </p>
        </div>

        <div>
          <Label 
            htmlFor="zip-code" 
            value="ZIP Code" 
            className={`${currentTheme.text} ${currentSize.text}`}
          />
          <TextInput
            id="zip-code"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyPress={handleKeyPress}
            placeholder="12345"
            icon={MapPinIcon}
            className={currentSize.input}
            maxLength={5}
            required
          />
        </div>

        {error && (
          <Alert color="failure" className="text-sm">
            {error}
          </Alert>
        )}

        {zipCode && isInServiceArea && !error && (
          <Alert color="success" className="text-sm">
            <span className="font-medium">Great!</span> We service your area.
          </Alert>
        )}

        <Button
          type="submit"
          color={currentTheme.button}
          disabled={!isValid || isLoading}
          className={`w-full ${currentSize.button} flex items-center justify-center space-x-2`}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <span>Check Availability</span>
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </Button>

        <div className="text-center">
          <p className={`${currentTheme.text} opacity-60 ${currentSize.text === 'text-sm' ? 'text-xs' : 'text-sm'}`}>
            Powered by SwedPrime
          </p>
        </div>
      </form>
    </div>
  )
} 
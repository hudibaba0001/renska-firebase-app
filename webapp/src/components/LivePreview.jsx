import React from 'react'
import BookingCalculator from './BookingCalculator'

export default function LivePreview({ config }) {
  // Debug logging to see what config is being passed
  console.log('LivePreview config:', config);
  console.log('LivePreview config.services:', config?.services);
  console.log('LivePreview config.name:', config?.name);
  console.log('LivePreview config.companyName:', config?.companyName);
  console.log('LivePreview config.zipAreas:', config?.zipAreas);
  
  // Check if config exists and has services
  const hasValidConfig = config && config.services && Array.isArray(config.services) && config.services.length > 0;
  
  if (!config) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">⏳</div>
          <p>Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (!hasValidConfig) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>Add services to see live preview</p>
          <p className="text-sm mt-2">Configure at least one service to see how your booking form will look</p>
          <div className="text-xs mt-2 text-gray-400">
            Debug: config exists: {config ? 'yes' : 'no'}, 
            services: {config?.services ? 'yes' : 'no'}, 
            services length: {config?.services?.length || 0}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
      <div className="text-sm text-gray-600 mb-4">
        This is how your booking form will look to customers:
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="text-xs text-gray-600">Preview Mode</div>
        </div>
        <div className="transform scale-75 origin-top-left" style={{ width: '133.33%' }}>
          <BookingCalculator config={config} />
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <strong>Note:</strong> This is a scaled-down preview. The actual form submission is disabled in preview mode.
      </div>
    </div>
  )
} 
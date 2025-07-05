import React from 'react'
import BookingForm from './BookingForm'

export default function LivePreview({ config }) {
  if (!config || !config.services || config.services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>Add services to see live preview</p>
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
          <BookingForm config={config} />
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <strong>Note:</strong> This is a scaled-down preview. The actual form submission is disabled in preview mode.
      </div>
    </div>
  )
} 
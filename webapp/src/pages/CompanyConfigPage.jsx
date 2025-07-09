import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase/init'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import ServiceConfigForm from '../components/ServiceConfigForm'
import LivePreview from '../components/LivePreview'
import ErrorBoundary from '../components/ErrorBoundary';

export default function CompanyConfigPage({ companyId: propCompanyId }) {
  const routeParams = useParams()
  const companyId = propCompanyId || routeParams.companyId
  const [config, setConfig] = useState(null)
  const [previewConfig, setPreviewConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true)
      setError('')
      try {
        const ref = doc(db, 'companies', companyId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const configData = snap.data()
          setConfig(configData)
          setPreviewConfig(configData)
        } else {
          // Initialize with default config
          const defaultConfig = {
            services: [],
            frequencyMultiplier: { weekly: 1, biweekly: 1.15, monthly: 1.4 },
            addOns: { oven: 500, fridge: 500, balcony: 300 },
            windowCleaningPrices: { small: 90, medium: 120, large: 150 },
            zipAreas: ["41107", "41121", "41254", "41318", "41503"],
            rutPercentage: 0.3,
            rutEnabled: true
          }
          setConfig(defaultConfig)
          setPreviewConfig(defaultConfig)
        }
      } catch (error) {
        console.error('Error loading config:', error)
        setError('Failed to load configuration.')
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [companyId])

  const handleSave = async (newConfig) => {
    try {
      console.log('🔧 Saving config for company:', companyId, newConfig)
      await setDoc(doc(db, 'companies', companyId), newConfig)
      console.log('✅ Config saved successfully')
    } catch (error) {
      console.error('❌ Error saving config:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading configuration...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const handleConfigChange = (newConfig) => {
    setPreviewConfig(newConfig)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Configuration</h1>
        <p className="text-gray-600">Configure your services, pricing models, and global settings</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="xl:col-span-2">
          <ErrorBoundary>
            <ServiceConfigForm 
              initialConfig={config}
              onSave={handleSave}
              onChange={handleConfigChange}
            />
          </ErrorBoundary>
        </div>
        
        {/* Live Preview */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <LivePreview config={previewConfig} />
          </div>
        </div>
      </div>
    </div>
  )
} 
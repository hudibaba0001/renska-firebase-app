import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  TextInput, 
  Select, 
  Label, 
  Checkbox, 
  Badge, 
  Alert, 
  Spinner,
  Accordion,
  Table,
  Modal,
  Toast
} from 'flowbite-react'
import { 
  PlusIcon, 
  TrashIcon, 
  CogIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  TagIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// 1. Update the default service structure to support all SwedPrime models and options
const defaultService = () => ({
  id: Date.now().toString(),
  name: '',
  pricingModel: 'fixed-tier', // SwedPrime models: fixed-tier, tiered-multiplier, universal, window, hourly, per-room
  tiers: [{ min: 1, max: 50, price: 3000 }], // for fixed-tier and tiered-multiplier
  universalRate: 50, // for universal multiplier
  windowTypes: [{ name: 'Typ 1', price: 60 }], // for window cleaning
  hourlyTiers: [{ min: 1, max: 50, hours: 3 }], // for hourly model
  hourlyRate: 400, // for hourly model
  perRoomRates: [{ type: 'room', price: 300 }, { type: 'bathroom', price: 150 }], // for per-room
  minPrice: 700,
  vatRate: undefined, // fallback to global if not set
  addOns: [], // [{ name, price, rutEligible }]
  frequencyEnabled: true,
  frequencyMultipliers: { weekly: 1, biweekly: 1.15, monthly: 1.4 },
  rutEligible: true,
  customFees: [], // [{ label, amount, rutEligible }]
});

export default function ConfigForm({ initialConfig, onSave, onChange }) {
  const [config, setConfig] = useState({
    services: [],
    frequencyMultiplier: { weekly: 1, biweekly: 1.15, monthly: 1.4 },
    addOns: { oven: 500, fridge: 500, balcony: 300 },
    windowCleaningPrices: { small: 90, medium: 120, large: 150 },
    zipAreas: ["41107", "41121", "41254", "41318", "41503"],
    rutPercentage: 0.3,
    rutEnabled: true,
    vatRate: 25, // Universal VAT setting
    ...initialConfig
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [showAddOnModal, setShowAddOnModal] = useState(false)
  const [newAddOnName, setNewAddOnName] = useState('')

  useEffect(() => {
    if (initialConfig) {
      setConfig(prevConfig => ({
        ...prevConfig,
        ...initialConfig
      }))
    }
  }, [initialConfig])

  // Validation
  useEffect(() => {
    const hasServices = config.services && config.services.length > 0
    const allServicesValid = config.services.every(service => 
      service.name && service.pricingModel && 
      (service.pricingModel !== 'per-sqm-tiered' || (service.tiers && service.tiers.length > 0))
    )
    setIsValid(hasServices && allServicesValid)
  }, [config])

  // Notify parent of config changes for live preview
  useEffect(() => {
    if (onChange) {
      onChange(config)
    }
  }, [config, onChange])

  // Service management
  const addService = () => {
    setConfig(prev => ({
      ...prev,
      services: [...prev.services, defaultService()]
    }))
    toast.success('New service added')
  }

  const updateService = (serviceId, updates) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === serviceId ? { ...service, ...updates } : service
      )
    }))
  }

  const deleteService = (serviceId) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== serviceId)
    }))
    toast.success('Service deleted')
  }

  // Tier management
  const addTier = (serviceId) => {
    const service = config.services.find(s => s.id === serviceId)
    const lastTier = service.tiers[service.tiers.length - 1]
    const newTier = {
      min: lastTier ? lastTier.max + 1 : 0,
      max: lastTier ? lastTier.max + 50 : 50,
      pricePerSqm: 10
    }
    
    updateService(serviceId, {
      tiers: [...service.tiers, newTier]
    })
  }

  const updateTier = (serviceId, tierIndex, updates) => {
    const service = config.services.find(s => s.id === serviceId)
    const updatedTiers = service.tiers.map((tier, index) =>
      index === tierIndex ? { ...tier, ...updates } : tier
    )
    
    updateService(serviceId, { tiers: updatedTiers })
  }

  const deleteTier = (serviceId, tierIndex) => {
    const service = config.services.find(s => s.id === serviceId)
    const updatedTiers = service.tiers.filter((_, index) => index !== tierIndex)
    
    updateService(serviceId, { tiers: updatedTiers })
  }

  // Add per-service helpers for add-ons, custom fees, and frequency multipliers
  function addAddOn(serviceId) {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === serviceId
          ? { ...service, addOns: [...(service.addOns || []), { name: '', price: 0, rutEligible: false }] }
          : service
      )
    }));
  }
  function deleteAddOn(serviceId, addOnIdx) {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service => {
        if (service.id !== serviceId) return service;
        const addOns = [...(service.addOns || [])];
        addOns.splice(addOnIdx, 1);
        return { ...service, addOns };
      })
    }));
  }
  function updateAddOn(serviceId, addOnIdx, changes) {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service => {
        if (service.id !== serviceId) return service;
        const addOns = [...(service.addOns || [])];
        addOns[addOnIdx] = { ...addOns[addOnIdx], ...changes };
        return { ...service, addOns };
      })
    }));
  }
  function addCustomFee(serviceId) {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === serviceId
          ? { ...service, customFees: [...(service.customFees || []), { label: '', amount: 0, rutEligible: false }] }
          : service
      )
    }));
  }
  function deleteCustomFee(serviceId, feeIdx) {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service => {
        if (service.id !== serviceId) return service;
        const customFees = [...(service.customFees || [])];
        customFees.splice(feeIdx, 1);
        return { ...service, customFees };
      })
    }));
  }
  function updateCustomFee(serviceId, feeIdx, changes) {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service => {
        if (service.id !== serviceId) return service;
        const customFees = [...(service.customFees || [])];
        customFees[feeIdx] = { ...customFees[feeIdx], ...changes };
        return { ...service, customFees };
      })
    }));
  }
  function updateFrequencyMultiplier(serviceId, freq, value) {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(service => {
        if (service.id !== serviceId) return service;
        return {
          ...service,
          frequencyMultipliers: {
            ...service.frequencyMultipliers,
            [freq]: value
          }
        };
      })
    }));
  }

  const updateWindowPrice = (size, price) => {
    setConfig(prev => ({
      ...prev,
      windowCleaningPrices: {
        ...prev.windowCleaningPrices,
        [size]: parseInt(price) || 0
      }
    }))
  }

  const updateZipAreas = (zipString) => {
    const areas = zipString.split(',').map(zip => zip.trim()).filter(Boolean)
    setConfig(prev => ({
      ...prev,
      zipAreas: areas
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      await onSave(config)
      setMessage('Configuration saved successfully!')
      toast.success('Configuration saved!')
    } catch (error) {
      setMessage('Failed to save configuration: ' + error.message)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Universal VAT setting */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">VAT Rate (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={config.vatRate || ''}
          onChange={e => setConfig(c => ({ ...c, vatRate: Number(e.target.value) }))}
          className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      {/* Services Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-xl">
                <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Services</h2>
                <p className="text-sm text-gray-500">Configure your cleaning services and pricing</p>
              </div>
            </div>
            <Button color="primary" onClick={addService} className="flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Add Service</span>
            </Button>
          </div>

          <div className="space-y-4">
            {config.services.map((service, idx) => (
              <div key={service.id} className="border rounded-lg p-4 mb-6 bg-white shadow">
                <div className="flex items-center justify-between mb-2">
                  <input
                    className="font-bold text-lg flex-1 mr-2 border-b border-gray-200 focus:outline-none"
                    value={service.name}
                    onChange={e => updateService(service.id, { name: e.target.value })}
                    placeholder="Service name"
                  />
                  <button type="button" onClick={() => deleteService(service.id)} className="text-red-500 ml-2">Remove</button>
                </div>
                {/* Pricing Model */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">Pricing Model</label>
                  <select
                    value={service.pricingModel}
                    onChange={e => updateService(service.id, { pricingModel: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="fixed-tier">Fixed Tier</option>
                    <option value="tiered-multiplier">Tiered Multiplier</option>
                    <option value="universal">Universal Multiplier</option>
                    <option value="window">Window Cleaning</option>
                    <option value="hourly">Hourly</option>
                    <option value="per-room">Per Room</option>
                  </select>
                </div>
                {/* Add-Ons */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">Add-Ons</label>
                  {service.addOns && service.addOns.map((addOn, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2 mb-1">
                      <input
                        className="border rounded px-2 py-1 w-32"
                        value={addOn.name}
                        onChange={e => updateAddOn(service.id, aIdx, { name: e.target.value })}
                        placeholder="Add-on name"
                      />
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={addOn.price}
                        onChange={e => updateAddOn(service.id, aIdx, { price: Number(e.target.value) })}
                        placeholder="Price"
                      />
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={addOn.rutEligible}
                          onChange={e => updateAddOn(service.id, aIdx, { rutEligible: e.target.checked })}
                          className="mr-1"
                        />
                        RUT
                      </label>
                      <button type="button" onClick={() => deleteAddOn(service.id, aIdx)} className="text-red-400">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addAddOn(service.id)} className="text-blue-500 text-xs mt-1">+ Add Add-On</button>
                </div>
                {/* Frequency Multipliers */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">Frequency Multipliers</label>
                  <div className="flex gap-2">
                    {Object.entries(service.frequencyMultipliers || {}).map(([freq, mult]) => (
                      <div key={freq} className="flex flex-col items-center">
                        <span className="text-xs capitalize">{freq}</span>
                        <input
                          type="number"
                          step="0.01"
                          className="border rounded px-2 py-1 w-16"
                          value={mult}
                          onChange={e => updateFrequencyMultiplier(service.id, freq, Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* RUT Eligible Toggle */}
                <div className="mb-2">
                  <label className="flex items-center text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={service.rutEligible}
                      onChange={e => updateService(service.id, { rutEligible: e.target.checked })}
                      className="mr-2"
                    />
                    RUT Eligible
                  </label>
                </div>
                {/* Custom Fees */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">Custom Fees</label>
                  {service.customFees && service.customFees.map((fee, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 mb-1">
                      <input
                        className="border rounded px-2 py-1 w-32"
                        value={fee.label}
                        onChange={e => updateCustomFee(service.id, fIdx, { label: e.target.value })}
                        placeholder="Fee label"
                      />
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={fee.amount}
                        onChange={e => updateCustomFee(service.id, fIdx, { amount: Number(e.target.value) })}
                        placeholder="Amount"
                      />
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={fee.rutEligible}
                          onChange={e => updateCustomFee(service.id, fIdx, { rutEligible: e.target.checked })}
                          className="mr-1"
                        />
                        RUT
                      </label>
                      <button type="button" onClick={() => deleteCustomFee(service.id, fIdx)} className="text-red-400">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addCustomFee(service.id)} className="text-blue-500 text-xs mt-1">+ Add Custom Fee</button>
                </div>
                {/* Per-service VAT override */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">VAT Override (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={service.vatRate ?? ''}
                    onChange={e => updateService(service.id, { vatRate: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={`Default: ${config.vatRate}%`}
                  />
                </div>
                {/* TODO: Add pricing model-specific fields here (not in this step) */}
              </div>
            ))}

            {config.services.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No services configured</p>
                <p className="text-sm">Add your first service to get started</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Global Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-soft">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-secondary-100 rounded-xl">
              <CogIcon className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Global Settings</h2>
              <p className="text-sm text-gray-500">Configure pricing multipliers and add-ons</p>
            </div>
          </div>

          <Accordion>
            {/* Frequency Multipliers */}
            <Accordion.Panel>
              <Accordion.Title>Frequency Multipliers</Accordion.Title>
              <Accordion.Content>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(config.frequencyMultiplier).map(([key, value]) => (
                    <div key={key}>
                      <div className="mb-2 block">
                        <Label htmlFor={`freq-${key}`} value={`${key.charAt(0).toUpperCase() + key.slice(1)} (${value}x)`} />
                      </div>
                      <TextInput
                        id={`freq-${key}`}
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => updateFrequencyMultiplier(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Panel>

            {/* Add-ons */}
            <Accordion.Panel>
              <Accordion.Title>Add-ons</Accordion.Title>
              <Accordion.Content>
                <div className="mb-4">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setShowAddOnModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add New Add-on</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(config.addOns).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label htmlFor={`addon-${key}`} value={key.charAt(0).toUpperCase() + key.slice(1)} />
                      </div>
                      <TextInput
                        id={`addon-${key}`}
                        type="number"
                        value={value}
                        onChange={(e) => updateAddOn(key, e.target.value)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">kr</span>
                      <Button
                        color="failure"
                        size="xs"
                        onClick={() => deleteAddOn(key)}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Panel>

            {/* Window Cleaning */}
            <Accordion.Panel>
              <Accordion.Title>Window Cleaning Prices</Accordion.Title>
              <Accordion.Content>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(config.windowCleaningPrices).map(([size, price]) => (
                    <div key={size}>
                      <div className="mb-2 block">
                        <Label htmlFor={`window-${size}`} value={`${size.charAt(0).toUpperCase() + size.slice(1)} Windows`} />
                      </div>
                      <TextInput
                        id={`window-${size}`}
                        type="number"
                        value={price}
                        onChange={(e) => updateWindowPrice(size, e.target.value)}
                        addon="kr"
                      />
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Panel>

            {/* RUT Discount */}
            <Accordion.Panel>
              <Accordion.Title>RUT Discount Settings</Accordion.Title>
              <Accordion.Content>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rut-enabled"
                      checked={config.rutEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, rutEnabled: e.target.checked }))}
                    />
                    <Label htmlFor="rut-enabled">Enable RUT Discount</Label>
                  </div>
                  
                  {config.rutEnabled && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="mb-2 block">
                            <Label htmlFor="rut-percentage" value={`RUT Discount (${Math.round(config.rutPercentage * 100)}%)`} />
                          </div>
                          <TextInput
                            id="rut-percentage"
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={config.rutPercentage}
                            onChange={(e) => setConfig(prev => ({ ...prev, rutPercentage: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>

                        <div>
                          <div className="mb-2 block">
                            <Label htmlFor="zip-areas" value="Eligible ZIP Codes" />
                          </div>
                          <TextInput
                            id="zip-areas"
                            value={config.zipAreas.join(', ')}
                            onChange={(e) => updateZipAreas(e.target.value)}
                            placeholder="41107, 41121, 41254"
                            icon={MapIcon}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </Card>
      </motion.div>

      {/* Add-on Modal */}
      <Modal show={showAddOnModal} onClose={() => setShowAddOnModal(false)}>
        <Modal.Header>Add New Add-on</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="new-addon-name" value="Add-on Name" />
              </div>
              <TextInput
                id="new-addon-name"
                value={newAddOnName}
                onChange={(e) => setNewAddOnName(e.target.value)}
                placeholder="e.g., Window Cleaning"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={addNewAddOn} disabled={!newAddOnName}>
            Add Add-on
          </Button>
          <Button color="gray" onClick={() => setShowAddOnModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Save Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-soft bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {isValid ? (
                <CheckCircleIcon className="h-6 w-6 text-success-500" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6 text-warning-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isValid ? 'Configuration Valid' : 'Configuration Incomplete'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isValid 
                    ? 'Your configuration is ready to save' 
                    : 'Please add at least one service with valid pricing'
                  }
                </p>
              </div>
            </div>
            
            <Button
              color="primary"
              size="lg"
              onClick={handleSave}
              disabled={!isValid || saving}
              className="flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Spinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Save Configuration</span>
                </>
              )}
            </Button>
          </div>
          
          {message && (
            <div className="mt-4">
              <Alert color={message.includes('success') ? 'success' : 'failure'}>
                {message}
              </Alert>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
} 
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
  Modal
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
  MapIcon,
  InformationCircleIcon
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
  frequencyMultipliers: [], // No default frequencies
  frequencyEnabled: true,
  rutEligible: true,
  customFees: [], // [{ label, amount, rutEligible }]
});

const sanitizeConfig = (config) => {
  // Remove undefined values recursively
  if (Array.isArray(config)) {
    return config.map(sanitizeConfig);
  } else if (config && typeof config === 'object') {
    return Object.entries(config).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = sanitizeConfig(value);
      }
      return acc;
    }, {});
  }
  return config;
};

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

  const updateZipAreas = (zipString) => {
    const areas = zipString.split(',').map(zip => zip.trim()).filter(Boolean)
    setConfig(prev => ({
      ...prev,
      zipAreas: areas
    }))
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="rounded-lg bg-gray-50 p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Global Settings</h2>

          {/* RUT Discount Settings */}
         <div className="mb-6">
           <h3 className="text-lg font-semibold mb-3">RUT Discount Settings</h3>
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
                          className="text-gray-900"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          {/* Eligible ZIP Codes */}
         <div className="mb-6">
           <h3 className="text-lg font-semibold mb-3">Eligible ZIP Codes</h3>
              <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                <div className="mb-2 block">
                  <Label htmlFor="zip-areas" value="Eligible ZIP Codes" />
                </div>
                <TextInput
                  id="zip-areas"
                  value={config.zipAreas.join(', ')}
                  onChange={(e) => updateZipAreas(e.target.value)}
                  placeholder="41107, 41121, 41254"
                  icon={MapIcon}
                  className="text-gray-900"
                />
              </div>
            </div>
          {/* VAT Rate */}
         <div className="mb-6">
           <h3 className="text-lg font-semibold mb-3">VAT Rate (%)</h3>
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
                <div className="flex items-center mt-1 text-xs text-gray-500"><InformationCircleIcon className="h-4 w-4 mr-1" /> VAT will apply to service, add-ons, and custom fees.</div>
              </div>
            
          </div>

      </div>

      {/* Services Section */}
      <div
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
            {/* ROLLBACK: Render each service as a non-collapsible card */}
            {config.services.map(service => (
              <div key={service.id} className="border rounded-lg p-4 mb-6 bg-white shadow relative">
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
                {service.pricingModel === 'fixed-tier' || service.pricingModel === 'tiered-multiplier' ? (
                  <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">Area Tiers (sqm)</h3>
                      <button type="button" onClick={() => updateService(service.id, { tiers: [...service.tiers, { min: 0, max: 0, price: 0 }] })} className="flex items-center px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-black text-sm font-bold shadow-sm transition ml-2">
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Tier
                      </button>
                    </div>
                    <table className="w-full text-sm border mb-2 table-auto">
                      <thead>
                        <tr>
                          <th className="border px-3 py-2 text-left align-middle">Min</th>
                          <th className="border px-3 py-2 text-left align-middle">Max</th>
                          <th className="border px-3 py-2 text-left align-middle">Price (kr)</th>
                          <th className="border px-3 py-2 text-left align-middle"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.tiers.map((tier, tIdx) => (
                          <tr key={tIdx}>
                            <td className="border px-3 py-2 text-left align-middle"><input type="number" value={tier.min} onChange={e => updateService(service.id, { tiers: service.tiers.map((t, i) => i === tIdx ? { ...t, min: Number(e.target.value) } : t) })} className="w-16 border rounded" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><input type="number" value={tier.max} onChange={e => updateService(service.id, { tiers: service.tiers.map((t, i) => i === tIdx ? { ...t, max: Number(e.target.value) } : t) })} className="w-16 border rounded" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><input type="number" value={tier.price} onChange={e => updateService(service.id, { tiers: service.tiers.map((t, i) => i === tIdx ? { ...t, price: Number(e.target.value) } : t) })} className="w-20 border rounded" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><button type="button" onClick={() => updateService(service.id, { tiers: service.tiers.filter((_, i) => i !== tIdx) })} className="text-red-400">Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {service.pricingModel === 'universal' ? (
                  <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Universal Rate (kr/sqm)</h3>
                    </div>
                    <input type="number" value={service.universalRate} onChange={e => updateService(service.id, { universalRate: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-primary-300" />
                  </div>
                ) : null}
                {service.pricingModel === 'window' ? (
                  <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Window Types</h3>
                      <button type="button" onClick={() => updateService(service.id, { windowTypes: [...service.windowTypes, { name: '', price: 0 }] })} className="flex items-center px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-black text-sm font-bold shadow-sm transition ml-2">
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Window Type
                      </button>
                    </div>
                    <table className="w-full text-sm border mb-2 table-auto">
                      <thead>
                        <tr>
                          <th className="border px-3 py-2 text-left align-middle">Type</th>
                          <th className="border px-3 py-2 text-left align-middle">Price (kr)</th>
                          <th className="border px-3 py-2 text-left align-middle"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.windowTypes.map((type, wIdx) => (
                          <tr key={wIdx}>
                            <td className="border px-3 py-2 text-left align-middle"><input value={type.name} onChange={e => updateService(service.id, { windowTypes: service.windowTypes.map((t, i) => i === wIdx ? { ...t, name: e.target.value } : t) })} className="w-32 border rounded" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><input type="number" value={type.price} onChange={e => updateService(service.id, { windowTypes: service.windowTypes.map((t, i) => i === wIdx ? { ...t, price: Number(e.target.value) } : t) })} className="w-20 border rounded" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><button type="button" onClick={() => updateService(service.id, { windowTypes: service.windowTypes.filter((_, i) => i !== wIdx) })} className="text-red-400">Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {service.pricingModel === 'hourly' ? (
                  <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-6 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Hourly Pricing</h3>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => updateService(service.id, { hourlyTiers: [...(service.hourlyTiers || []), { min: 1, max: 50, hours: 3 }] })} 
                        className="flex items-center px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Tier
                      </button>
                    </div>
                    
                    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="bg-blue-100 p-1 rounded-md mr-2">
                          <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                        </span>
                        Base Hourly Rate
                      </h4>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          value={service.hourlyRate || 400} 
                          onChange={e => updateService(service.id, { hourlyRate: Number(e.target.value) })} 
                          className="w-32 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-lg" 
                        />
                        <span className="ml-2 text-lg font-medium text-gray-700">kr/hour</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">This rate will be multiplied by the hours for each area tier</p>
                    </div>
                    
                    <div className="space-y-4">
                      {(service.hourlyTiers || []).map((tier, tIdx) => (
                        <div key={tIdx} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between">
                            <div className="flex-grow">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Range</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      value={tier.min} 
                                      onChange={e => {
                                        const newTiers = [...service.hourlyTiers];
                                        newTiers[tIdx] = { ...tier, min: Number(e.target.value) };
                                        updateService(service.id, { hourlyTiers: newTiers });
                                      }} 
                                      className="w-24 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-300" 
                                      placeholder="Min" 
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input 
                                      type="number" 
                                      value={tier.max} 
                                      onChange={e => {
                                        const newTiers = [...service.hourlyTiers];
                                        newTiers[tIdx] = { ...tier, max: Number(e.target.value) };
                                        updateService(service.id, { hourlyTiers: newTiers });
                                      }} 
                                      className="w-24 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-300" 
                                      placeholder="Max" 
                                    />
                                    <span className="text-gray-500">m²</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours Required</label>
                                  <div className="flex items-center">
                                    <input 
                                      type="number" 
                                      value={tier.hours} 
                                      onChange={e => {
                                        const newTiers = [...service.hourlyTiers];
                                        newTiers[tIdx] = { ...tier, hours: Number(e.target.value) };
                                        updateService(service.id, { hourlyTiers: newTiers });
                                      }} 
                                      className="w-24 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-300" 
                                      placeholder="Hours" 
                                    />
                                    <span className="ml-2 text-gray-500">hours</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-md p-3 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Calculated Price:</span>
                                <span className="text-lg font-bold text-blue-700">
                                  {(tier.hours * (service.hourlyRate || 400)).toLocaleString()} kr
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 flex items-start">
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newTiers = [...service.hourlyTiers];
                                  newTiers.splice(tIdx, 1);
                                  updateService(service.id, { hourlyTiers: newTiers });
                                }} 
                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!service.hourlyTiers || service.hourlyTiers.length === 0) && (
                        <div className="bg-white rounded-lg p-6 border border-dashed border-gray-300 text-center">
                          <div className="text-gray-400 mb-2">
                            <CogIcon className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-gray-500">No hourly tiers defined yet</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => updateService(service.id, { hourlyTiers: [...(service.hourlyTiers || []), { min: 1, max: 50, hours: 3 }] })} 
                            className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" /> Add Your First Tier
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 bg-blue-50 rounded-md p-3 flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        Define area ranges and how many hours each range requires. The final price is calculated by multiplying the hours by your hourly rate.
                      </p>
                    </div>
                  </div>
                ) : null}
                {service.pricingModel === 'per-room' ? (
                  <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Room Types</h3>
                      <button type="button" onClick={() => updateService(service.id, { perRoomRates: [...service.perRoomRates, { type: '', price: 0 }] })} className="flex items-center px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-red-500 text-sm font-bold shadow-sm transition ml-2">
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Room Type
                      </button>
                    </div>
                    <table className="w-full text-sm border mb-2 table-auto">
                      <thead>
                        <tr>
                          <th className="border px-3 py-2 text-left align-middle">Type</th>
                          <th className="border px-3 py-2 text-left align-middle">Price (kr)</th>
                          <th className="border px-3 py-2 text-left align-middle"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.perRoomRates.map((type, rIdx) => (
                          <tr key={rIdx}>
                            <td className="border px-3 py-2 text-left align-middle"><input value={type.type} onChange={e => updateService(service.id, { perRoomRates: service.perRoomRates.map((r, i) => i === rIdx ? { ...r, type: e.target.value } : r) })} className="w-32 border rounded" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><input type="number" value={type.price} onChange={e => updateService(service.id, { perRoomRates: service.perRoomRates.map((r, i) => i === rIdx ? { ...r, price: Number(e.target.value) } : r) })} className="w-20 border rounded" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><button type="button" onClick={() => updateService(service.id, { perRoomRates: service.perRoomRates.filter((_, i) => i !== rIdx) })} className="text-red-400">Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {/* Add-Ons */}
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6 mb-6 border border-green-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <PlusIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Add-Ons</h3>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => addAddOn(service.id)} 
                      className="flex items-center px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow-sm transition"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" /> Add Add-On
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {service.addOns && service.addOns.map((addOn, aIdx) => (
                      <div key={aIdx} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-grow grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-300 text-gray-900"
                                value={addOn.name}
                                onChange={e => updateAddOn(service.id, aIdx, { name: e.target.value })}
                                placeholder="Add-on name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price (kr)</label>
                              <input
                                type="number"
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-300 text-gray-900"
                                value={addOn.price}
                                onChange={e => updateAddOn(service.id, aIdx, { price: Number(e.target.value) })}
                                placeholder="Price"
                              />
                            </div>
                            {config.rutEnabled ? (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RUT Eligible</label>
                                <div className="flex items-center h-[38px]">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={addOn.rutEligible}
                                        onChange={e => updateAddOn(service.id, aIdx, { rutEligible: e.target.checked })}
                                        className="sr-only"
                                      />
                                      <div className={`block w-10 h-6 rounded-full transition ${addOn.rutEligible ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${addOn.rutEligible ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {addOn.rutEligible ? 'Yes' : 'No'}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-end">
                                <span className="text-xs text-gray-400">RUT is disabled globally</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <button 
                              type="button" 
                              onClick={() => deleteAddOn(service.id, aIdx)} 
                              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!service.addOns || service.addOns.length === 0) && (
                      <div className="bg-white rounded-lg p-6 border border-dashed border-gray-300 text-center">
                        <div className="text-gray-400 mb-2">
                          <PlusIcon className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-gray-500">No add-ons defined yet</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => addAddOn(service.id)} 
                          className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" /> Add Your First Add-On
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 bg-green-50 rounded-md p-3 flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Add-ons are optional services customers can select. Mark them as RUT eligible if they qualify for tax deductions.
                    </p>
                  </div>
                </div>
                {/* Frequency Multipliers */}
                {/* In the Frequency Options section, always render the section header and add button, even if there are no frequency options yet. If empty, show a message or empty table. */}
                {(
                  <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">Frequency Options</h3>
                      <button
                        type="button"
                        onClick={() => updateService(service.id, { frequencyMultipliers: [...(service.frequencyMultipliers || []), { label: '', multiplier: 1 }] })}
                        className="flex items-center px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-red-500 text-sm font-bold shadow-sm transition ml-2"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Frequency Option
                    </button>
                  </div>
                  {service.frequencyMultipliers && service.frequencyMultipliers.length > 0 ? (
                    <table className="w-full text-sm border mb-2 table-auto">
                      <thead>
                        <tr>
                          <th className="border px-3 py-2 text-left align-middle">Label</th>
                          <th className="border px-3 py-2 text-left align-middle">Multiplier</th>
                          <th className="border px-3 py-2 text-left align-middle"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.frequencyMultipliers.map((freq, fIdx) => (
                          <tr key={fIdx}>
                            <td className="border px-3 py-2 text-left align-middle"><input value={freq.label} onChange={e => updateService(service.id, { frequencyMultipliers: service.frequencyMultipliers.map((f, i) => i === fIdx ? { ...f, label: e.target.value } : f) })} className="w-24 border rounded text-gray-900" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><input type="number" step="0.01" value={freq.multiplier} onChange={e => updateService(service.id, { frequencyMultipliers: service.frequencyMultipliers.map((f, i) => i === fIdx ? { ...f, multiplier: Number(e.target.value) } : f) })} className="w-20 border rounded text-gray-900" /></td>
                            <td className="border px-3 py-2 text-left align-middle"><button type="button" onClick={() => updateService(service.id, { frequencyMultipliers: service.frequencyMultipliers.filter((_, i) => i !== fIdx) })} className="text-red-400">Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-gray-400 italic py-2">No frequency options yet.</div>
                  )}
                </div>
                )}
                {/* RUT Eligible Toggle */}
                <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">RUT Eligible</h3>
                  </div>
                  {config.rutEnabled ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={service.rutEligible}
                        onChange={e => updateService(service.id, { rutEligible: e.target.checked })}
                        className="mr-2"
                      />
                      <Label htmlFor="rut-eligible" value="RUT Eligible" />
                      <span className="ml-2 text-xs text-gray-500 flex items-center"><InformationCircleIcon className="h-4 w-4 mr-1" /> (applies to main service only; for add-ons and custom fees, enable individually)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 ml-2">RUT is disabled globally. Enable it in global settings to configure per-item eligibility.</span>
                  )}
                </div>
                {/* Custom Fees */}
                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 p-6 mb-6 border border-purple-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Custom Fees</h3>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => addCustomFee(service.id)} 
                      className="flex items-center px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-sm transition"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" /> Add Custom Fee
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {service.customFees && service.customFees.map((fee, fIdx) => (
                      <div key={fIdx} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-grow grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                              <input
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300 text-gray-900"
                                value={fee.label}
                                onChange={e => updateCustomFee(service.id, fIdx, { label: e.target.value })}
                                placeholder="Fee label"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (kr)</label>
                              <input
                                type="number"
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300 text-gray-900"
                                value={fee.amount}
                                onChange={e => updateCustomFee(service.id, fIdx, { amount: Number(e.target.value) })}
                                placeholder="Amount"
                              />
                            </div>
                            {config.rutEnabled ? (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RUT Eligible</label>
                                <div className="flex items-center h-[38px]">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={fee.rutEligible}
                                        onChange={e => updateCustomFee(service.id, fIdx, { rutEligible: e.target.checked })}
                                        className="sr-only"
                                      />
                                      <div className={`block w-10 h-6 rounded-full transition ${fee.rutEligible ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${fee.rutEligible ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {fee.rutEligible ? 'Yes' : 'No'}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-end">
                                <span className="text-xs text-gray-400">RUT is disabled globally</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <button 
                              type="button" 
                              onClick={() => deleteCustomFee(service.id, fIdx)} 
                              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!service.customFees || service.customFees.length === 0) && (
                      <div className="bg-white rounded-lg p-6 border border-dashed border-gray-300 text-center">
                        <div className="text-gray-400 mb-2">
                          <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-gray-500">No custom fees defined yet</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => addCustomFee(service.id)} 
                          className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" /> Add Your First Custom Fee
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 bg-purple-50 rounded-md p-3 flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Custom fees are additional charges that apply to all bookings. Mark them as RUT eligible if they qualify for tax deductions.
                    </p>
                  </div>
                </div>
                {/* Per-service VAT override */}
                <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">VAT Override (%)</h3>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={service.vatRate ?? ''}
                    onChange={e => updateService(service.id, { vatRate: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    placeholder={`Default: ${config.vatRate}%`}
                  />
                  <div className="flex items-center mt-1 text-xs text-gray-500"><InformationCircleIcon className="h-4 w-4 mr-1" /> VAT will apply to service, add-ons, and custom fees.</div>
                </div>
                
                {/* Minimum Fee */}
                <div className="rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 p-6 mb-6 border border-amber-100 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Minimum Fee</h3>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Charge (kr)</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={service.minPrice ?? ''}
                          onChange={e => updateService(service.id, { minPrice: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-32 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 text-lg"
                          placeholder="0"
                        />
                        <span className="ml-2 text-lg font-medium text-gray-700">kr</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        This is the minimum amount a customer will be charged, regardless of the calculated price.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-amber-50 rounded-md p-3 flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      If the calculated price is lower than this minimum fee, customers will be charged this amount instead.
                    </p>
                  </div>
                </div>
                
                {/* TODO: Add pricing model-specific fields here (not in this step) */}
                <div className="flex justify-end mt-4">
                  <Button
                    color="gray"
                    size="sm"
                    onClick={async () => {
                      setSaving(true);
                      setMessage('');
                      try {
                        // Save only this service (update config with just this service updated)
                        const updatedConfig = {
                          ...config,
                          services: config.services.map(s => s.id === service.id ? service : s)
                        };
                        await onSave(sanitizeConfig(updatedConfig));
                        setMessage('Service saved successfully!');
                        toast.success('Service saved!');
                      } catch (error) {
                        setMessage('Failed to save service: ' + error.message);
                        toast.error('Failed to save service');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="absolute bottom-4 right-4 text-red-500"
                  >
                    {saving ? <Spinner size="sm" /> : 'Save'}
                  </Button>
                </div>
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
                  className="text-gray-900"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="primary" onClick={() => {
              const newAddOn = { name: newAddOnName, price: 0, rutEligible: false };
              setConfig(prev => ({
                ...prev,
                addOns: { ...prev.addOns, [newAddOnName.toLowerCase().replace(/\s/g, '-')]: newAddOn }
              }));
              setShowAddOnModal(false);
              setNewAddOnName('');
              toast.success('Add-on added!');
            }} disabled={!newAddOnName}>
              Add Add-on
            </Button>
            <Button color="gray" onClick={() => setShowAddOnModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Save Section */}
        <div
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
                color="gray"
                size="lg"
                onClick={async () => {
                  setSaving(true);
                  setMessage('');
                  try {
                    await onSave(sanitizeConfig(config));
                    setMessage('Configuration saved successfully!');
                    toast.success('Configuration saved!');
                  } catch (error) {
                    setMessage('Failed to save configuration: ' + error.message);
                    toast.error('Failed to save configuration');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={!isValid || saving}
                className="flex items-center space-x-2 text-red-500"
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
        </div>
      </div>
    </div>
  )
} 
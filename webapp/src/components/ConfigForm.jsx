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
                  <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Hourly Rate (kr/hour)</h3>
                    </div>
                    <input type="number" value={service.hourlyRate} onChange={e => updateService(service.id, { hourlyRate: Number(e.target.value) })} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-primary-300" />
                  </div>
                ) : null}
                {service.pricingModel === 'per-room' ? (
                  <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Room Types</h3>
                      <button type="button" onClick={() => updateService(service.id, { perRoomRates: [...service.perRoomRates, { type: '', price: 0 }] })} className="flex items-center px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-black text-sm font-bold shadow-sm transition ml-2">
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
                <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Add-Ons</h3>
                    <button type="button" onClick={() => addAddOn(service.id)} className="flex items-center px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-black text-sm font-bold shadow-sm transition ml-2">
                      <PlusIcon className="h-4 w-4 mr-1" /> Add Add-On
                    </button>
                  </div>
                  {service.addOns && service.addOns.map((addOn, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2 mb-1">
                      <input
                        className="border rounded px-2 py-1 w-32 text-gray-900"
                        value={addOn.name}
                        onChange={e => updateAddOn(service.id, aIdx, { name: e.target.value })}
                        placeholder="Add-on name"
                      />
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20 text-gray-900"
                        value={addOn.price}
                        onChange={e => updateAddOn(service.id, aIdx, { price: Number(e.target.value) })}
                        placeholder="Price"
                      />
                      {config.rutEnabled ? (
                        <label className="flex items-center text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={addOn.rutEligible}
                            onChange={e => updateAddOn(service.id, aIdx, { rutEligible: e.target.checked })}
                            className="mr-2"
                          />
                          <Label value="RUT Eligible" />
                        </label>
                      ) : (
                        <span className="text-xs text-gray-400 ml-2">RUT is disabled globally. Enable it in global settings to configure per-item eligibility.</span>
                      )}
                      <button type="button" onClick={() => deleteAddOn(service.id, aIdx)} className="text-red-400">Remove</button>
                    </div>
                  ))}
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
                        className="flex items-center px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-black text-sm font-bold shadow-sm transition ml-2"
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
                <div className="rounded-lg bg-gray-50 p-4 mb-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Custom Fees</h3>
                    <button type="button" onClick={() => addCustomFee(service.id)} className="flex items-center px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-black text-sm font-bold shadow-sm transition ml-2">
                      <PlusIcon className="h-4 w-4 mr-1" /> Add Custom Fee
                    </button>
                  </div>
                  {service.customFees && service.customFees.map((fee, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 mb-1">
                      <input
                        className="border rounded px-2 py-1 w-32 text-gray-900"
                        value={fee.label}
                        onChange={e => updateCustomFee(service.id, fIdx, { label: e.target.value })}
                        placeholder="Fee label"
                      />
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20 text-gray-900"
                        value={fee.amount}
                        onChange={e => updateCustomFee(service.id, fIdx, { amount: Number(e.target.value) })}
                        placeholder="Amount"
                      />
                      {config.rutEnabled ? (
                        <label className="flex items-center text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={fee.rutEligible}
                            onChange={e => updateCustomFee(service.id, fIdx, { rutEligible: e.target.checked })}
                            className="mr-2"
                          />
                          <Label value="RUT Eligible" />
                        </label>
                      ) : (
                        <span className="text-xs text-gray-400 ml-2">RUT is disabled globally. Enable it in global settings to configure per-item eligibility.</span>
                      )}
                      <button type="button" onClick={() => deleteCustomFee(service.id, fIdx)} className="text-red-400">Remove</button>
                    </div>
                  ))}
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
                {/* TODO: Add pricing model-specific fields here (not in this step) */}
                <div className="flex justify-end mt-4">
                  <Button
                    color="primary"
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
                    className="absolute bottom-4 right-4"
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
                color="primary"
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
        </div>
      </div>
    </div>
  )
} 
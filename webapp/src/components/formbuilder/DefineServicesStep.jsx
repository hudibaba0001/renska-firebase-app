import React, { useState } from 'react';
import ServicePricingEditor from './ServicePricingEditor';

const PRICING_MODELS = [
  {
    id: 'per_sqm_tiered',
    name: 'Per-m² Tiered',
    description: 'Different prices for different area ranges (e.g. 0-50m² = 1000kr, 51-100m² = 1500kr)',
    icon: '📊'
  },
  {
    id: 'flat_range',
    name: 'Flat-Range',
    description: 'Fixed price for entire area ranges',
    icon: '📏'
  },
  {
    id: 'hourly_by_size',
    name: 'Hourly by Size',
    description: 'Price based on estimated hours for different home sizes',
    icon: '⏰'
  },
  {
    id: 'per_room',
    name: 'Per-Room',
    description: 'Price per individual room',
    icon: '🏠'
  },
  {
    id: 'window_based',
    name: 'Window-based',
    description: 'Price based on window sizes and quantities',
    icon: '🪟'
  },
  {
    id: 'custom_function',
    name: 'Custom Function',
    description: 'Advanced: Custom pricing logic',
    icon: '⚙️'
  }
];

export default function DefineServicesStep({ config, updateConfig, onNext, onPrev }) {
  const [editingService, setEditingService] = useState(null);

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      name: '',
      key: '',
      description: '',
      pricingModel: 'per_sqm_tiered',
      pricingConfig: {},
      enabled: true
    };
    
    updateConfig({
      services: [...(config.services || []), newService]
    });
    
    setEditingService(newService.id);
  };

  const updateService = (serviceId, updates) => {
    const updatedServices = config.services.map(service =>
      service.id === serviceId ? { ...service, ...updates } : service
    );
    updateConfig({ services: updatedServices });
  };

  const deleteService = (serviceId) => {
    const updatedServices = config.services.filter(service => service.id !== serviceId);
    updateConfig({ services: updatedServices });
    
    if (editingService === serviceId) {
      setEditingService(null);
    }
  };

  const duplicateService = (serviceId) => {
    const originalService = config.services.find(s => s.id === serviceId);
    if (originalService) {
      const duplicatedService = {
        ...originalService,
        id: Date.now().toString(),
        name: `${originalService.name} (Copy)`,
        key: `${originalService.key}_copy`
      };
      updateConfig({
        services: [...config.services, duplicatedService]
      });
    }
  };

  const generateServiceKey = (name) => {
    return name
      .toLowerCase()
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[éê]/g, 'e')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  };

  const handleServiceNameChange = (serviceId, name) => {
    const service = config.services.find(s => s.id === serviceId);
    updateService(serviceId, {
      name,
      key: service?.key || generateServiceKey(name)
    });
  };

  const canProceed = () => {
    return config.services && config.services.length > 0 && 
           config.services.every(service => service.name.trim() && service.key.trim());
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Services</h2>
              <button
                onClick={addService}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                + Add Service
              </button>
            </div>

            <div className="space-y-3">
              {(config.services || []).map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    editingService === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setEditingService(service.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {service.name || 'Unnamed Service'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {PRICING_MODELS.find(m => m.id === service.pricingModel)?.name || 'No pricing model'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateService(service.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Duplicate"
                      >
                        📄
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteService(service.id);
                        }}
                        className="text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {!service.enabled && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      Disabled
                    </span>
                  )}
                </div>
              ))}

              {(!config.services || config.services.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No services added yet.</p>
                  <p className="text-sm">Click "Add Service" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Editor */}
        <div className="lg:col-span-2">
          {editingService ? (
            <ServiceEditor
              service={config.services.find(s => s.id === editingService)}
              onUpdate={(updates) => updateService(editingService, updates)}
              onNameChange={(name) => handleServiceNameChange(editingService, name)}
              pricingModels={PRICING_MODELS}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a service to configure
                </h3>
                <p className="text-gray-500">
                  Choose a service from the list on the left to set up its pricing model and configuration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          ← Previous
        </button>
        
        <button
          onClick={onNext}
          disabled={!canProceed()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Global Options →
        </button>
      </div>
    </div>
  );
}

// Service Editor Component
function ServiceEditor({ service, onUpdate, onNameChange, pricingModels }) {
  if (!service) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Configure Service</h3>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              value={service.name || ''}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Hemstädning"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Key *
            </label>
            <input
              type="text"
              value={service.key || ''}
              onChange={(e) => onUpdate({ key: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="hemstadning"
            />
            <p className="text-gray-500 text-xs mt-1">Used for internal identification</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={service.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description shown to customers"
          />
        </div>

        {/* Pricing Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pricing Model
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pricingModels.map((model) => (
              <label
                key={model.id}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  service.pricingModel === model.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="pricingModel"
                  value={model.id}
                  checked={service.pricingModel === model.id}
                  onChange={(e) => onUpdate({ pricingModel: e.target.value, pricingConfig: {} })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{model.icon}</span>
                    <span className="font-medium">{model.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{model.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing Configuration */}
        {service.pricingModel && (
          <ServicePricingEditor
            pricingModel={service.pricingModel}
            config={service.pricingConfig || {}}
            onUpdate={(pricingConfig) => onUpdate({ pricingConfig })}
          />
        )}

        {/* Service Status */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={service.enabled !== false}
              onChange={(e) => onUpdate({ enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Service enabled
            </span>
          </label>
          <p className="text-gray-500 text-xs mt-1">
            Disabled services won't appear in the customer form
          </p>
        </div>
      </div>
    </div>
  );
} 
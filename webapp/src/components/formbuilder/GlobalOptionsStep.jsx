import React, { useState } from 'react';

export default function GlobalOptionsStep({ config, updateConfig, onNext, onPrev }) {
  const [activeTab, setActiveTab] = useState('frequency');

  const tabs = [
    { id: 'frequency', label: 'Frequency', icon: '🔄' },
    { id: 'addons', label: 'Add-Ons', icon: '➕' },
    { id: 'windows', label: 'Window Cleaning', icon: '🪟' },
    { id: 'geography', label: 'Geography', icon: '📍' },
    { id: 'discounts', label: 'RUT/ROT', icon: '💰' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'frequency' && (
            <FrequencyTab config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'addons' && (
            <AddOnsTab config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'windows' && (
            <WindowCleaningTab config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'geography' && (
            <GeographyTab config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'discounts' && (
            <DiscountsTab config={config} updateConfig={updateConfig} />
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
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Continue to Field Layout →
        </button>
      </div>
    </div>
  );
}

// Frequency Multipliers Tab
function FrequencyTab({ config, updateConfig }) {
  const frequencyMultipliers = config.frequencyMultipliers || [
    { key: 'varje_vecka', label: 'Varje vecka', multiplier: 1.0 },
    { key: 'varannan_vecka', label: 'Varannan vecka', multiplier: 1.15 },
    { key: 'var_fjarde_vecka', label: 'Var fjärde vecka', multiplier: 1.40 },
    { key: 'engangsstadning', label: 'Engångsstädning', multiplier: 1.0 }
  ];

  const addFrequency = () => {
    const newFrequency = { key: '', label: '', multiplier: 1.0 };
    updateConfig({
      frequencyMultipliers: [...frequencyMultipliers, newFrequency]
    });
  };

  const updateFrequency = (index, updates) => {
    const updated = frequencyMultipliers.map((freq, i) =>
      i === index ? { ...freq, ...updates } : freq
    );
    updateConfig({ frequencyMultipliers: updated });
  };

  const removeFrequency = (index) => {
    const updated = frequencyMultipliers.filter((_, i) => i !== index);
    updateConfig({ frequencyMultipliers: updated });
  };

  const generateKey = (label) => {
    return label
      .toLowerCase()
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[éê]/g, 'e')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Frequency Multipliers</h3>
        <p className="text-gray-600 mb-6">
          Configure how often customers can book services and adjust pricing based on frequency.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Available Frequencies</h4>
          <button
            onClick={addFrequency}
            className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
          >
            + Add Frequency
          </button>
        </div>

        <div className="space-y-3">
          {frequencyMultipliers.map((freq, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-end p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Label
                </label>
                <input
                  type="text"
                  value={freq.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    updateFrequency(index, {
                      label,
                      key: freq.key || generateKey(label)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g. Varje vecka"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key
                </label>
                <input
                  type="text"
                  value={freq.key}
                  onChange={(e) => updateFrequency(index, { key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="varje_vecka"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Multiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freq.multiplier}
                  onChange={(e) => updateFrequency(index, { multiplier: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <button
                  onClick={() => removeFrequency(index)}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                  disabled={frequencyMultipliers.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium mb-2">Example Calculation</h5>
          <p className="text-sm text-gray-600">
            Base price: 1000kr → {frequencyMultipliers[1]?.label || 'Varannan vecka'}: 
            1000kr × {frequencyMultipliers[1]?.multiplier || 1.15} = {Math.round(1000 * (frequencyMultipliers[1]?.multiplier || 1.15))}kr
          </p>
        </div>
      </div>
    </div>
  );
}

// Geography Tab (simplified for now)
function GeographyTab({ config, updateConfig }) {
  const zipAreas = config.zipAreas || [];
  const [newZip, setNewZip] = useState('');

  const addZipCode = () => {
    if (newZip.trim() && !zipAreas.includes(newZip.trim())) {
      updateConfig({
        zipAreas: [...zipAreas, newZip.trim()]
      });
      setNewZip('');
    }
  };

  const removeZipCode = (zip) => {
    updateConfig({
      zipAreas: zipAreas.filter(z => z !== zip)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
        <p className="text-gray-600 mb-6">
          Define which ZIP codes you serve. Leave empty to accept all areas.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newZip}
          onChange={(e) => setNewZip(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addZipCode()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="e.g. 41107"
          maxLength="5"
        />
        <button
          onClick={addZipCode}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {zipAreas.map((zip) => (
          <div key={zip} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
            <span className="font-mono">{zip}</span>
            <button
              onClick={() => removeZipCode(zip)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder tabs - will implement these next
function AddOnsTab() {
  return <div className="text-center py-12 text-gray-500">Add-Ons configuration coming soon...</div>;
}

function WindowCleaningTab() {
  return <div className="text-center py-12 text-gray-500">Window cleaning configuration coming soon...</div>;
}

function DiscountsTab() {
  return <div className="text-center py-12 text-gray-500">RUT/ROT configuration coming soon...</div>;
} 
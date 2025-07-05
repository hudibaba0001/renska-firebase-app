import React from 'react';

export default function ServicePricingEditor({ pricingModel, config, onUpdate }) {
  const updateConfig = (updates) => {
    onUpdate({ ...config, ...updates });
  };

  const renderEditor = () => {
    switch (pricingModel) {
      case 'per_sqm_tiered':
        return <PerSqmTieredEditor config={config} onUpdate={updateConfig} />;
      case 'flat_range':
        return <FlatRangeEditor config={config} onUpdate={updateConfig} />;
      case 'hourly_by_size':
        return <HourlyBySizeEditor config={config} onUpdate={updateConfig} />;
      case 'per_room':
        return <PerRoomEditor config={config} onUpdate={updateConfig} />;
      case 'window_based':
        return <WindowBasedEditor config={config} onUpdate={updateConfig} />;
          case 'custom_function':
      return <SecurityDisabledEditor />;
      default:
        return <div className="text-gray-500">Please select a pricing model</div>;
    }
  };

  return (
    <div className="border-t pt-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">Pricing Configuration</h4>
      {renderEditor()}
    </div>
  );
}

// Per-m² Tiered Editor
function PerSqmTieredEditor({ config, onUpdate }) {
  const tiers = config.tiers || [
    { minArea: 0, maxArea: 50, price: 1000 },
    { minArea: 51, maxArea: 100, price: 1500 }
  ];

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newTier = {
      minArea: lastTier ? lastTier.maxArea + 1 : 0,
      maxArea: lastTier ? lastTier.maxArea + 50 : 50,
      price: 0
    };
    onUpdate({ tiers: [...tiers, newTier] });
  };

  const updateTier = (index, updates) => {
    const updatedTiers = tiers.map((tier, i) => 
      i === index ? { ...tier, ...updates } : tier
    );
    onUpdate({ tiers: updatedTiers });
  };

  const removeTier = (index) => {
    const updatedTiers = tiers.filter((_, i) => i !== index);
    onUpdate({ tiers: updatedTiers });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Area Tiers</h5>
        <button
          onClick={addTier}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          + Add Tier
        </button>
      </div>

      <div className="space-y-3">
        {tiers.map((tier, index) => (
          <div key={index} className="grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min m²</label>
              <input
                type="number"
                value={tier.minArea}
                onChange={(e) => updateTier(index, { minArea: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max m²</label>
              <input
                type="number"
                value={tier.maxArea}
                onChange={(e) => updateTier(index, { maxArea: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Price (kr)</label>
              <input
                type="number"
                value={tier.price}
                onChange={(e) => updateTier(index, { price: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <button
                onClick={() => removeTier(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                disabled={tiers.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-3 rounded text-sm">
        <strong>Example:</strong> 0-50m² = {tiers[0]?.price || 0}kr, 51-100m² = {tiers[1]?.price || 0}kr
      </div>
    </div>
  );
}

// Flat Range Editor
function FlatRangeEditor({ config, onUpdate }) {
  const ranges = config.ranges || [
    { minArea: 0, maxArea: 50, price: 2000 },
    { minArea: 51, maxArea: 100, price: 3000 }
  ];

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const newRange = {
      minArea: lastRange ? lastRange.maxArea + 1 : 0,
      maxArea: lastRange ? lastRange.maxArea + 50 : 50,
      price: 0
    };
    onUpdate({ ranges: [...ranges, newRange] });
  };

  const updateRange = (index, updates) => {
    const updatedRanges = ranges.map((range, i) => 
      i === index ? { ...range, ...updates } : range
    );
    onUpdate({ ranges: updatedRanges });
  };

  const removeRange = (index) => {
    const updatedRanges = ranges.filter((_, i) => i !== index);
    onUpdate({ ranges: updatedRanges });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Flat Ranges</h5>
        <button
          onClick={addRange}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          + Add Range
        </button>
      </div>

      <div className="space-y-3">
        {ranges.map((range, index) => (
          <div key={index} className="grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min m²</label>
              <input
                type="number"
                value={range.minArea}
                onChange={(e) => updateRange(index, { minArea: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max m²</label>
              <input
                type="number"
                value={range.maxArea}
                onChange={(e) => updateRange(index, { maxArea: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fixed Price (kr)</label>
              <input
                type="number"
                value={range.price}
                onChange={(e) => updateRange(index, { price: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <button
                onClick={() => removeRange(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                disabled={ranges.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-3 rounded text-sm">
        <strong>Note:</strong> Customer pays the fixed price for their area range, regardless of exact size.
      </div>
    </div>
  );
}

// Hourly by Size Editor
function HourlyBySizeEditor({ config, onUpdate }) {
  const hourRates = config.hourRates || [
    { minArea: 0, maxArea: 50, hours: 3, pricePerHour: 400 },
    { minArea: 51, maxArea: 100, hours: 5, pricePerHour: 400 }
  ];

  const addHourRate = () => {
    const lastRate = hourRates[hourRates.length - 1];
    const newRate = {
      minArea: lastRate ? lastRate.maxArea + 1 : 0,
      maxArea: lastRate ? lastRate.maxArea + 50 : 50,
      hours: 3,
      pricePerHour: 400
    };
    onUpdate({ hourRates: [...hourRates, newRate] });
  };

  const updateHourRate = (index, updates) => {
    const updatedRates = hourRates.map((rate, i) => 
      i === index ? { ...rate, ...updates } : rate
    );
    onUpdate({ hourRates: updatedRates });
  };

  const removeHourRate = (index) => {
    const updatedRates = hourRates.filter((_, i) => i !== index);
    onUpdate({ hourRates: updatedRates });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Hourly Rates by Area</h5>
        <button
          onClick={addHourRate}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          + Add Rate
        </button>
      </div>

      <div className="space-y-3">
        {hourRates.map((rate, index) => (
          <div key={index} className="grid grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min m²</label>
              <input
                type="number"
                value={rate.minArea}
                onChange={(e) => updateHourRate(index, { minArea: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max m²</label>
              <input
                type="number"
                value={rate.maxArea}
                onChange={(e) => updateHourRate(index, { maxArea: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hours</label>
              <input
                type="number"
                step="0.5"
                value={rate.hours}
                onChange={(e) => updateHourRate(index, { hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Price/Hour (kr)</label>
              <input
                type="number"
                value={rate.pricePerHour}
                onChange={(e) => updateHourRate(index, { pricePerHour: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <button
                onClick={() => removeHourRate(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                disabled={hourRates.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-3 rounded text-sm">
        <strong>Example:</strong> 0-50m² = {hourRates[0]?.hours || 0}h × {hourRates[0]?.pricePerHour || 0}kr = {(hourRates[0]?.hours || 0) * (hourRates[0]?.pricePerHour || 0)}kr
      </div>
    </div>
  );
}

// Per Room Editor
function PerRoomEditor({ config, onUpdate }) {
  const roomTypes = config.roomTypes || [
    { name: 'Bedroom', price: 300 },
    { name: 'Bathroom', price: 250 },
    { name: 'Kitchen', price: 400 },
    { name: 'Living Room', price: 350 }
  ];

  const addRoomType = () => {
    const newRoomType = { name: '', price: 0 };
    onUpdate({ roomTypes: [...roomTypes, newRoomType] });
  };

  const updateRoomType = (index, updates) => {
    const updatedRoomTypes = roomTypes.map((room, i) => 
      i === index ? { ...room, ...updates } : room
    );
    onUpdate({ roomTypes: updatedRoomTypes });
  };

  const removeRoomType = (index) => {
    const updatedRoomTypes = roomTypes.filter((_, i) => i !== index);
    onUpdate({ roomTypes: updatedRoomTypes });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Room Types & Prices</h5>
        <button
          onClick={addRoomType}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          + Add Room Type
        </button>
      </div>

      <div className="space-y-3">
        {roomTypes.map((room, index) => (
          <div key={index} className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Room Type</label>
              <input
                type="text"
                value={room.name}
                onChange={(e) => updateRoomType(index, { name: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="e.g. Bedroom"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Price (kr)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={room.price}
                  onChange={(e) => updateRoomType(index, { price: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  onClick={() => removeRoomType(index)}
                  className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  disabled={roomTypes.length <= 1}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-3 rounded text-sm">
        <strong>Note:</strong> Customers will select how many of each room type they have.
      </div>
    </div>
  );
}

// Window Based Editor  
function WindowBasedEditor({ config, onUpdate }) {
  const windowTypes = config.windowTypes || [
    { name: 'Small Window', price: 100 },
    { name: 'Medium Window', price: 150 },
    { name: 'Large Window', price: 200 },
    { name: 'Balcony Door', price: 250 }
  ];

  const minimumTotal = config.minimumTotal || 500;

  const addWindowType = () => {
    const newWindowType = { name: '', price: 0 };
    onUpdate({ windowTypes: [...windowTypes, newWindowType] });
  };

  const updateWindowType = (index, updates) => {
    const updatedWindowTypes = windowTypes.map((window, i) => 
      i === index ? { ...window, ...updates } : window
    );
    onUpdate({ windowTypes: updatedWindowTypes });
  };

  const removeWindowType = (index) => {
    const updatedWindowTypes = windowTypes.filter((_, i) => i !== index);
    onUpdate({ windowTypes: updatedWindowTypes });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Window Types & Prices</h5>
        <button
          onClick={addWindowType}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          + Add Window Type
        </button>
      </div>

      <div className="space-y-3">
        {windowTypes.map((window, index) => (
          <div key={index} className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Window Type</label>
              <input
                type="text"
                value={window.name}
                onChange={(e) => updateWindowType(index, { name: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="e.g. Small Window"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Price (kr)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={window.price}
                  onChange={(e) => updateWindowType(index, { price: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  onClick={() => removeWindowType(index)}
                  className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  disabled={windowTypes.length <= 1}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Total (kr)
        </label>
        <input
          type="number"
          value={minimumTotal}
          onChange={(e) => onUpdate({ minimumTotal: parseInt(e.target.value) || 0 })}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          Minimum charge even if windows total less
        </p>
      </div>

      <div className="bg-gray-50 p-3 rounded text-sm">
        <strong>Note:</strong> Customers will select quantities for each window type.
      </div>
    </div>
  );
}

// Security: Custom Function Editor Disabled
function SecurityDisabledEditor() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
          <span className="text-red-600 font-bold text-lg">⚠️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800">Custom Functions Disabled</h3>
          <p className="text-red-600">This feature has been disabled for security reasons.</p>
        </div>
      </div>
      
      <div className="bg-red-100 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-red-800 mb-2">Security Risk Identified</h4>
        <p className="text-sm text-red-700 mb-3">
          Custom function editors allow arbitrary code execution, which poses a significant security risk:
        </p>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>Code injection attacks</li>
          <li>Unauthorized data access</li>
          <li>System compromise</li>
          <li>Data theft or manipulation</li>
        </ul>
      </div>
      
      <div className="bg-white rounded border border-red-200 p-4">
        <h4 className="font-medium text-gray-800 mb-2">Safe Alternatives</h4>
        <p className="text-sm text-gray-600 mb-3">
          Please use one of these secure pricing models instead:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li><strong>Per Square Meter (Tiered)</strong> - Different rates for area ranges</li>
          <li><strong>Flat Rate by Range</strong> - Fixed prices for area brackets</li>
          <li><strong>Hourly by Size</strong> - Time-based pricing with area multipliers</li>
          <li><strong>Per Room</strong> - Individual room type pricing</li>
          <li><strong>Window-Based</strong> - Pricing by window types and quantities</li>
        </ul>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          <strong>Need custom pricing?</strong> Contact support to discuss secure implementation options that don't compromise system security.
        </p>
      </div>
    </div>
  );
}

// Legacy: Custom Function Editor (DISABLED)
function CustomFunctionEditor() {
  return <SecurityDisabledEditor />;
} 
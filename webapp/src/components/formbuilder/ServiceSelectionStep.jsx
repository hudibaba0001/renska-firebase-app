import React, { useState, useEffect } from 'react';
import { Button, Checkbox } from 'flowbite-react';

export default function ServiceSelectionStep({ config, updateConfig, onNext, onPrev }) {
  // Available services come from config.services (set in settings)
  const availableServices = config.services || [];
  const [selected, setSelected] = useState(config.selectedServiceIds || []);

  console.log('🔧 ServiceSelectionStep - availableServices:', availableServices);
  console.log('🔧 ServiceSelectionStep - config.selectedServiceIds:', config.selectedServiceIds);
  console.log('🔧 ServiceSelectionStep - current selected:', selected);

  useEffect(() => {
    console.log('🔧 ServiceSelectionStep - selected changed to:', selected);
    console.log('🔧 ServiceSelectionStep - updating config with selectedServiceIds:', selected);
    updateConfig({ selectedServiceIds: selected });
    // eslint-disable-next-line
  }, [selected]);

  const handleToggle = (serviceId) => {
    console.log('🔧 ServiceSelectionStep - toggling service:', serviceId);
    setSelected(prev => {
      const newSelected = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      console.log('🔧 ServiceSelectionStep - new selected:', newSelected);
      return newSelected;
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow flex flex-col gap-8 min-h-[500px] relative">
      <div className="flex gap-8 flex-1">
        {/* Left: Service checkboxes */}
        <div className="w-1/3">
          <h3 className="text-lg font-semibold mb-4">Services</h3>
          <div className="space-y-3">
            {availableServices.length === 0 && <div className="text-gray-400">No services found. Add services in Settings.</div>}
            {availableServices.map(service => (
              <label key={service.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                <Checkbox
                  checked={selected.includes(service.id)}
                  onChange={() => handleToggle(service.id)}
                />
                <span>{service.name}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Right: Instructional text and preview */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <span className="inline-block bg-gray-100 p-4 rounded-full mb-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            <h4 className="text-lg font-semibold mb-2">Select a service to display in your booking form</h4>
            <p className="text-gray-600">Choose one or more services from the list on the left. Pricing, add-ons, and frequency are managed in Settings.</p>
          </div>
          <div className="border rounded bg-gray-50 p-4 w-80 mx-auto">
            <div className="mb-2 text-sm text-gray-700">Booking form preview:</div>
            <select className="w-full border p-2 rounded" disabled>
              <option>Select service</option>
              {availableServices.filter(s => selected.includes(s.id)).map(s => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button color="primary" onClick={onNext} disabled={selected.length === 0}>Continue to Custom Form</Button>
      </div>
    </div>
  );
} 
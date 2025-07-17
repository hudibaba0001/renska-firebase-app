import React, { useState, useEffect } from 'react';
import { Checkbox, Button } from 'flowbite-react';

export default function ZipCodeValidationStep({ config, updateConfig, onNext, onPrev }) {
  const [enabled, setEnabled] = useState(!!(config.zipAreas && config.zipAreas.length > 0));

  useEffect(() => {
    if (!enabled) {
      updateConfig({ zipAreas: [] });
    } else if (!config.zipAreas) {
      updateConfig({ zipAreas: [] });
    }
    // eslint-disable-next-line
  }, [enabled]);

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Enable ZIP Code Validation</h2>
      <div className="mb-6 flex items-center gap-3">
        <Checkbox
          checked={enabled}
          onChange={e => setEnabled(e.target.checked)}
          id="enable-zip-validation"
        />
        <label htmlFor="enable-zip-validation" className="text-lg font-semibold">Enable ZIP code validation</label>
      </div>
      {enabled && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Allowed ZIP Codes (managed in Settings)</label>
          {Array.isArray(config.zipAreas) && config.zipAreas.length > 0 ? (
            <ul className="list-disc pl-6 text-gray-700">
              {config.zipAreas.map(zip => (
                <li key={zip}>{zip}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400">No ZIP codes configured. Edit in Settings.</div>
          )}
          <div className="text-xs text-gray-500 mt-1">Customers must enter one of these ZIP codes to proceed. Edit ZIP codes in Settings.</div>
        </div>
      )}
      <div className="flex justify-between mt-8">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button color="primary" onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
} 
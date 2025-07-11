import React, { useState } from 'react';

const FIELD_DEFINITIONS = {
  zipCode: {
    name: 'ZIP Code',
    description: 'Customer location validation',
    icon: '📍',
    defaultLabel: 'Postnummer',
    defaultPlaceholder: '41107',
    defaultHelp: 'Ange ditt postnummer'
  },
  serviceSelector: {
    name: 'Service Selector',
    description: 'Choose from available services',
    icon: '🛠️',
    defaultLabel: 'Välj tjänst',
    defaultPlaceholder: '-- Välj tjänst --',
    defaultHelp: 'Välj den tjänst du behöver'
  },
  area: {
    name: 'Area/Size',
    description: 'Square meters or room count',
    icon: '📏',
    defaultLabel: 'Bostadsarea (m²)',
    defaultPlaceholder: '50',
    defaultHelp: 'Ange din bostads area i kvadratmeter'
  },
  frequency: {
    name: 'Frequency',
    description: 'How often to book service',
    icon: '🔄',
    defaultLabel: 'Frekvens',
    defaultPlaceholder: '',
    defaultHelp: 'Hur ofta vill du ha städning?'
  },
  addOns: {
    name: 'Add-Ons',
    description: 'Optional additional services',
    icon: '➕',
    defaultLabel: 'Tilläggstjänster',
    defaultPlaceholder: '',
    defaultHelp: 'Välj eventuella tilläggstjänster'
  },
  windowCleaning: {
    name: 'Window Cleaning',
    description: 'Window cleaning options',
    icon: '🪟',
    defaultLabel: 'Fönsterputsning',
    defaultPlaceholder: '',
    defaultHelp: 'Lägg till fönsterputsning'
  },
  rutToggle: {
    name: 'RUT/ROT Toggle',
    description: 'Tax deduction option',
    icon: '💰',
    defaultLabel: 'RUT-avdrag',
    defaultPlaceholder: '',
    defaultHelp: 'Vill du använda RUT-avdrag?'
  }
};

export default function FieldOrderingStep({ config, updateConfig, onNext, onPrev }) {
  const [editingField, setEditingField] = useState(null);
  
  const fieldOrder = config.fieldOrder || Object.keys(FIELD_DEFINITIONS);
  const fieldLabels = config.fieldLabels || {};
  const fieldPlaceholders = config.fieldPlaceholders || {};
  const fieldHelp = config.fieldHelp || {};
  const fieldRequired = config.fieldRequired || {};
  const fieldVisible = config.fieldVisible || {};

  const moveField = (fromIndex, toIndex) => {
    const newOrder = [...fieldOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    updateConfig({ fieldOrder: newOrder });
  };

  const updateFieldConfig = (fieldKey, updates) => {
    const newConfig = {};
    
    if (updates.label !== undefined) {
      newConfig.fieldLabels = { ...fieldLabels, [fieldKey]: updates.label };
    }
    if (updates.placeholder !== undefined) {
      newConfig.fieldPlaceholders = { ...fieldPlaceholders, [fieldKey]: updates.placeholder };
    }
    if (updates.help !== undefined) {
      newConfig.fieldHelp = { ...fieldHelp, [fieldKey]: updates.help };
    }
    if (updates.required !== undefined) {
      newConfig.fieldRequired = { ...fieldRequired, [fieldKey]: updates.required };
    }
    if (updates.visible !== undefined) {
      newConfig.fieldVisible = { ...fieldVisible, [fieldKey]: updates.visible };
    }
    
    updateConfig(newConfig);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Field Order */}
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Field Order & Visibility</h2>
            <p className="text-gray-600 mb-6">
              Drag fields to reorder them in your form. Click to configure each field.
            </p>
            
            <div className="space-y-3">
              {fieldOrder.map((fieldKey, index) => {
                const field = FIELD_DEFINITIONS[fieldKey];
                const isVisible = fieldVisible[fieldKey] !== false;
                
                if (!field) return null;
                
                return (
                  <div
                    key={fieldKey}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      editingField === fieldKey
                        ? 'border-blue-500 bg-blue-50'
                        : isVisible
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                    onClick={() => setEditingField(fieldKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="cursor-move text-gray-400">
                          ⋮⋮
                        </div>
                        <span className="text-xl">{field.icon}</span>
                        <div>
                          <h3 className="font-medium">
                            {fieldLabels[fieldKey] || field.defaultLabel}
                          </h3>
                          <p className="text-sm text-gray-500">{field.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={(e) => updateFieldConfig(fieldKey, { visible: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm text-gray-600">Visible</span>
                        </label>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, Math.max(0, index - 1));
                            }}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, Math.min(fieldOrder.length - 1, index + 1));
                            }}
                            disabled={index === fieldOrder.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Field Configuration */}
        <div>
          {editingField ? (
            <FieldEditor
              fieldKey={editingField}
              field={FIELD_DEFINITIONS[editingField]}
              config={{
                label: fieldLabels[editingField] || FIELD_DEFINITIONS[editingField].defaultLabel,
                placeholder: fieldPlaceholders[editingField] || FIELD_DEFINITIONS[editingField].defaultPlaceholder,
                help: fieldHelp[editingField] || FIELD_DEFINITIONS[editingField].defaultHelp,
                required: fieldRequired[editingField] || false,
                visible: fieldVisible[editingField] !== false
              }}
              onUpdate={(updates) => updateFieldConfig(editingField, updates)}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a field to configure
                </h3>
                <p className="text-gray-500">
                  Click on a field from the left to customize its label, placeholder, and help text.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Preview */}
      <div className="mt-8">
        <FormPreview
          fieldOrder={fieldOrder}
          fieldDefinitions={FIELD_DEFINITIONS}
          fieldLabels={fieldLabels}
          fieldPlaceholders={fieldPlaceholders}
          fieldHelp={fieldHelp}
          fieldRequired={fieldRequired}
          fieldVisible={fieldVisible}
        />
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
          Continue to Preview →
        </button>
      </div>
    </div>
  );
}

// Field Editor Component
function FieldEditor({ fieldKey, field, config, onUpdate }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">
        Configure {field.name}
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Label
          </label>
          <input
            type="text"
            value={config.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={field.defaultLabel}
          />
          <p className="text-xs text-gray-500 mt-1">
            Text shown above the field
          </p>
        </div>

        {field.defaultPlaceholder && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder Text
            </label>
            <input
              type="text"
              value={config.placeholder}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.defaultPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              Text shown inside the field when empty
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Help Text
          </label>
          <textarea
            value={config.help}
            onChange={(e) => onUpdate({ help: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={field.defaultHelp}
          />
          <p className="text-xs text-gray-500 mt-1">
            Additional help text shown below the field
          </p>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.visible}
              onChange={(e) => onUpdate({ visible: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Field visible
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Field required
            </span>
          </label>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Field Type: {field.name}</h4>
          <p className="text-sm text-gray-600">{field.description}</p>
        </div>
      </div>
    </div>
  );
}

// Form Preview Component
function FormPreview({ 
  fieldOrder, 
  fieldDefinitions, 
  fieldLabels, 
  fieldPlaceholders, 
  fieldHelp, 
  fieldRequired, 
  fieldVisible 
}) {
  const visibleFields = fieldOrder.filter(fieldKey => fieldVisible[fieldKey] !== false);
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Form Preview</h3>
      
      <div className="max-w-md mx-auto space-y-4">
        {visibleFields.map((fieldKey) => {
          const field = fieldDefinitions[fieldKey];
          if (!field) return null;
          
          const label = fieldLabels[fieldKey] || field.defaultLabel;
          const placeholder = fieldPlaceholders[fieldKey] || field.defaultPlaceholder;
          const help = fieldHelp[fieldKey] || field.defaultHelp;
          const required = fieldRequired[fieldKey] || false;
          
          return (
            <div key={fieldKey} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              
              {fieldKey === 'serviceSelector' ? (
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                  <option>{placeholder}</option>
                  <option disabled>Hemstädning</option>
                  <option disabled>Storstädning</option>
                </select>
              ) : fieldKey === 'frequency' ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="frequency-preview" className="text-blue-600" />
                    <span className="text-sm">Varje vecka</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="frequency-preview" className="text-blue-600" />
                    <span className="text-sm">Varannan vecka</span>
                  </label>
                </div>
              ) : fieldKey === 'addOns' ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Ugnsrengöring (+500kr)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Balkong (+500kr)</span>
                  </label>
                </div>
              ) : fieldKey === 'rutToggle' ? (
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="text-blue-600" />
                  <span className="text-sm">Ja, jag vill använda RUT-avdrag</span>
                </label>
              ) : (
                <input
                  type={fieldKey === 'area' ? 'number' : 'text'}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              )}
              
              {help && (
                <p className="text-xs text-gray-500">{help}</p>
              )}
            </div>
          );
        })}
        
        <button 
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled
        >
          Beräkna pris
        </button>
      </div>
    </div>
  );
} 
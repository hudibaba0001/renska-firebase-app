import React, { useState } from 'react';

const FIELD_DEFINITIONS = {
  name: {
    name: 'Name Field',
    description: 'Customer name input',
    icon: '👤',
    defaultLabel: 'Namn',
    defaultPlaceholder: 'Ditt namn',
    defaultHelp: 'Ange ditt fullständiga namn'
  },
  email: {
    name: 'Email Field',
    description: 'Customer email input',
    icon: '📧',
    defaultLabel: 'E-post',
    defaultPlaceholder: 'din@email.se',
    defaultHelp: 'Ange din e-postadress'
  },
  phone: {
    name: 'Phone Field',
    description: 'Customer phone number',
    icon: '📞',
    defaultLabel: 'Telefon',
    defaultPlaceholder: '070-123 45 67',
    defaultHelp: 'Ange ditt telefonnummer'
  },
  address: {
    name: 'Address Field',
    description: 'Customer address input',
    icon: '🏠',
    defaultLabel: 'Adress',
    defaultPlaceholder: 'Gatunamn 123',
    defaultHelp: 'Ange din adress'
  },
  personalNumber: {
    name: 'Personal Number Field',
    description: 'Swedish personal identification number',
    icon: '🆔',
    defaultLabel: 'Personnummer',
    defaultPlaceholder: 'YYYYMMDD-XXXX',
    defaultHelp: 'Ange ditt personnummer i format YYYYMMDD-XXXX'
  },
  date: {
    name: 'Date Field',
    description: 'Date selection',
    icon: '📅',
    defaultLabel: 'Datum',
    defaultPlaceholder: '',
    defaultHelp: 'Välj önskat datum'
  },
  time: {
    name: 'Time Field',
    description: 'Time selection',
    icon: '🕐',
    defaultLabel: 'Tid',
    defaultPlaceholder: '',
    defaultHelp: 'Välj önskad tid'
  },
  message: {
    name: 'Message Field',
    description: 'Text area for comments',
    icon: '💬',
    defaultLabel: 'Meddelande',
    defaultPlaceholder: 'Skriv ditt meddelande här...',
    defaultHelp: 'Lägg till eventuella kommentarer eller önskemål'
  },
  checkbox: {
    name: 'Checkbox Field',
    description: 'Yes/No option',
    icon: '☑️',
    defaultLabel: 'Jag godkänner villkoren',
    defaultPlaceholder: '',
    defaultHelp: 'Kryssa i för att godkänna'
  },
  radio: {
    name: 'Radio Buttons',
    description: 'Single choice from options',
    icon: '🔘',
    defaultLabel: 'Välj alternativ',
    defaultPlaceholder: '',
    defaultHelp: 'Välj ett alternativ'
  },
  dropdown: {
    name: 'Dropdown Field',
    description: 'Select from dropdown list',
    icon: '📋',
    defaultLabel: 'Välj från lista',
    defaultPlaceholder: '',
    defaultHelp: 'Välj från listan'
  },
  gdprConsent: {
    name: 'GDPR Consent',
    description: 'Privacy and terms consent',
    icon: '🔒',
    defaultLabel: 'Jag godkänner integritetspolicy och villkor',
    defaultPlaceholder: '',
    defaultHelp: 'Jag godkänner att mina uppgifter behandlas enligt integritetspolicy'
  },
  frequency: {
    name: 'Frequency',
    description: 'How often to book service',
    icon: '🔄',
    defaultLabel: 'Frekvens',
    defaultPlaceholder: '',
    defaultHelp: 'Hur ofta vill du ha städning?'
  },
  rutToggle: {
    name: 'RUT/ROT Toggle',
    description: 'Tax deduction option',
    icon: '💰',
    defaultLabel: 'RUT-avdrag',
    defaultPlaceholder: '',
    defaultHelp: 'Vill du använda RUT-avdrag?'
  },
  timeSlots: {
    name: 'Time Slots',
    description: 'Predefined time slot selection',
    icon: '⏰',
    defaultLabel: 'Välj tid',
    defaultPlaceholder: '',
    defaultHelp: 'Välj en tid som passar dig'
  }
};

export default function FieldOrderingStep({ config, updateConfig, onNext, onPrev }) {
  const [editingField, setEditingField] = useState(null);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  
  const fieldOrder = config.fieldOrder || Object.keys(FIELD_DEFINITIONS);
  const fieldLabels = config.fieldLabels || {};
  const fieldPlaceholders = config.fieldPlaceholders || {};
  const fieldHelp = config.fieldHelp || {};
  const fieldRequired = config.fieldRequired || {};
  const fieldVisible = config.fieldVisible || {};
  const timeSlots = config.timeSlots || ['08:00', '13:00'];

  const moveField = (fromIndex, toIndex) => {
    const newOrder = [...fieldOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    updateConfig({ fieldOrder: newOrder });
  };

  const addField = (fieldType) => {
    const newOrder = [...fieldOrder, fieldType];
    updateConfig({ fieldOrder: newOrder });
    setShowAddFieldModal(false);
  };

  const removeField = (fieldKey) => {
    const newOrder = fieldOrder.filter(f => f !== fieldKey);
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
    
    // Handle field-specific options
    if (updates.checkboxOptions !== undefined) {
      newConfig.fieldCheckboxOptions = { ...(config.fieldCheckboxOptions || {}), [fieldKey]: updates.checkboxOptions };
    }
    if (updates.radioOptions !== undefined) {
      newConfig.fieldRadioOptions = { ...(config.fieldRadioOptions || {}), [fieldKey]: updates.radioOptions };
    }
    if (updates.dropdownOptions !== undefined) {
      newConfig.fieldDropdownOptions = { ...(config.fieldDropdownOptions || {}), [fieldKey]: updates.dropdownOptions };
    }
    if (updates.privacyPolicyUrl !== undefined) {
      newConfig.fieldPrivacyPolicyUrl = { ...(config.fieldPrivacyPolicyUrl || {}), [fieldKey]: updates.privacyPolicyUrl };
    }
    if (updates.termsUrl !== undefined) {
      newConfig.fieldTermsUrl = { ...(config.fieldTermsUrl || {}), [fieldKey]: updates.termsUrl };
    }
    if (updates.gdprText !== undefined) {
      newConfig.fieldGdprText = { ...(config.fieldGdprText || {}), [fieldKey]: updates.gdprText };
    }
    
    updateConfig(newConfig);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Field Order */}
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Field Order & Visibility</h2>
                <p className="text-gray-600 mt-1">
                  Drag fields to reorder them in your form. Click to configure each field.
                </p>
              </div>
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + Add Field
              </button>
            </div>
            
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeField(fieldKey);
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Remove field"
                          >
                            ×
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
                visible: fieldVisible[editingField] !== false,
                checkboxOptions: (config.fieldCheckboxOptions || {})[editingField] || ['Jag godkänner villkoren'],
                radioOptions: (config.fieldRadioOptions || {})[editingField] || ['Alternativ 1', 'Alternativ 2'],
                dropdownOptions: (config.fieldDropdownOptions || {})[editingField] || ['Alternativ 1', 'Alternativ 2'],
                privacyPolicyUrl: (config.fieldPrivacyPolicyUrl || {})[editingField] || 'https://swedprime.com/privacy',
                termsUrl: (config.fieldTermsUrl || {})[editingField] || 'https://swedprime.com/terms',
                gdprText: (config.fieldGdprText || {})[editingField] || 'Jag godkänner integritetspolicy och villkor'
              }}
              timeSlots={timeSlots}
              updateConfig={updateConfig}
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
          timeSlots={timeSlots}
          config={config}
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

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Field</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(FIELD_DEFINITIONS).map(([fieldKey, field]) => (
                <button
                  key={fieldKey}
                  onClick={() => addField(fieldKey)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{field.icon}</span>
                    <div>
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-500">{field.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Field Editor Component
function FieldEditor({ fieldKey, field, config, timeSlots, updateConfig, onUpdate }) {
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

        {/* Time Slots Configuration */}
        {fieldKey === 'timeSlots' && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Time Slot Options</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                <div className="space-y-2">
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                    <label key={time} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={timeSlots.includes(time)}
                        onChange={(e) => {
                          const newTimeSlots = e.target.checked
                            ? [...timeSlots, time]
                            : timeSlots.filter(t => t !== time);
                          updateConfig({ timeSlots: newTimeSlots });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{time}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select which time slots customers can choose from
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Checkbox Options Configuration */}
        {fieldKey === 'checkbox' && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Checkbox Options</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Checkbox Choices
                </label>
                <div className="space-y-2">
                  {(config.checkboxOptions || ['Jag godkänner villkoren']).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(config.checkboxOptions || ['Jag godkänner villkoren'])];
                          newOptions[index] = e.target.value;
                          onUpdate({ checkboxOptions: newOptions });
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter checkbox option"
                      />
                      <button
                        onClick={() => {
                          const newOptions = (config.checkboxOptions || ['Jag godkänner villkoren']).filter((_, i) => i !== index);
                          onUpdate({ checkboxOptions: newOptions });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={(config.checkboxOptions || ['Jag godkänner villkoren']).length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(config.checkboxOptions || ['Jag godkänner villkoren']), 'Ny checkbox'];
                      onUpdate({ checkboxOptions: newOptions });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Checkbox Option
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Define the checkbox options that customers can select
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Radio Options Configuration */}
        {fieldKey === 'radio' && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Radio Button Options</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radio Choices
                </label>
                <div className="space-y-2">
                  {(config.radioOptions || ['Alternativ 1', 'Alternativ 2']).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(config.radioOptions || ['Alternativ 1', 'Alternativ 2'])];
                          newOptions[index] = e.target.value;
                          onUpdate({ radioOptions: newOptions });
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter radio option"
                      />
                      <button
                        onClick={() => {
                          const newOptions = (config.radioOptions || ['Alternativ 1', 'Alternativ 2']).filter((_, i) => i !== index);
                          onUpdate({ radioOptions: newOptions });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={(config.radioOptions || ['Alternativ 1', 'Alternativ 2']).length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(config.radioOptions || ['Alternativ 1', 'Alternativ 2']), 'Nytt alternativ'];
                      onUpdate({ radioOptions: newOptions });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Radio Option
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Define the radio button options that customers can choose from
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown Options Configuration */}
        {fieldKey === 'dropdown' && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Dropdown Options</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dropdown Choices
                </label>
                <div className="space-y-2">
                  {(config.dropdownOptions || ['Alternativ 1', 'Alternativ 2']).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(config.dropdownOptions || ['Alternativ 1', 'Alternativ 2'])];
                          newOptions[index] = e.target.value;
                          onUpdate({ dropdownOptions: newOptions });
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter dropdown option"
                      />
                      <button
                        onClick={() => {
                          const newOptions = (config.dropdownOptions || ['Alternativ 1', 'Alternativ 2']).filter((_, i) => i !== index);
                          onUpdate({ dropdownOptions: newOptions });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={(config.dropdownOptions || ['Alternativ 1', 'Alternativ 2']).length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(config.dropdownOptions || ['Alternativ 1', 'Alternativ 2']), 'Nytt alternativ'];
                      onUpdate({ dropdownOptions: newOptions });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Dropdown Option
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Define the dropdown options that customers can select from
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GDPR Links Configuration */}
        {fieldKey === 'gdprConsent' && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">GDPR Links Configuration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Policy URL
                </label>
                <input
                  type="url"
                  value={config.privacyPolicyUrl || 'https://swedprime.com/privacy'}
                  onChange={(e) => updateConfig({ privacyPolicyUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourcompany.com/privacy"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL to your privacy policy page
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions URL
                </label>
                <input
                  type="url"
                  value={config.termsUrl || 'https://swedprime.com/terms'}
                  onChange={(e) => updateConfig({ termsUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourcompany.com/terms"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL to your terms and conditions page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Consent Text
                </label>
                <textarea
                  value={config.gdprText || 'Jag godkänner integritetspolicy och villkor'}
                  onChange={(e) => updateConfig({ gdprText: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Custom GDPR consent text"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom text for the GDPR consent checkbox. Use [privacy] and [terms] as placeholders for links.
                </p>
              </div>
            </div>
          </div>
        )}

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
  fieldVisible,
  timeSlots,
  config
}) {
  const visibleFields = fieldOrder.filter(fieldKey => fieldVisible[fieldKey] !== false);
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Complete User Form Preview</h3>
      
      <div className="max-w-md mx-auto space-y-4">
        {/* ZIP Code (always first if enabled) */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Postnummer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="41107"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
          <p className="text-xs text-gray-500">Ange ditt postnummer</p>
        </div>

        {/* Service Selection (always second) */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Välj tjänst <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
            <option>-- Välj tjänst --</option>
            <option disabled>Hemstädning</option>
            <option disabled>Storstädning</option>
          </select>
          <p className="text-xs text-gray-500">Välj den tjänst du behöver</p>
        </div>

        {/* Custom Fields */}
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
              
              {fieldKey === 'radio' ? (
                <div className="space-y-2">
                  {(config.fieldRadioOptions?.[fieldKey] || ['Alternativ 1', 'Alternativ 2']).map((option, index) => (
                    <label key={index} className="flex items-center gap-2">
                      <input type="radio" name="radio-preview" className="text-blue-600" />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              ) : fieldKey === 'dropdown' ? (
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                  <option>{placeholder || '-- Välj --'}</option>
                  {(config.fieldDropdownOptions?.[fieldKey] || ['Alternativ 1', 'Alternativ 2']).map((option, index) => (
                    <option key={index} disabled>{option}</option>
                  ))}
                </select>
              ) : fieldKey === 'checkbox' ? (
                <div className="space-y-2">
                  {(config.fieldCheckboxOptions?.[fieldKey] || ['Jag godkänner villkoren']).map((option, index) => (
                    <label key={index} className="flex items-center gap-2">
                      <input type="checkbox" className="text-blue-600" />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
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
              ) : fieldKey === 'gdprConsent' ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span 
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: (config.fieldGdprText?.[fieldKey] || 'Jag godkänner integritetspolicy och villkor')
                          .replace('[privacy]', `<a href="${config.fieldPrivacyPolicyUrl?.[fieldKey] || '#'}" class="text-blue-600 underline">integritetspolicy</a>`)
                          .replace('[terms]', `<a href="${config.fieldTermsUrl?.[fieldKey] || '#'}" class="text-blue-600 underline">villkor</a>`)
                      }}
                    />
                  </label>
                </div>
              ) : fieldKey === 'rutToggle' ? (
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="text-blue-600" />
                  <span className="text-sm">Ja, jag vill använda RUT-avdrag</span>
                </label>
              ) : fieldKey === 'message' ? (
                <textarea
                  placeholder={placeholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              ) : fieldKey === 'date' ? (
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              ) : fieldKey === 'time' ? (
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              ) : fieldKey === 'timeSlots' ? (
                <div className="space-y-2">
                  {timeSlots.map((time) => (
                    <label key={time} className="flex items-center gap-2">
                      <input type="radio" name="timeSlots-preview" className="text-blue-600" />
                      <span className="text-sm">{time}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
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
import React, { useState, useEffect } from 'react';

function generateField(type) {
  return {
    id: `${type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    placeholder: type === 'text' ? 'Enter text' : '',
    required: false,
    validation: null, // null, 'email', 'phone', 'personal_number', 'custom'
    validationPattern: '', // custom regex pattern
    validationMessage: '', // custom error message
    ...(type === 'dropdown' && { options: ['Option 1', 'Option 2'] }),
    ...(type === 'time_slots' && { 
      timeSlots: [
        { id: 'slot1', time: '08:00', label: '8:00 AM' },
        { id: 'slot2', time: '13:00', label: '1:00 PM' }
      ]
    }),
    ...(type === 'slider' && { min: 0, max: 100 }),
    ...(type === 'gdpr' && { 
      privacyPolicyUrl: '', 
      termsUrl: '', 
      required: true,
      label: 'I consent to GDPR and accept the privacy policy and terms.'
    }),
  };
}

export default function FormBuilderDragDrop({ config, updateConfig }) {
  const [fields, setFields] = useState(config.customFields || []);
  const [editingField, setEditingField] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Sync fields with config when it changes
  useEffect(() => {
    if (config.customFields && JSON.stringify(config.customFields) !== JSON.stringify(fields)) {
      setFields(config.customFields);
    }
  }, [config.customFields]);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'date', label: 'Date Picker', icon: '📅' },
    { type: 'time', label: 'Time Picker', icon: '⏰' },
    { type: 'time_slots', label: 'Time Slots', icon: '🕐' },
    { type: 'dropdown', label: 'Dropdown', icon: '📋' },
    { type: 'slider', label: 'Slider', icon: '🎚️' },
    { type: 'gdpr', label: 'GDPR Consent', icon: '🔒' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ];

  const validationTypes = [
    { value: null, label: 'No validation' },
    { value: 'email', label: 'Email address' },
    { value: 'phone', label: 'Phone number (+46 or 07)' },
    { value: 'personal_number', label: 'Personal number (12 digits)' },
    { value: 'zip_code', label: 'ZIP code (5 digits)' },
    { value: 'custom', label: 'Custom pattern' },
  ];

  const getValidationPattern = (type) => {
    switch (type) {
      case 'email':
        return '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
      case 'phone':
        return '^(\\+46|0)[0-9]{8,9}$';
      case 'personal_number':
        return '^[0-9]{12}$';
      case 'zip_code':
        return '^[0-9]{5}$';
      default:
        return '';
    }
  };

  const getValidationMessage = (type) => {
    switch (type) {
      case 'email':
        return 'Please enter a valid email address';
      case 'phone':
        return 'Please enter a valid phone number (+46 or 07 followed by 8-9 digits)';
      case 'personal_number':
        return 'Please enter a 12-digit personal number';
      case 'zip_code':
        return 'Please enter a 5-digit ZIP code';
      default:
        return 'Please enter a valid value';
    }
  };

  const formatTimeLabel = (time) => {
    const [hours, minutes] = time.split(':');
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const displayHours = parseInt(hours) % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const handleAddField = (type) => {
    const newField = generateField(type);
    const newFields = [...fields, newField];
    setFields(newFields);
    updateConfig({ customFields: newFields });
    setShowAddMenu(false);
  };

  const handleEditField = (field) => {
    setEditingField({ ...field });
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditingField(prev => ({ ...prev, [name]: value }));
  };

  const handleValidationChange = (validationType) => {
    setEditingField(prev => ({
      ...prev,
      validation: validationType,
      validationPattern: validationType ? getValidationPattern(validationType) : '',
      validationMessage: validationType ? getValidationMessage(validationType) : '',
    }));
  };

  const handleEditFieldSave = () => {
    const updatedFields = fields.map(f => 
      f.id === editingField.id ? editingField : f
    );
    setFields(updatedFields);
    updateConfig({ customFields: updatedFields });
    setEditingField(null);
  };

  const handleEditFieldCancel = () => {
    setEditingField(null);
  };

  const handleDeleteField = (fieldId) => {
    const updatedFields = fields.filter(f => f.id !== fieldId);
    setFields(updatedFields);
    updateConfig({ customFields: updatedFields });
  };

  const moveField = (fieldId, direction) => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    const newFields = [...fields];
    if (direction === 'up' && index > 0) {
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    setFields(newFields);
    updateConfig({ customFields: newFields });
  };

  const renderFieldPreview = (field) => {
    const isInvalid = field.required && field.validation;
    const hasError = isInvalid && field.validationPattern;
    
    switch (field.type) {
      case 'text':
        return (
          <div>
            <input 
              type="text" 
              className={`w-full border p-2 rounded ${hasError ? 'border-red-500' : ''}`} 
              placeholder={field.placeholder} 
              disabled 
            />
            {hasError && (
              <p className="text-red-500 text-xs mt-1">{field.validationMessage}</p>
            )}
          </div>
        );
      case 'checkbox':
        return <div className="flex items-center gap-2"><input type="checkbox" disabled /> <span>{field.label}</span></div>;
      case 'date':
        return <input type="date" className="w-full border p-2 rounded" disabled />;
      case 'time':
        return <input type="time" className="w-full border p-2 rounded" disabled />;
      case 'dropdown':
        return (
          <select className="w-full border p-2 rounded" disabled>
            {field.options?.map((opt, i) => <option key={i}>{opt}</option>) || <option>Dropdown</option>}
          </select>
        );
      case 'slider':
        return <input type="range" className="w-full" min={field.min} max={field.max} disabled />;
      case 'gdpr':
        return (
          <div className="flex items-center gap-2">
            <input type="checkbox" disabled />
            <span>{field.label}</span>
            {field.privacyPolicyUrl && <a href={field.privacyPolicyUrl} className="text-blue-600 underline">Privacy</a>}
            {field.termsUrl && <a href={field.termsUrl} className="text-blue-600 underline">Terms</a>}
          </div>
        );
      case 'divider':
        return <hr className="my-4" />;
      case 'time_slots':
        return (
          <select className="w-full border p-2 rounded" disabled>
            <option value="">Select a time slot</option>
            {field.timeSlots?.map((slot) => (
              <option key={slot.id} value={slot.time}>
                {slot.label}
              </option>
            ))}
          </select>
        );
      default:
        return <div className="text-gray-500">Unknown field type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Custom Form Fields</h2>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Field
          </button>
          
          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
              {fieldTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => handleAddField(type)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No fields added yet. Click "Add Field" to get started.</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{field.label}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{field.type}</span>
                  {field.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
                  {field.validation && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Validated</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveField(field.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveField(field.id, 'down')}
                    disabled={index === fields.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleEditField(field)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                {renderFieldPreview(field)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Field</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Field Type</label>
                <p className="text-sm text-gray-500">{editingField.type}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  name="label"
                  value={editingField.label}
                  onChange={handleEditFieldChange}
                  className="w-full border p-2 rounded"
                  placeholder="Field label"
                />
              </div>

              {/* Required Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  checked={editingField.required}
                  onChange={(e) => setEditingField(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm font-medium">Required field</label>
              </div>

              {/* Validation Options */}
              {editingField.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Validation</label>
                  <select
                    value={editingField.validation || ''}
                    onChange={(e) => handleValidationChange(e.target.value || null)}
                    className="w-full border p-2 rounded"
                  >
                    {validationTypes.map(({ value, label }) => (
                      <option key={value || 'none'} value={value || ''}>{label}</option>
                    ))}
                  </select>
                  
                  {/* Custom Pattern Input */}
                  {editingField.validation === 'custom' && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">Custom Pattern (Regex)</label>
                      <input
                        type="text"
                        name="validationPattern"
                        value={editingField.validationPattern}
                        onChange={handleEditFieldChange}
                        className="w-full border p-2 rounded text-sm"
                        placeholder="^[a-zA-Z]+$"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a regular expression pattern</p>
                    </div>
                  )}
                  
                  {/* Custom Error Message */}
                  {editingField.validation && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">Error Message</label>
                      <input
                        type="text"
                        name="validationMessage"
                        value={editingField.validationMessage}
                        onChange={handleEditFieldChange}
                        className="w-full border p-2 rounded text-sm"
                        placeholder="Custom error message"
                      />
                    </div>
                  )}
                </div>
              )}

              {editingField.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Placeholder</label>
                  <input
                    type="text"
                    name="placeholder"
                    value={editingField.placeholder}
                    onChange={handleEditFieldChange}
                    className="w-full border p-2 rounded"
                    placeholder="Placeholder text"
                  />
                </div>
              )}

              {editingField.type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options</label>
                  {editingField.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...editingField.options];
                          newOptions[idx] = e.target.value;
                          setEditingField(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="flex-1 border p-2 rounded"
                        placeholder={`Option ${idx + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = editingField.options.filter((_, i) => i !== idx);
                          setEditingField(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(editingField.options || []), ''];
                      setEditingField(prev => ({ ...prev, options: newOptions }));
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {editingField.type === 'time_slots' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Time Slots</label>
                  <p className="text-xs text-gray-500 mb-2">Define specific time slots for bookings</p>
                  {editingField.timeSlots?.map((slot, idx) => (
                    <div key={slot.id} className="flex items-center gap-2 mb-2">
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => {
                          const newTimeSlots = [...editingField.timeSlots];
                          newTimeSlots[idx] = { 
                            ...slot, 
                            time: e.target.value,
                            label: formatTimeLabel(e.target.value)
                          };
                          setEditingField(prev => ({ ...prev, timeSlots: newTimeSlots }));
                        }}
                        className="border p-2 rounded"
                      />
                      <input
                        type="text"
                        value={slot.label}
                        onChange={(e) => {
                          const newTimeSlots = [...editingField.timeSlots];
                          newTimeSlots[idx] = { ...slot, label: e.target.value };
                          setEditingField(prev => ({ ...prev, timeSlots: newTimeSlots }));
                        }}
                        className="flex-1 border p-2 rounded"
                        placeholder="Display label (e.g., 8:00 AM)"
                      />
                      <button
                        onClick={() => {
                          const newTimeSlots = editingField.timeSlots.filter((_, i) => i !== idx);
                          setEditingField(prev => ({ ...prev, timeSlots: newTimeSlots }));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newSlot = {
                        id: `slot_${Date.now()}_${Math.random()}`,
                        time: '09:00',
                        label: '9:00 AM'
                      };
                      const newTimeSlots = [...(editingField.timeSlots || []), newSlot];
                      setEditingField(prev => ({ ...prev, timeSlots: newTimeSlots }));
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Time Slot
                  </button>
                </div>
              )}

              {editingField.type === 'slider' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Value</label>
                    <input
                      type="number"
                      value={editingField.min}
                      onChange={(e) => setEditingField(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Value</label>
                    <input
                      type="number"
                      value={editingField.max}
                      onChange={(e) => setEditingField(prev => ({ ...prev, max: parseInt(e.target.value) || 100 }))}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                </div>
              )}

              {editingField.type === 'gdpr' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Privacy Policy URL</label>
                    <input
                      type="url"
                      value={editingField.privacyPolicyUrl}
                      onChange={(e) => setEditingField(prev => ({ ...prev, privacyPolicyUrl: e.target.value }))}
                      className="w-full border p-2 rounded"
                      placeholder="https://yourcompany.com/privacy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Terms & Conditions URL</label>
                    <input
                      type="url"
                      value={editingField.termsUrl}
                      onChange={(e) => setEditingField(prev => ({ ...prev, termsUrl: e.target.value }))}
                      className="w-full border p-2 rounded"
                      placeholder="https://yourcompany.com/terms"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditFieldCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditFieldSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview */}
      {fields.length > 0 ? (
        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                {field.type !== 'divider' && field.type !== 'checkbox' && field.type !== 'gdpr' && (
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderFieldPreview(field)}
              </div>
            ))}
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Submit Form
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
          <p className="text-gray-500">No custom fields added yet. Click "Add Field" to get started.</p>
        </div>
      )}
    </div>
  );
} 
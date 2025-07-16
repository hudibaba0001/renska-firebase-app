import React, { useState } from 'react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Modal, TextInput, Button } from 'flowbite-react';

function generateField(type) {
  // Generate a new field object with a unique ID and sensible defaults
  return {
    id: `${type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    // Add more default properties as needed
  };
}

export default function FormBuilderDragDrop() {
  const [fields, setFields] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [editingField, setEditingField] = useState(null); // Track which field is being edited
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    // If dropped from palette (sidebar) to canvas, add new field
    if (active.data?.current?.fromPalette && over?.id === 'canvas') {
      setFields(prev => [...prev, generateField(active.id)]);
    }
  };

  const handleEditField = (field, index) => {
    setEditingField({ ...field, index });
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditingField((prev) => ({ ...prev, [name]: value }));
  };

  // Dropdown options logic
  const handleDropdownOptionChange = (idx, value) => {
    setEditingField((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === idx ? value : opt) || []
    }));
  };
  const handleAddDropdownOption = () => {
    setEditingField((prev) => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };
  const handleRemoveDropdownOption = (idx) => {
    setEditingField((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== idx) || []
    }));
  };

  const handleEditFieldSave = () => {
    setFields((prev) => prev.map((f, i) =>
      i === editingField.index
        ? {
            ...f,
            label: editingField.label,
            placeholder: editingField.placeholder,
            ...(editingField.type === 'dropdown' ? { options: editingField.options || [] } : {}),
            ...(editingField.type === 'slider' ? { min: editingField.min ?? 0, max: editingField.max ?? 100 } : {})
          }
        : f
    ));
    setEditingField(null);
  };

  const handleEditFieldCancel = () => {
    setEditingField(null);
  };

  const handleDeleteField = (index) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  // Mock services and options for preview
  const mockServices = [
    {
      id: 'service1',
      name: 'Hemstädning',
      addOns: [
        { id: 'oven', label: 'Ugnsrengöring', price: 500 },
        { id: 'balcony', label: 'Balkong', price: 300 }
      ],
      windowCleaning: [
        { id: 'small', label: 'Litet fönster', price: 100 },
        { id: 'large', label: 'Stort fönster', price: 200 }
      ]
    },
    {
      id: 'service2',
      name: 'Storstädning',
      addOns: [
        { id: 'fridge', label: 'Kylskåpsrengöring', price: 400 }
      ],
      windowCleaning: []
    }
  ];
  const [selectedServiceId, setSelectedServiceId] = useState(mockServices[0].id);
  const selectedService = mockServices.find(s => s.id === selectedServiceId);

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex flex-1">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <FieldPalette />
          <FormCanvas fields={fields} setFields={setFields} onEdit={handleEditField} onDelete={handleDeleteField} />
        </DndContext>
        <Modal show={!!editingField} onClose={handleEditFieldCancel} size="md">
          <Modal.Header>Edit Field</Modal.Header>
          <Modal.Body>
            {editingField && (
              <div className="space-y-4">
                <TextInput
                  name="label"
                  label="Label"
                  value={editingField.label || ''}
                  onChange={handleEditFieldChange}
                  placeholder="Field label"
                  required
                />
                <TextInput
                  name="placeholder"
                  label="Placeholder"
                  value={editingField.placeholder || ''}
                  onChange={handleEditFieldChange}
                  placeholder="Field placeholder (optional)"
                  disabled={editingField.type === 'checkbox' || editingField.type === 'divider'}
                />
                {/* Slider min/max editing */}
                {editingField.type === 'slider' && (
                  <div className="flex gap-4">
                    <TextInput
                      name="min"
                      label="Min Value"
                      type="number"
                      value={editingField.min ?? 0}
                      onChange={e => setEditingField(prev => ({ ...prev, min: Number(e.target.value) }))}
                    />
                    <TextInput
                      name="max"
                      label="Max Value"
                      type="number"
                      value={editingField.max ?? 100}
                      onChange={e => setEditingField(prev => ({ ...prev, max: Number(e.target.value) }))}
                    />
                  </div>
                )}
                {/* Dropdown options editing */}
                {editingField.type === 'dropdown' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Dropdown Options</label>
                    <div className="space-y-2">
                      {(editingField.options || []).map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <TextInput
                            value={opt}
                            onChange={e => handleDropdownOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1"
                          />
                          <Button color="gray" size="xs" onClick={() => handleRemoveDropdownOption(idx)} disabled={(editingField.options || []).length <= 1}>Remove</Button>
                        </div>
                      ))}
                    </div>
                    <Button color="primary" size="xs" className="mt-2" onClick={handleAddDropdownOption}>Add Option</Button>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button color="primary" onClick={handleEditFieldSave}>Save</Button>
            <Button color="gray" onClick={handleEditFieldCancel}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </div>
      {/* Live form preview */}
      <div className="mt-8 p-6 bg-white rounded shadow max-w-xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Live Form Preview</h3>
        {/* Mock service selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tjänst</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedServiceId}
            onChange={e => setSelectedServiceId(e.target.value)}
          >
            {mockServices.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <form className="space-y-4">
          {fields.map((field) => (
            <div key={field.id}>
              {field.type !== 'divider' && field.type !== 'group' && (
                <label className="block text-sm font-medium mb-1">{field.label}</label>
              )}
              {field.type === 'text' && (
                <input type="text" className="w-full border p-2 rounded" placeholder={field.placeholder || ''} disabled />
              )}
              {field.type === 'checkbox' && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled />
                  <span>{field.label}</span>
                </div>
              )}
              {field.type === 'date' && (
                <input type="date" className="w-full border p-2 rounded" placeholder={field.placeholder || ''} disabled />
              )}
              {field.type === 'time' && (
                <input type="time" className="w-full border p-2 rounded" placeholder={field.placeholder || ''} disabled />
              )}
              {field.type === 'dropdown' && (
                <select className="w-full border p-2 rounded" disabled>
                  {(field.options && field.options.length > 0 ? field.options : ['Dropdown']).map((opt, i) => (
                    <option key={i}>{opt}</option>
                  ))}
                </select>
              )}
              {field.type === 'slider' && (
                <input type="range" className="w-full" min={field.min || 0} max={field.max || 100} disabled />
              )}
              {field.type === 'divider' && <hr className="my-4" />}
              {field.type === 'group' && (
                <div className="border rounded p-3 mb-4 bg-gray-50">
                  <div className="font-semibold mb-2">{field.label || 'Group'}</div>
                  <div className="text-gray-400 italic">(Group fields not yet implemented)</div>
                </div>
              )}
              {/* Add more field types as needed */}
            </div>
          ))}
          {/* Mock add-ons */}
          {selectedService && selectedService.addOns.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tilläggstjänster</label>
              <div className="space-y-2">
                {selectedService.addOns.map(addOn => (
                  <label key={addOn.id} className="flex items-center gap-2">
                    <input type="checkbox" disabled />
                    <span>{addOn.label} (+{addOn.price} kr)</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Mock window cleaning */}
          {selectedService && selectedService.windowCleaning.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fönsterputsning</label>
              <div className="space-y-2">
                {selectedService.windowCleaning.map(win => (
                  <label key={win.id} className="flex items-center gap-2">
                    <input type="number" min="0" className="w-16 border rounded p-1" placeholder="Antal" disabled />
                    <span>{win.label} ({win.price} kr/st)</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <button type="button" className="w-full bg-blue-600 text-white py-2 rounded" disabled>Submit</button>
        </form>
      </div>
    </div>
  );
} 
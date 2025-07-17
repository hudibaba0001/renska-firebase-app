import React, { useState } from 'react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import Modal from 'flowbite-react/lib/Modal';
import Button from 'flowbite-react/lib/Button';
import TextInput from 'flowbite-react/lib/TextInput';

function generateField(type) {
  // Generate a new field object with a unique ID and sensible defaults
  if (type === 'gdpr') {
    return {
      id: `gdpr_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type: 'gdpr',
      label: 'I consent to GDPR and accept the privacy policy and terms.',
      privacyPolicyUrl: '',
      termsUrl: '',
      required: true,
    };
  }
  if (type === 'zipCode') {
    return {
      id: `zipCode_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type: 'zipCode',
      label: 'ZIP Code',
      placeholder: 'Enter ZIP code',
      allowedZips: [],
    };
  }
  if (type === 'serviceSelector') {
    return {
      id: `serviceSelector_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type: 'serviceSelector',
      label: 'Service',
      placeholder: 'Select service',
    };
  }
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

  const handleEditField = (field) => {
    setEditingField({ ...field }); // Only store the field, not the index
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
    setFields((prev) => prev.map((f) =>
      f.id === editingField.id
        ? {
            ...f,
            label: editingField.label,
            placeholder: editingField.placeholder,
            ...(editingField.type === 'dropdown' ? { options: editingField.options || [] } : {}),
            ...(editingField.type === 'slider' ? { min: editingField.min ?? 0, max: editingField.max ?? 100 } : {}),
            ...(editingField.type === 'zipCode' ? { allowedZips: editingField.allowedZips || [] } : {}),
            ...(editingField.type === 'gdpr' ? { privacyPolicyUrl: editingField.privacyPolicyUrl || '', termsUrl: editingField.termsUrl || '', required: true } : {})
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

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex flex-1">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <FieldPalette />
          <FormCanvas fields={fields} setFields={setFields} onEdit={handleEditField} onDelete={handleDeleteField} />
        </DndContext>
      </div>
      
      {/* Modal outside DndContext to prevent conflicts */}
      {/* Temporarily commented out to debug Modal import issue */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Field (Debug Mode)</h3>
            <p>Field type: {editingField.type}</p>
            <p>Field label: {editingField.label}</p>
            <div className="mt-4 flex gap-2">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleEditFieldSave}
              >
                Save
              </button>
              <button 
                className="px-4 py-2 bg-gray-600 text-white rounded"
                onClick={handleEditFieldCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
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
              {field.type !== 'divider' && field.type !== 'group' && field.type !== 'gdpr' && (
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
              {field.type === 'gdpr' && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled />
                  <span>{field.label}</span>
                  {field.privacyPolicyUrl && (
                    <a href={field.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Privacy Policy</a>
                  )}
                  {field.termsUrl && (
                    <a href={field.termsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Terms & Conditions</a>
                  )}
                </div>
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
          {/* Prevent submit if GDPR is required and not all URLs are set */}
          {fields.some(f => f.type === 'gdpr' && (!f.privacyPolicyUrl || !f.termsUrl)) && (
            <div className="text-red-600 text-sm mb-2">Please provide both Privacy Policy and Terms & Conditions URLs for GDPR consent.</div>
          )}
          <button type="button" className="w-full bg-blue-600 text-white py-2 rounded" disabled={fields.some(f => f.type === 'gdpr' && (!f.privacyPolicyUrl || !f.termsUrl))}>Submit</button>
        </form>
      </div>
    </div>
  );
} 
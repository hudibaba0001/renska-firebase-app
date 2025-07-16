import React, { useState } from 'react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

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
    // UI for editing will be implemented next
  };

  const handleDeleteField = (index) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-[80vh]">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <FieldPalette />
        <FormCanvas fields={fields} setFields={setFields} onEdit={handleEditField} onDelete={handleDeleteField} />
      </DndContext>
      {/* Editing UI will be rendered here in the next step */}
    </div>
  );
} 
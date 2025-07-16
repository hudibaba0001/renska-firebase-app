import React from 'react';
import { useDraggable } from '@dnd-kit/core';

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'date', label: 'Date Picker' },
  { type: 'time', label: 'Time Picker' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'slider', label: 'Slider' },
  { type: 'zipCode', label: 'ZIP Code' },
  { type: 'serviceSelector', label: 'Service Selector' },
  { type: 'group', label: 'Group' },
  { type: 'divider', label: 'Divider' },
  // Add more as needed
];

function DraggableField({ type, label }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: type });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 mb-2 bg-white border rounded cursor-move ${isDragging ? 'opacity-50' : ''}`}
      style={{ userSelect: 'none' }}
    >
      {label}
    </div>
  );
}

export default function FieldPalette() {
  return (
    <aside className="w-64 p-4 bg-gray-50 border-r h-full overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Elements</h3>
      {FIELD_TYPES.map(f => (
        <DraggableField key={f.type} type={f.type} label={f.label} />
      ))}
    </aside>
  );
} 
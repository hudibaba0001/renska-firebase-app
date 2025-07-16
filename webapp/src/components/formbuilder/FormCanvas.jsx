import React from 'react';
import { DndContext, useDroppable, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

function Field({ field, index, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 bg-white border rounded shadow-sm flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
      style={{ transform: transform ? `translateY(${transform.y}px)` : undefined, transition }}
    >
      <div className="flex-1">
        <strong>{field.label}</strong>
        {/* Render field type preview */}
        {field.type === 'text' && <input type="text" className="mt-2 w-full border p-1 rounded" placeholder="Text input" disabled />}
        {field.type === 'checkbox' && <input type="checkbox" className="mt-2" disabled />}
        {field.type === 'date' && <input type="date" className="mt-2 w-full border p-1 rounded" disabled />}
        {field.type === 'time' && <input type="time" className="mt-2 w-full border p-1 rounded" disabled />}
        {field.type === 'dropdown' && (
          <select className="mt-2 w-full border p-1 rounded" disabled>
            {(field.options && field.options.length > 0
              ? field.options
              : ['Dropdown']
            ).map((opt, i) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
        )}
        {field.type === 'slider' && <input type="range" className="mt-2 w-full" disabled />}
        {field.type === 'divider' && <hr className="my-2" />}
        {/* Add more field types as needed */}
      </div>
      <div className="flex flex-col gap-1 ml-4">
        <button type="button" className="text-blue-600 hover:underline text-xs" onClick={() => onEdit(field, index)}>Edit</button>
        <button type="button" className="text-red-500 hover:underline text-xs" onClick={() => onDelete(index)}>Delete</button>
      </div>
    </div>
  );
}

export default function FormCanvas({ fields, setFields, onEdit, onDelete }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id);
      const newIndex = fields.findIndex(f => f.id === over.id);
      setFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const { setNodeRef } = useDroppable({ id: 'canvas' });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-1 min-h-[400px] bg-gray-100 p-4 rounded border-dashed border-2 border-gray-300">
          {fields.length === 0 && <div className="text-gray-400 text-center py-12">Drag fields here to build your form</div>}
          {fields.map((field, idx) => (
            <Field key={field.id} field={field} index={idx} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 
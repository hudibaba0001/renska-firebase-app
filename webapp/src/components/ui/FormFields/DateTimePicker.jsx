import React from 'react';
import { useCalculator } from '../../../context/calculatorContext';
import BaseField from './BaseField';

const DateTimePicker = ({
  name,
  label,
  required = false,
  helperText,
  className = '',
  minDate,
  maxDate,
  disabledDates = [],
  timeSlots = [],
  ...props
}) => {
  const { state, updateField } = useCalculator();
  const value = state.formData[name] || {};
  
  const handleDateChange = (e) => {
    updateField({
      [name]: {
        ...value,
        date: e.target.value
      }
    });
  };
  
  const handleTimeChange = (e) => {
    updateField({
      [name]: {
        ...value,
        time: e.target.value
      }
    });
  };
  
  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!value.date) return [];
    if (!timeSlots.length) {
      // Default time slots if none provided
      return [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00'
      ];
    }
    return timeSlots;
  };
  
  // Calculate min/max dates
  const today = new Date().toISOString().split('T')[0];
  const defaultMaxDate = new Date();
  defaultMaxDate.setMonth(defaultMaxDate.getMonth() + 3);
  
  const minDateStr = minDate || today;
  const maxDateStr = maxDate || defaultMaxDate.toISOString().split('T')[0];
  
  return (
    <BaseField
      name={name}
      label={label}
      required={required}
      helperText={helperText}
      className={className}
    >
      <div className="space-y-4">
        {/* Date picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum
          </label>
          <input
            type="date"
            value={value.date || ''}
            onChange={handleDateChange}
            min={minDateStr}
            max={maxDateStr}
            className={`
              block w-full rounded-md border-gray-300 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${state.errors[`${name}.date`] ? 'border-red-300' : ''}
            `}
            {...props}
          />
        </div>
        
        {/* Time picker */}
        {value.date && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tid
            </label>
            <select
              value={value.time || ''}
              onChange={handleTimeChange}
              className={`
                block w-full rounded-md border-gray-300 shadow-sm
                focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                ${state.errors[`${name}.time`] ? 'border-red-300' : ''}
              `}
            >
              <option value="">Välj tid</option>
              {getAvailableTimeSlots().map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </BaseField>
  );
};

export default DateTimePicker;
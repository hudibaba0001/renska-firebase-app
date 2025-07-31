import React from 'react';
import { useCalculator } from '../../../context/calculatorContext';
import BaseField from './BaseField';

const SelectInput = ({
  name,
  label,
  options = [],
  required = false,
  helperText,
  placeholder = 'Välj...',
  className = '',
  isLoading = false,
  ...props
}) => {
  const { state, updateField } = useCalculator();
  const value = state.formData[name] || '';
  
  const handleChange = (e) => {
    updateField({ [name]: e.target.value });
  };
  
  return (
    <BaseField
      name={name}
      label={label}
      required={required}
      helperText={helperText}
      className={className}
    >
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            ${state.errors[name] ? 'border-red-300' : ''}
            disabled:bg-gray-50 disabled:text-gray-500
            ${isLoading ? 'opacity-50' : ''}
          `}
          disabled={isLoading}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
            <div className="h-4 w-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" />
          </div>
        )}
      </div>
    </BaseField>
  );
};

export default SelectInput;
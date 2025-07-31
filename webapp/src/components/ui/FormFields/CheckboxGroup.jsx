import React from 'react';
import { useCalculator } from '../../../context/calculatorContext';
import BaseField from './BaseField';

const CheckboxGroup = ({
  name,
  label,
  options = [],
  required = false,
  helperText,
  className = '',
  columns = 1,
  ...props
}) => {
  const { state, updateField } = useCalculator();
  const values = state.formData[name] || [];
  
  const handleChange = (optionValue) => {
    const newValues = values.includes(optionValue)
      ? values.filter(v => v !== optionValue)
      : [...values, optionValue];
    
    updateField({ [name]: newValues });
  };
  
  return (
    <BaseField
      name={name}
      label={label}
      required={required}
      helperText={helperText}
      className={className}
    >
      <div 
        className={`
          grid gap-4
          ${columns === 1 ? 'grid-cols-1' : 
            columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            columns === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'}
        `}
      >
        {options.map(({ value, label, price, description }) => (
          <label
            key={value}
            className={`
              relative flex items-start p-4 rounded-lg border
              ${values.includes(value) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'}
              cursor-pointer transition-colors duration-200
            `}
          >
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={values.includes(value)}
                onChange={() => handleChange(value)}
                className="
                  h-4 w-4 text-blue-600 border-gray-300 rounded
                  focus:ring-blue-500 cursor-pointer
                "
                {...props}
              />
            </div>
            
            <div className="ml-3 flex-grow">
              <span className="block text-sm font-medium text-gray-900">
                {label}
              </span>
              
              {description && (
                <span className="block text-sm text-gray-500 mt-1">
                  {description}
                </span>
              )}
              
              {price !== undefined && (
                <span className="block text-sm font-medium text-gray-900 mt-1">
                  {typeof price === 'number' 
                    ? new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: 'SEK'
                      }).format(price)
                    : price
                  }
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </BaseField>
  );
};

export default CheckboxGroup;
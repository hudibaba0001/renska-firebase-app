import React from 'react';
import { useCalculator } from '../../../context/calculatorContext';
import BaseField from './BaseField';

const TextInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  helperText,
  pattern,
  maxLength,
  minLength,
  autoComplete,
  className = '',
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
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        pattern={pattern}
        maxLength={maxLength}
        minLength={minLength}
        autoComplete={autoComplete}
        className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-blue-500 focus:ring-blue-500 sm:text-sm
          ${state.errors[name] ? 'border-red-300' : ''}
          disabled:bg-gray-50 disabled:text-gray-500
        `}
        {...props}
      />
    </BaseField>
  );
};

export default TextInput;
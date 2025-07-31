import React from 'react';
import { useCalculator } from '../../../context/calculatorContext';

// Base field wrapper with error handling and common functionality
const BaseField = ({ 
  name,
  label,
  required,
  children,
  helperText,
  className = ''
}) => {
  const { state } = useCalculator();
  const error = state.errors[name];
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default BaseField;
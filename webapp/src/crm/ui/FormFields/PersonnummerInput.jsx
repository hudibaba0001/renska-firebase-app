import React from 'react';

const PersonnummerInput = ({ 
  value, 
  onChange, 
  required = false, 
  disabled = false,
  className = "",
  placeholder = "YYYYMMDD-XXXX"
}) => {
  const validatePersonnummer = (input) => {
    // Swedish personnummer format: YYYYMMDD-XXXX
    const pattern = /^\d{8}-\d{4}$/;
    return pattern.test(input);
  };

  const handleChange = (e) => {
    const input = e.target.value;
    
    // Auto-format: add dash after 8 digits
    let formatted = input;
    if (input.length === 8 && !input.includes('-')) {
      formatted = input + '-';
    }
    
    // Only allow digits and dash
    formatted = formatted.replace(/[^\d-]/g, '');
    
    // Limit to 13 characters (YYYYMMDD-XXXX)
    if (formatted.length <= 13) {
      onChange(formatted);
    }
  };

  const isValid = value ? validatePersonnummer(value) : true;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Personnummer {required && '*'}
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isValid 
            ? 'border-gray-300' 
            : 'border-red-300 focus:ring-red-500'
        } ${className}`}
      />
      {value && !isValid && (
        <p className="text-xs text-red-600 mt-1">
          Personnummer måste vara i formatet YYYYMMDD-XXXX
        </p>
      )}
    </div>
  );
};

export default PersonnummerInput;
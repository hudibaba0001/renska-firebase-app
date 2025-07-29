import React from 'react';

const RUTToggle = ({ 
  checked, 
  onChange, 
  isCompany = false, 
  className = "" 
}) => {
  return (
    <div className={`bg-green-50 p-3 rounded-lg ${className}`}>
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <span className="text-sm font-medium text-green-800">
          RUT/ROT-berättigad
        </span>
      </label>
      <p className="text-xs text-green-600 mt-1">
        {isCompany ? 'ROT för renoveringar' : 'RUT för hemstädning'}
      </p>
    </div>
  );
};

export default RUTToggle;
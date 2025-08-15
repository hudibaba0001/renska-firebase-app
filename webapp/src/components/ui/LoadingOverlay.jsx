import React from 'react';
import { Spinner } from 'flowbite-react';

const LoadingOverlay = ({ 
  isLoading, 
  message = 'Processing...', 
  blur = true,
  fullscreen = false
}) => {
  if (!isLoading) return null;
  
  return (
    <div 
      className={`
        fixed inset-0 flex items-center justify-center z-50
        ${blur ? 'backdrop-blur-sm' : ''}
        ${fullscreen ? '' : 'bg-white/50'}
      `}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <Spinner size="md" />
        <span className="text-gray-700">{message}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
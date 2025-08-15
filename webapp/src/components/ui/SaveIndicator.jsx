import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const SaveIndicator = ({ 
  show, 
  message = 'Progress saved',
  duration = 2000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
      <CheckCircleIcon className="w-5 h-5 text-green-400" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default SaveIndicator;
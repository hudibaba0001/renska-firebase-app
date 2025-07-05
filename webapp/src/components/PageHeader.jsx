import React from 'react';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PageHeader({ title, backLink, subtitle }) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (backLink) {
      navigate(backLink);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button
          color="gray"
          size="sm"
          onClick={handleBackClick}
          className="font-mono"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 font-mono">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 font-mono mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
} 
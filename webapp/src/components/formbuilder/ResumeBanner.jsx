import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ResumeBanner = ({ onResume, onDecline }) => {
  return (
    <div className="relative mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Vill du fortsätta din tidigare bokning?
          </h3>
          <p className="mt-1 text-sm text-blue-600">
            Vi hittade en sparad bokning. Du kan fortsätta där du slutade eller börja om.
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={onResume}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fortsätt
          </button>
          <button
            onClick={onDecline}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Börja om
          </button>
        </div>
        <button
          onClick={onDecline}
          className="absolute top-2 right-2 text-blue-400 hover:text-blue-500"
        >
          <XMarkIcon className="w-5 h-5" />
          <span className="sr-only">Stäng</span>
        </button>
      </div>
    </div>
  );
};

export default ResumeBanner;
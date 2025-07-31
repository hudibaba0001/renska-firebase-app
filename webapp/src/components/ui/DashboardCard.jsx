import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/solid';

const TrendIndicator = ({ trend }) => {
  switch (trend) {
    case 'up':
      return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
    case 'down':
      return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
    case 'attention':
      return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
    case 'good':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'neutral':
    default:
      return <MinusIcon className="h-5 w-5 text-gray-400" />;
  }
};

export const DashboardCard = ({ title, value, trend = 'neutral' }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <TrendIndicator trend={trend} />
      </div>
      
      <div className="mt-2">
        <div className="text-2xl font-semibold text-gray-900">
          {value}
        </div>
      </div>
    </div>
  );
};
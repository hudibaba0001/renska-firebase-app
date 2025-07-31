import React from 'react';
import { useCalculator } from '../../context/calculatorContext';
import { CheckIcon } from '@heroicons/react/24/solid';
import { stepOrder } from './calculatorSteps';

const ProgressBar = () => {
  const { state } = useCalculator();
  const { currentStep } = state;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {stepOrder.map((stepId, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div
              key={stepId}
              className={`flex items-center ${
                index < stepOrder.length - 1 ? 'flex-1' : ''
              }`}
            >
              {/* Step circle */}
              <div
                className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full
                  ${
                    isCompleted
                      ? 'bg-green-600'
                      : isCurrent
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5 text-white" />
                ) : (
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Connector line */}
              {index < stepOrder.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between mt-2">
        {stepOrder.map((stepId, index) => (
          <div
            key={`label-${stepId}`}
            className={`text-xs font-medium ${
              index === currentStep
                ? 'text-blue-600'
                : index < currentStep
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
            style={{ width: '80px', textAlign: 'center' }}
          >
            {stepId}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
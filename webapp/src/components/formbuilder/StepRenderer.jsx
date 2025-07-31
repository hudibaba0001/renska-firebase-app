import React from 'react';
import { useCalculator } from '../../context/calculatorContext';
import { TextInput, NumberInput, Select, CheckboxGroup } from '../ui/FormFields';
import { getStepByIndex, isLastStep, isFirstStep } from './calculatorSteps';

const StepRenderer = ({ config, onSubmit }) => {
  const { state, updateField, nextStep, prevStep } = useCalculator();
  const { currentStep, formData } = state;
  
  const step = getStepByIndex(currentStep);
  
  if (!step) {
    return <div>Invalid step</div>;
  }
  
  const handleFieldChange = (changes) => {
    updateField(changes);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate current step
      await step.validation.validate(formData, { abortEarly: false });
      
      if (isLastStep(currentStep)) {
        onSubmit(formData);
      } else {
        nextStep();
      }
    } catch (err) {
      // Handle validation errors
      const errors = {};
      err.inner.forEach(error => {
        errors[error.path] = error.message;
      });
      // TODO: Show validation errors in UI
      console.error('Validation errors:', errors);
    }
  };
  
  const renderField = (field) => {
    // Check field dependencies
    if (field.dependsOn) {
      const { field: depField, value } = field.dependsOn;
      if (formData[depField] !== value) {
        return null;
      }
    }
    
    const commonProps = {
      key: field.name,
      label: field.label,
      name: field.name,
      value: formData[field.name],
      onChange: handleFieldChange,
      required: field.required,
      ...field.props
    };
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return <TextInput {...commonProps} type={field.type} />;
        
      case 'number':
        return <NumberInput {...commonProps} />;
        
      case 'select':
        return (
          <Select
            {...commonProps}
            options={field.options || config?.dynamicOptions?.[field.name] || []}
          />
        );
        
      case 'checkboxGroup':
        return (
          <CheckboxGroup
            {...commonProps}
            options={field.options || config?.dynamicOptions?.[field.name] || []}
            values={formData[field.name] || []}
          />
        );
        
      case 'checkbox':
        return (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData[field.name] || false}
                onChange={e => handleFieldChange({ [field.name]: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">{field.label}</span>
            </label>
          </div>
        );
        
      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <textarea
              value={formData[field.name] || ''}
              onChange={e => handleFieldChange({ [field.name]: e.target.value })}
              rows={field.rows || 3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        );
        
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{step.title}</h2>
        {step.description && (
          <p className="text-gray-600 mt-1">{step.description}</p>
        )}
      </div>
      
      <div className="space-y-4">
        {step.fields.map(renderField)}
      </div>
      
      <div className="flex justify-between mt-8">
        {!isFirstStep(currentStep) && (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Tillbaka
          </button>
        )}
        
        <button
          type="submit"
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isLastStep(currentStep) ? 'Bekräfta bokning' : 'Nästa'}
        </button>
      </div>
    </form>
  );
};

export default StepRenderer;
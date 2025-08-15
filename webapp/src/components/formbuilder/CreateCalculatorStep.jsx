import React, { useState } from 'react';

export default function CreateCalculatorStep({ config, updateConfig, onNext }) {
  const [errors, setErrors] = useState({});

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[éê]/g, 'e')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (name) => {
    updateConfig({ 
      name,
      slug: config.slug || generateSlug(name)
    });
    
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleSlugChange = (slug) => {
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim('-');
    
    updateConfig({ slug: cleanSlug });
    
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: '' }));
    }
  };

  const validateAndProceed = () => {
    const newErrors = {};
    
    if (!config.name?.trim()) {
      newErrors.name = 'Calculator name is required';
    }
    
    if (!config.slug?.trim()) {
      newErrors.slug = 'URL slug is required';
    } else if (!/^[a-z0-9-]+$/.test(config.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Create New Calculator</h2>
        
        <div className="space-y-6">
          {/* Calculator Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calculator Name *
            </label>
            <input
              type="text"
              value={config.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Hemstädning Premium"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              This will be shown to your customers as the form title
            </p>
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2">
                /booking/my-company/
              </span>
              <input
                type="text"
                value={config.slug || ''}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="hemstadning-premium"
              />
            </div>
            {errors.slug && (
              <p className="text-red-600 text-sm mt-1">{errors.slug}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              This will be the URL where customers access your calculator
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={config.description || ''}
              onChange={(e) => updateConfig({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Internal description for your team (not shown to customers)"
            />
            <p className="text-gray-500 text-sm mt-1">
              This is for your internal reference only
            </p>
          </div>

          {/* Preview */}
          {config.name && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Form Title:</strong> {config.name}</p>
                <p><strong>URL:</strong> /booking/my-company/{config.slug}</p>
                {config.description && (
                  <p><strong>Description:</strong> {config.description}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <button
            onClick={validateAndProceed}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue to Services
          </button>
        </div>
      </div>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllServicesForCompany } from '../../services/firestore';
import { Card, Button, Badge, Alert, Spinner, Checkbox } from 'flowbite-react';
import { ExclamationTriangleIcon, CogIcon } from '@heroicons/react/24/outline';
import ServicePricingEditor from './ServicePricingEditor';
import toast from 'react-hot-toast';

// Define a local PRICING_MODELS constant
const PRICING_MODELS = [
  { id: 'fixed_tier', name: 'Fixed Tier', description: 'Fixed price per service', icon: '💰' },
  { id: 'tiered_multiplier', name: 'Tiered Multiplier', description: 'Price based on tiers', icon: '📊' },
  { id: 'per_sqm_tiered', name: 'Per Sqm Tiered', description: 'Price per square meter, tiered', icon: '📏' },
  // Add more as needed
];

export default function DefineServicesStep({ config, updateConfig, onNext, onPrev }) {
  const { companyId } = useParams();
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const [editingService, setEditingService] = useState(null);

  // Fetch configured services from company configuration
  useEffect(() => {
    async function fetchCompanyServices() {
      if (!companyId) return;
      setServicesLoading(true);
      setServicesError('');
      try {
        const services = await getAllServicesForCompany(companyId);
        setAvailableServices(services);
      } catch (error) {
        console.error('Error fetching company services:', error);
        setServicesError('Failed to load company services');
      } finally {
        setServicesLoading(false);
      }
    }
    fetchCompanyServices();
  }, [companyId]);

  // Defensive: always treat config.services as an array
  const servicesArray = Array.isArray(config.services) ? config.services : [];

  // Handle selection of available services
  const handleServiceToggle = (service) => {
    const exists = servicesArray.some(s => s.id === service.id);
    if (exists) {
      // Remove from config.services
      updateConfig({ services: servicesArray.filter(s => s.id !== service.id) });
      if (editingService === service.id) setEditingService(null);
    } else {
      // Add to config.services
      updateConfig({ services: [...servicesArray, { ...service }] });
      setEditingService(service.id);
    }
  };

  // Navigation handler
  const handleNext = () => {
    if (servicesArray.length === 0) {
      toast.warning('Please select at least one service to continue.');
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Services</h2>
            </div>
            <div className="space-y-3">
              {servicesLoading && <Spinner />}
              {servicesError && <Alert color="failure">{servicesError}</Alert>}
              {availableServices.map((service) => {
                const checked = servicesArray.some(s => s.id === service.id);
                return (
                  <div key={service.id} className={`flex items-center p-2 border rounded-lg mb-2 ${checked ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'}`}>
                    <Checkbox
                      checked={checked}
                      onChange={() => handleServiceToggle(service)}
                      className="mr-2"
                      id={`select-service-${service.id}`}
                    />
                    <label htmlFor={`select-service-${service.id}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{service.name || 'Unnamed Service'}</span>
                      <span className="block text-xs text-gray-500">{service.description}</span>
                    </label>
                  </div>
                );
              })}
              {availableServices.length === 0 && !servicesLoading && (
                <div className="text-center py-8 text-gray-500">
                  <p>No services found in company configuration.</p>
                  <p className="text-sm">Add services in the company settings first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* No ServiceEditor or pricing/add-on UI */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a service to display in your booking form
              </h3>
              <p className="text-gray-500">
                Choose one or more services from the list on the left. Pricing, add-ons, and frequency are managed in Settings.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Custom Form →
        </button>
      </div>
    </div>
  );
} 
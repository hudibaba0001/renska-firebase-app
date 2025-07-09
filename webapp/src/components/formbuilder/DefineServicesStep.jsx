import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/init';
import { doc, getDoc } from 'firebase/firestore';
import { Card, Button, Badge, Alert, Spinner, Checkbox } from 'flowbite-react';
import { ExclamationTriangleIcon, CogIcon } from '@heroicons/react/24/outline';

export default function DefineServicesStep({ config, updateConfig, onNext, onPrev }) {
  const { companyId } = useParams();
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');

  // Fetch configured services from company configuration
  useEffect(() => {
    async function fetchCompanyServices() {
      if (!companyId) return;
      
      setServicesLoading(true);
      setServicesError('');
      try {
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          const companyData = companySnap.data();
          const services = companyData.services || [];
          setAvailableServices(services);
          
          // If no services selected yet, pre-select all available enabled services
          if (!config.services || config.services.length === 0) {
            const enabledServices = services
              .filter(service => service.enabled !== false)
              .map(service => service.id);
            updateConfig({ selectedServices: enabledServices });
          }
        } else {
          setAvailableServices([]);
        }
      } catch (error) {
        console.error('Error fetching company services:', error);
        setServicesError('Failed to load company services');
      } finally {
        setServicesLoading(false);
      }
    }
    
    fetchCompanyServices();
  }, [companyId]);

  const toggleServiceSelection = (serviceId) => {
    const currentSelected = config.selectedServices || [];
    const newSelected = currentSelected.includes(serviceId)
      ? currentSelected.filter(id => id !== serviceId)
      : [...currentSelected, serviceId];
    
    updateConfig({ selectedServices: newSelected });
  };

  const canProceed = () => {
    return config.selectedServices && config.selectedServices.length > 0;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Services for Your Calculator</h2>
          <p className="text-gray-600">Choose which services from your company configuration to include in this booking calculator.</p>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : servicesError ? (
          <Alert color="failure">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="ml-2">{servicesError}</span>
          </Alert>
        ) : availableServices.length === 0 ? (
          <Alert color="warning">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <div className="ml-2">
              <span className="font-medium">No services configured yet.</span>
              <p className="mt-1">You need to configure your company services first before creating a calculator.</p>
              <div className="mt-3">
                <Button 
                  as="a" 
                  href={`/admin/${companyId}/config`}
                  color="blue"
                  size="sm"
                >
                  <CogIcon className="h-4 w-4 mr-1" />
                  Configure Services
                </Button>
              </div>
            </div>
          </Alert>
        ) : (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Available Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableServices.map((service) => {
                  const isSelected = config.selectedServices?.includes(service.id) || false;
                  return (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleServiceSelection(service.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleServiceSelection(service.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{service.name || 'Unnamed Service'}</h4>
                            <Badge color={service.enabled !== false ? "success" : "gray"} size="sm">
                              {service.enabled !== false ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{service.description || 'No description'}</p>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Base Price:</span>
                              <span className="font-medium">{service.basePrice || 0} DKK</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pricing Model:</span>
                              <span className="capitalize">{service.pricingModel?.replace('_', ' ') || 'fixed'}</span>
                            </div>
                            {service.pricingModel === 'per_sqm' && service.pricePerSqm && (
                              <div className="flex justify-between">
                                <span>Per SQM:</span>
                                <span className="font-medium">{service.pricePerSqm} DKK</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {config.selectedServices && config.selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>{config.selectedServices.length}</strong> service(s) selected for this calculator.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            color="gray"
            onClick={onPrev}
          >
            ← Previous
          </Button>
          
          <Button
            color="blue"
            onClick={onNext}
            disabled={!canProceed()}
          >
            Continue to Global Options →
          </Button>
        </div>
      </div>
    </div>
  );
} 
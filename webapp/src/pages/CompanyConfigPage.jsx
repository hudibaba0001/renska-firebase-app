// webapp/src/pages/CompanyConfigPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Import the tenant service functions, which will handle fetching and updating the company config.
import { getTenant, updateTenant } from '../services/firestore';
import ServiceConfigForm from '../components/ServiceConfigForm';
import LivePreview from '../components/LivePreview';
import ErrorBoundary from '../components/ErrorBoundary';
import { Spinner, Alert } from 'flowbite-react';
import toast from 'react-hot-toast';

export default function CompanyConfigPage({ companyId: propCompanyId }) {
  const routeParams = useParams();
  const companyId = propCompanyId || routeParams.companyId;
  const [config, setConfig] = useState(null);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    /**
     * Fetches the company's configuration using the centralized `getTenant` service.
     */
    async function fetchConfig() {
      setLoading(true);
      setError('');
      try {
        // Use the service layer to get the tenant/company data.
        const configData = await getTenant(companyId);
        
        if (configData) {
          setConfig(configData);
          setPreviewConfig(configData);
        } else {
          // If a company document doesn't exist, we can't configure it.
          // This is a safeguard. In a real app, a company should always exist at this point.
          setError('Could not find company configuration.');
          toast.error('Company not found. Cannot load configuration.');
        }
      } catch (error) {
        console.error('Error loading config:', error);
        setError('Failed to load configuration.');
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
        fetchConfig();
    } else {
        setError("No company ID provided.");
        setLoading(false);
    }
  }, [companyId]);

  /**
   * Saves the updated configuration using the `updateTenant` service function.
   * @param {object} newConfig - The complete, updated configuration object.
   */
  const handleSave = async (newConfig) => {
    try {
      console.log('🔧 Saving config for company:', companyId);
      // Use the service layer to update the tenant/company document.
      await updateTenant(companyId, newConfig);
      toast.success('Configuration saved successfully!');
      // Update the main config state after a successful save.
      setConfig(newConfig);
    } catch (error) {
      console.error('❌ Error saving config:', error);
      toast.error(error.message || 'Failed to save configuration.');
      // Re-throw to let the calling component know the save failed.
      throw error;
    }
  };
  
  // This function is passed down to the form to update the live preview.
  const handleConfigChange = (newConfig) => {
    setPreviewConfig(newConfig);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600">Loading configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert color="failure">
          <h3 className="font-medium">Error</h3>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Configuration</h1>
        <p className="text-gray-600">Configure your services, pricing models, and global settings.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ErrorBoundary>
            <ServiceConfigForm 
              initialConfig={config}
              onSave={handleSave}
              onChange={handleConfigChange}
            />
          </ErrorBoundary>
        </div>
        
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <LivePreview config={previewConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}

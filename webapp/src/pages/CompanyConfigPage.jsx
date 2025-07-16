// webapp/src/pages/CompanyConfigPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAllServicesForCompany, getTenant, updateTenant } from '../services/firestore';
import ConfigForm from '../components/ConfigForm';
import LivePreview from '../components/LivePreview';
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
    async function fetchConfig() {
      if (!companyId) return;
      setLoading(true);
      setError('');
      try {
        // Fetch both company config and services
        const [companyDoc, services] = await Promise.all([
          getTenant(companyId),
          getAllServicesForCompany(companyId)
        ]);
        setConfig({ ...companyDoc, services });
      } catch (error) {
        console.error('Error fetching company config:', error);
        setError('Failed to load company configuration');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
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
        <p className="mt-4 text-text-main dark:text-white">Loading configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert color="failure">
          <h3 className="font-medium text-text-heading dark:text-white">Error</h3>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-heading dark:text-white">Company Configuration</h1>
        <p className="text-text-main dark:text-white">Configure your services, pricing models, and global settings.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ConfigForm 
            initialConfig={config}
            onSave={handleSave}
            onChange={handleConfigChange}
          />
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

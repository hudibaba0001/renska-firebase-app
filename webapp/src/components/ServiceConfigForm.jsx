// webapp/src/components/ServiceConfigForm.jsx

import React, { useState, useEffect } from 'react';
import { Card, Button, TextInput, Select, Label, Checkbox, Accordion, Table, Alert, Badge, Spinner } from 'flowbite-react';
import { PlusIcon, TrashIcon, CogIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
    // Import the full suite of service functions.
    getAllServicesForCompany,
    createService,
    updateService,
    deleteService
} from '../services/firestore';

// Pricing model constants remain the same.
const PRICING_MODELS = { /* ... (no changes) ... */ };
const newServiceTemplate = () => ({ /* ... (no changes) ... */ });

export default function ServiceConfigForm({ initialConfig }) {
    const companyId = initialConfig?.id;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingServices, setSavingServices] = useState(new Set());
    const [expandedService, setExpandedService] = useState(null); // Only one expanded at a time

    // Always fetch services from Firestore after any CRUD operation
    const fetchServices = async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const fetchedServices = await getAllServicesForCompany(companyId);
            console.log('Fetched services from Firestore:', fetchedServices); // Debug log
            setServices(fetchedServices);
        } catch (error) {
            toast.error(`Failed to load services: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line
    }, [companyId]);

    // After fetching services, ensure expandedService is still valid
    useEffect(() => {
        if (expandedService && !services.some(s => s.id === expandedService)) {
            setExpandedService(null);
        }
    }, [services, expandedService]);

    const handleAddService = async () => {
        if (!companyId) return;
        const newService = newServiceTemplate();
        try {
            const newServiceId = await createService(companyId, newService);
            await fetchServices();
            setExpandedService(newServiceId); // Expand the new service
            toast.success('New service added. You can now configure it.');
        } catch (error) {
            toast.error(`Failed to add service: ${error.message}`);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!companyId || !serviceId) return;
        try {
            await deleteService(companyId, serviceId);
            await fetchServices();
            if (expandedService === serviceId) setExpandedService(null); // Collapse if deleted
            toast.success('Service deleted successfully.');
        } catch (error) {
            toast.error(`Failed to delete service: ${error.message}`);
        }
    };

    const handleUpdateService = async (serviceId, updates) => {
        if (!companyId || !serviceId) return;
        setSavingServices(prev => new Set(prev).add(serviceId));
        try {
            await updateService(companyId, serviceId, updates);
            await fetchServices(); // Always reload from Firestore
        } catch (error) {
            toast.error(`Failed to save service: ${error.message}`);
        } finally {
            setSavingServices(prev => {
                const newSet = new Set(prev);
                newSet.delete(serviceId);
                return newSet;
            });
        }
    };

    if (loading) {
        return <div className="p-6 text-center"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" id="services-heading">Services</h2>
                    <Button color="primary" onClick={handleAddService} aria-label="Add Service">
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Service
                    </Button>
                </div>
                <div className="space-y-4" aria-labelledby="services-heading">
                    {services.length === 0 && (
                        <div className="text-gray-500 text-center py-8">No services configured yet.</div>
                    )}
                    {services.map((service, idx) => {
                        const isExpanded = expandedService === service.id;
                        const isSaving = savingServices.has(service.id);
                        return (
                            <div key={service.id || idx} className="border rounded-lg mb-2">
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                                    onClick={() => {
                                        console.log('Clicked service header', service.id, 'was expanded:', isExpanded);
                                        setExpandedService(isExpanded ? null : service.id);
                                    }}
                                    aria-expanded={isExpanded}
                                    aria-controls={`service-panel-${service.id}`}
                                >
                                    <h3 className="font-semibold">{service.name || `Service #${idx + 1}`}</h3>
                                    <div className="flex items-center gap-2">
                                        {isSaving && <Spinner size="sm" />}
                                        <Button size="xs" color="failure" onClick={e => { e.stopPropagation(); handleDeleteService(service.id); }} aria-label={`Delete ${service.name || `Service #${idx + 1}`}`}> <TrashIcon className="h-4 w-4" /> </Button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="border-t p-4 space-y-4 bg-white" id={`service-panel-${service.id}`}> 
                                        {console.log('Rendering expanded panel for', service.id)}
                                        <TextInput label="Service Name" value={service.name || ''} onChange={e => handleUpdateService(service.id, { name: e.target.value })} aria-label="Service Name" />
                                        <TextInput label="Description" value={service.description || ''} onChange={e => handleUpdateService(service.id, { description: e.target.value })} aria-label="Description" />
                                        <Select label="Pricing Model" value={service.pricingModel} onChange={e => handleUpdateService(service.id, { pricingModel: e.target.value })} aria-label="Pricing Model">
                                            <option value={PRICING_MODELS.FIXED_TIER}>Fixed Tier</option>
                                            <option value={PRICING_MODELS.TIERED_MULTIPLIER}>Tiered Multiplier</option>
                                            {/* ... other options */}
                                        </Select>
                                        {/* PricingModelFields and ServiceAdvancedFields removed */}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

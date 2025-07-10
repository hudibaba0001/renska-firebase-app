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
function PricingModelFields({ service, updateServiceInState }) { /* ... (UI logic, but uses updateServiceInState now) ... */ }
function ServiceAdvancedFields({ service, updateServiceInState }) { /* ... (UI logic, but uses updateServiceInState now) ... */ }
function validateService(service) { /* ... (no changes) ... */ }
function hydrateService(service) { /* ... (no changes) ... */ }

export default function ServiceConfigForm({ initialConfig, onChange, onSave }) {
    const companyId = initialConfig?.id;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingServices, setSavingServices] = useState(new Set());
    const [expandedServices, setExpandedServices] = useState(new Set());

    /**
     * Fetch all services for the company from the Firestore subcollection
     * when the component mounts.
     */
    useEffect(() => {
        if (!companyId) {
            setLoading(false);
            return;
        }
        const fetchServices = async () => {
            setLoading(true);
            try {
                const fetchedServices = await getAllServicesForCompany(companyId);
                // Hydrate services with default values to ensure all fields exist.
                setServices(fetchedServices.map(hydrateService));
            } catch (error) {
                toast.error(`Failed to load services: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [companyId]);

    /**
     * Creates a new service document in the Firestore subcollection.
     */
    const handleAddService = async () => {
        if (!companyId) return;
        const newService = newServiceTemplate();
        console.log('handleAddService called', { companyId, newService });
        try {
            // Call the service function to create the document in Firestore.
            const newServiceId = await createService(companyId, newService);
            // On success, add the new service (with its new ID) to the local state.
            setServices(prev => [...prev, { ...newService, id: newServiceId }]);
            // Auto-expand the new service for immediate editing.
            setExpandedServices(prev => new Set(prev).add(newServiceId));
            toast.success('New service added. You can now configure it.');
        } catch (error) {
            toast.error(`Failed to add service: ${error.message}`);
        }
    };

    /**
     * Deletes a service document from the Firestore subcollection.
     */
    const handleDeleteService = async (serviceId) => {
        if (!companyId || !serviceId) return;
        // Optimistic UI: remove from local state first.
        const originalServices = [...services];
        setServices(prev => prev.filter(s => s.id !== serviceId));
        try {
            // Call the service function to delete the document.
            await deleteService(companyId, serviceId);
            toast.success('Service deleted successfully.');
        } catch (error) {
            // If the delete fails, revert the local state.
            setServices(originalServices);
            toast.error(`Failed to delete service: ${error.message}`);
        }
    };

    /**
     * Updates a single service document in Firestore.
     * Each field change now triggers a save for that specific service.
     */
    const handleUpdateService = async (serviceId, updates) => {
        if (!companyId || !serviceId) return;

        setSavingServices(prev => new Set(prev).add(serviceId));
        // Update the state locally for immediate UI feedback.
        updateServiceInState(serviceId, updates);

        try {
            // Debounce or throttle this in a real app if changes are frequent.
            // For now, we save on each change.
            await updateService(companyId, serviceId, updates);
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

    /**
     * Helper to update the service object in the local state array.
     */
    const updateServiceInState = (serviceId, updates) => {
        setServices(prevServices =>
            prevServices.map(s =>
                s.id === serviceId ? { ...s, ...updates } : s
            )
        );
    };

    if (loading) {
        return <div className="p-6 text-center"><Spinner /></div>;
    }

    // JSX is updated to use the new handlers.
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Services</h2>
                    <Button color="primary" onClick={handleAddService}>
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Service
                    </Button>
                </div>
                <div className="space-y-4">
                    {services.length === 0 && (
                        <div className="text-gray-500 text-center py-8">No services configured yet.</div>
                    )}
                    {services.map((service, idx) => {
                        const isExpanded = expandedServices.has(service.id);
                        const isSaving = savingServices.has(service.id);
                        return (
                            <div key={service.id || idx} className="border rounded-lg">
                                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedServices(prev => { const s = new Set(prev); s.has(service.id) ? s.delete(service.id) : s.add(service.id); return s; })}>
                                    <h3 className="font-semibold">{service.name || `Service #${idx + 1}`}</h3>
                                    <div className="flex items-center gap-2">
                                        {isSaving && <Spinner size="sm" />}
                                        <Button size="xs" color="failure" onClick={(e) => { e.stopPropagation(); handleDeleteService(service.id); }}>
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="border-t p-4 space-y-4">
                                        {/* Pass handleUpdateService to child components */}
                                        <TextInput label="Service Name" value={service.name || ''} onChange={e => handleUpdateService(service.id, { name: e.target.value })} />
                                        <TextInput label="Description" value={service.description || ''} onChange={e => handleUpdateService(service.id, { description: e.target.value })} />
                                        <Select label="Pricing Model" value={service.pricingModel} onChange={e => handleUpdateService(service.id, { pricingModel: e.target.value })}>
                                            <option value={PRICING_MODELS.FIXED_TIER}>Fixed Tier</option>
                                            <option value={PRICING_MODELS.TIERED_MULTIPLIER}>Tiered Multiplier</option>
                                            {/* ... other options */}
                                        </Select>
                                        <PricingModelFields service={service} updateServiceInState={(id, updates) => handleUpdateService(id, updates)} />
                                        <ServiceAdvancedFields service={service} updateServiceInState={(id, updates) => handleUpdateService(id, updates)} />
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

// NOTE: The helper components like PricingModelFields, ServiceAdvancedFields, etc.,
// would need to be updated to call `updateServiceInState` which in turn calls `handleUpdateService`.
// For brevity, I've shown the main refactoring. I will now stub out the updated helpers.

// webapp/src/components/ServiceConfigForm.jsx

import React, { useState, useEffect } from 'react';
import { Card, Button, TextInput, Select, Badge, Spinner, Label } from 'flowbite-react';
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
    getAllServicesForCompany,
    createService,
    updateService,
    deleteService
} from '../services/firestore';

const PRICING_MODELS = {
    FIXED_TIER: 'fixed_tier',
    TIERED_MULTIPLIER: 'tiered_multiplier',
    HOURLY_RATE: 'hourly_rate',
    CUSTOM: 'custom'
};

const newServiceTemplate = () => ({
    name: '',
    description: '',
    status: 'draft',
    pricingModel: PRICING_MODELS.FIXED_TIER,
    basePrice: 0,
    addons: [],
    createdAt: new Date(),
    updatedAt: new Date()
});

export default function ServiceConfigForm({ initialConfig }) {
    const companyId = initialConfig?.id;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingServices, setSavingServices] = useState(new Set());
    const [expandedServiceId, setExpandedServiceId] = useState(null);
    
    // Function to toggle service expansion
    const toggleService = (serviceId) => {
        console.log('Toggling service:', serviceId, 'Current expanded:', expandedServiceId);
        setExpandedServiceId(expandedServiceId === serviceId ? null : serviceId);
    };
    
    // Function to check if a service is expanded
    const isServiceExpanded = (serviceId) => {
        return expandedServiceId === serviceId;
    };
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
            case 'inactive':
                return <XCircleIcon className="h-4 w-4 text-red-600" />;
            default:
                return <ClockIcon className="h-4 w-4 text-yellow-600" />;
        }
    };

    const fetchServices = async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const fetchedServices = await getAllServicesForCompany(companyId);
            console.log('Fetched services:', fetchedServices);
            setServices(fetchedServices);
        } catch (error) {
            toast.error(`Failed to load services: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [companyId]);

    const handleAddService = async () => {
        if (!companyId) return;
        const newService = newServiceTemplate();
        try {
            const newServiceId = await createService(companyId, newService);
            await fetchServices();
            setExpandedServiceId(newServiceId);
            toast.success('New service added.');
        } catch (error) {
            toast.error(`Failed to add service: ${error.message}`);
        }
    };

    const handleDeleteService = async (serviceId, e) => {
        // Stop event propagation
        if (e) {
            e.stopPropagation();
        }
        
        if (!companyId || !serviceId) return;
        try {
            await deleteService(companyId, serviceId);
            if (expandedServiceId === serviceId) {
                setExpandedServiceId(null);
            }
            await fetchServices();
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
            await fetchServices();
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
                    <h2 className="text-xl font-bold">Services 2</h2>
                    <Button color="primary" onClick={handleAddService}>
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Service
                    </Button>
                </div>
                
                <div className="space-y-4">
                    {services.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">No services configured yet.</div>
                    ) : (
                        services.map((service, idx) => {
                            const isExpanded = isServiceExpanded(service.id);
                            const isSaving = savingServices.has(service.id);
                            
                            return (
                                <div key={service.id || idx} className="border rounded-lg shadow-sm">
                                    {/* Service Header - Always Visible */}
                                    <div
                                        className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                        onClick={() => toggleService(service.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                                {getStatusIcon(service.status || 'draft')}
                                                <h3 className="font-semibold text-gray-900">
                                                    {service.name || `Service #${idx + 1}`}
                                                </h3>
                                                <Badge color={service.status === 'active' ? 'green' : service.status === 'inactive' ? 'red' : 'yellow'}>
                                                    {(service.status || 'draft').charAt(0).toUpperCase() + (service.status || 'draft').slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isSaving && <Spinner size="sm" />}
                                                <Button 
                                                    size="xs" 
                                                    color="failure" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Delete "${service.name || `Service #${idx + 1}`}"?`)) {
                                                            handleDeleteService(service.id, e);
                                                        }
                                                    }}
                                                > 
                                                    <TrashIcon className="h-4 w-4" /> 
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Content - Only Visible When Expanded */}
                                    {isExpanded && (
                                        <div className="border-t p-4 space-y-4 bg-white">
                                            {/* Basic Info */}
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`name-${service.id}`} value="Service Name" />
                                                        <TextInput 
                                                            id={`name-${service.id}`}
                                                            value={service.name || ''} 
                                                            onChange={e => handleUpdateService(service.id, { name: e.target.value })} 
                                                            placeholder="Enter service name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`status-${service.id}`} value="Status" />
                                                        <Select 
                                                            id={`status-${service.id}`}
                                                            value={service.status || 'draft'} 
                                                            onChange={e => handleUpdateService(service.id, { status: e.target.value })}
                                                        >
                                                            <option value="draft">Draft</option>
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`description-${service.id}`} value="Description" />
                                                    <TextInput 
                                                        id={`description-${service.id}`}
                                                        value={service.description || ''} 
                                                        onChange={e => handleUpdateService(service.id, { description: e.target.value })} 
                                                        placeholder="Brief description"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>
        </div>
    );
}
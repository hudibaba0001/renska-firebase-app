// webapp/src/components/ServiceConfigForm.jsx

import React, { useState, useEffect } from 'react';
import { Card, Button, TextInput, Select, Badge, Spinner, Label, ToggleSwitch } from 'flowbite-react';
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon, CogIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CollapsibleSection from './CollapsibleSection';
import {
    // Import the full suite of service functions.
    getAllServicesForCompany,
    createService,
    updateService,
    deleteService
} from '../services/firestore';

// Pricing model constants remain the same.
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

// Helper functions for service display
const getServiceStatus = (service) => {
    return service.status || 'draft';
};

const getAddonCount = (service) => {
    return service.addons?.length || 0;
};

const getPricingModelDisplay = (pricingModel) => {
    const modelMap = {
        [PRICING_MODELS.FIXED_TIER]: 'Fixed Price',
        [PRICING_MODELS.TIERED_MULTIPLIER]: 'Tiered',
        [PRICING_MODELS.HOURLY_RATE]: 'Hourly',
        [PRICING_MODELS.CUSTOM]: 'Custom'
    };
    return modelMap[pricingModel] || 'Fixed Price';
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'active':
            return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
        case 'inactive':
            return <XCircleIcon className="h-4 w-4 text-red-600" />;
        case 'draft':
        default:
            return <ClockIcon className="h-4 w-4 text-yellow-600" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-red-100 text-red-800';
        case 'draft':
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
};

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
                            <div key={service.id || idx} className="border rounded-lg mb-2 shadow-sm">
                                <div
                                    className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                    onClick={() => {
                                        console.log('Clicked service header', service.id, 'was expanded:', isExpanded);
                                        setExpandedService(isExpanded ? null : service.id);
                                    }}
                                    aria-expanded={isExpanded}
                                    aria-controls={`service-panel-${service.id}`}
                                >
                                    {/* Main header row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(getServiceStatus(service))}
                                                <h3 className="font-semibold text-gray-900">{service.name || `Service #${idx + 1}`}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isSaving && <Spinner size="sm" />}
                                            <Button 
                                                size="xs" 
                                                color="failure" 
                                                onClick={e => { 
                                                    e.stopPropagation(); 
                                                    if (window.confirm(`Are you sure you want to delete "${service.name || `Service #${idx + 1}`}"?`)) {
                                                        handleDeleteService(service.id);
                                                    }
                                                }} 
                                                aria-label={`Delete ${service.name || `Service #${idx + 1}`}`}
                                            > 
                                                <TrashIcon className="h-4 w-4" /> 
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Service details row */}
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            {service.description && (
                                                <span className="truncate max-w-xs">
                                                    {service.description}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Status Badge */}
                                            <Badge className={`text-xs ${getStatusColor(getServiceStatus(service))}`}>
                                                {getServiceStatus(service).charAt(0).toUpperCase() + getServiceStatus(service).slice(1)}
                                            </Badge>
                                            
                                            {/* Pricing Model */}
                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                {getPricingModelDisplay(service.pricingModel)}
                                            </span>
                                            
                                            {/* Addon Count */}
                                            {getAddonCount(service) > 0 && (
                                                <Badge color="blue" className="text-xs">
                                                    {getAddonCount(service)} addon{getAddonCount(service) !== 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                            
                                            {/* Base Price */}
                                            {service.basePrice && (
                                                <span className="text-xs font-medium text-green-600">
                                                    ${service.basePrice}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="border-t p-4 space-y-4 bg-white" id={`service-panel-${service.id}`}> 
                                        {console.log('Rendering expanded panel for', service.id)}
                                        
                                        {/* Basic Information Section - Always Expanded */}
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CogIcon className="h-5 w-5 text-gray-600" />
                                                <h4 className="font-medium text-gray-900">Basic Information</h4>
                                            </div>
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
                                                        value={getServiceStatus(service)} 
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
                                                    placeholder="Brief description of the service"
                                                />
                                            </div>
                                        </div>

                                        {/* Pricing Configuration Section */}
                                        <CollapsibleSection
                                            title="Pricing Configuration"
                                            icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                            defaultExpanded={false}
                                            className="mt-4"
                                        >
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`pricing-model-${service.id}`} value="Pricing Model" />
                                                        <Select 
                                                            id={`pricing-model-${service.id}`}
                                                            value={service.pricingModel || PRICING_MODELS.FIXED_TIER} 
                                                            onChange={e => handleUpdateService(service.id, { pricingModel: e.target.value })}
                                                        >
                                                            <option value={PRICING_MODELS.FIXED_TIER}>Fixed Price</option>
                                                            <option value={PRICING_MODELS.TIERED_MULTIPLIER}>Tiered Pricing</option>
                                                            <option value={PRICING_MODELS.HOURLY_RATE}>Hourly Rate</option>
                                                            <option value={PRICING_MODELS.CUSTOM}>Custom</option>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`base-price-${service.id}`} value="Base Price ($)" />
                                                        <TextInput 
                                                            id={`base-price-${service.id}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={service.basePrice || ''} 
                                                            onChange={e => handleUpdateService(service.id, { basePrice: parseFloat(e.target.value) || 0 })} 
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleSection>

                                        {/* Addons Configuration Section */}
                                        <CollapsibleSection
                                            title="Addons Configuration"
                                            badge={getAddonCount(service)}
                                            icon={<PlusIcon className="h-4 w-4" />}
                                            defaultExpanded={false}
                                            className="mt-4"
                                        >
                                            <div className="space-y-4">
                                                {service.addons && service.addons.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {service.addons.map((addon, addonIdx) => (
                                                            <div key={addonIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-medium">{addon.name || `Addon ${addonIdx + 1}`}</span>
                                                                    <Badge color={addon.type === 'required' ? 'red' : 'blue'} size="sm">
                                                                        {addon.type || 'optional'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-green-600">
                                                                        ${addon.price || 0}
                                                                    </span>
                                                                    <Button size="xs" color="gray">Edit</Button>
                                                                    <Button size="xs" color="failure">
                                                                        <TrashIcon className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 text-gray-500">
                                                        <PlusIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                        <p>No addons configured yet</p>
                                                    </div>
                                                )}
                                                <Button color="blue" size="sm" className="w-full">
                                                    <PlusIcon className="h-4 w-4 mr-1" />
                                                    Add New Addon
                                                </Button>
                                            </div>
                                        </CollapsibleSection>

                                        {/* Advanced Settings Section */}
                                        <CollapsibleSection
                                            title="Advanced Settings"
                                            icon={<CogIcon className="h-4 w-4" />}
                                            defaultExpanded={false}
                                            className="mt-4"
                                        >
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label value="Booking Duration (minutes)" />
                                                        <TextInput 
                                                            type="number"
                                                            min="15"
                                                            step="15"
                                                            value={service.duration || ''} 
                                                            onChange={e => handleUpdateService(service.id, { duration: parseInt(e.target.value) || 60 })} 
                                                            placeholder="60"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Maximum Bookings per Day" />
                                                        <TextInput 
                                                            type="number"
                                                            min="1"
                                                            value={service.maxBookingsPerDay || ''} 
                                                            onChange={e => handleUpdateService(service.id, { maxBookingsPerDay: parseInt(e.target.value) || null })} 
                                                            placeholder="Unlimited"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ToggleSwitch
                                                        checked={service.requiresApproval || false}
                                                        onChange={checked => handleUpdateService(service.id, { requiresApproval: checked })}
                                                    />
                                                    <Label value="Requires manual approval" />
                                                </div>
                                            </div>
                                        </CollapsibleSection>
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

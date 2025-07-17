import React, { useState, useEffect } from 'react';
import { Card, Button, TextInput, Select, Badge, Spinner, Label } from 'flowbite-react';
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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

export default function ServiceConfigFormSimple({ initialConfig }) {
    const companyId = initialConfig?.id;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingServices, setSavingServices] = useState(new Set());
    const [expandedService, setExpandedService] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    
    const toggleSection = (serviceId, sectionName) => {
        const key = `${serviceId}-${sectionName}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const isSectionExpanded = (serviceId, sectionName) => {
        const key = `${serviceId}-${sectionName}`;
        return expandedSections[key] || false;
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
            setExpandedService(newServiceId);
            toast.success('New service added.');
        } catch (error) {
            toast.error(`Failed to add service: ${error.message}`);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!companyId || !serviceId) return;
        try {
            await deleteService(companyId, serviceId);
            await fetchServices();
            if (expandedService === serviceId) setExpandedService(null);
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
                        const isExpanded = expandedService === service.id;
                        const isSaving = savingServices.has(service.id);
                        
                        return (
                            <div key={service.id || idx} className="border rounded-lg shadow-sm">
                                {/* Service Header - Always Visible */}
                                <div
                                    className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onClick={() => setExpandedService(isExpanded ? null : service.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? 
                                                <ChevronDownIcon className="h-4 w-4 text-gray-600" /> : 
                                                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                                            }
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
                                                onClick={e => { 
                                                    e.stopPropagation(); 
                                                    if (window.confirm(`Delete "${service.name || `Service #${idx + 1}`}"?`)) {
                                                        handleDeleteService(service.id);
                                                    }
                                                }}
                                            > 
                                                <TrashIcon className="h-4 w-4" /> 
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Details - Only When Expanded */}
                                {isExpanded && (
                                    <div className="border-t p-4 space-y-6 bg-white">
                                        {/* Basic Info - Always Visible When Service is Expanded */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label value="Service Name" />
                                                <TextInput 
                                                    value={service.name || ''} 
                                                    onChange={e => handleUpdateService(service.id, { name: e.target.value })} 
                                                    placeholder="Enter service name"
                                                />
                                            </div>
                                            <div>
                                                <Label value="Status" />
                                                <Select 
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
                                            <Label value="Description" />
                                            <TextInput 
                                                value={service.description || ''} 
                                                onChange={e => handleUpdateService(service.id, { description: e.target.value })} 
                                                placeholder="Brief description"
                                            />
                                        </div>

                                        {/* Pricing Section - Collapsible */}
                                        <div className="border rounded-lg">
                                            <div
                                                className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                                onClick={() => toggleSection(service.id, 'pricing')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isSectionExpanded(service.id, 'pricing') ? 
                                                        <ChevronDownIcon className="h-4 w-4" /> : 
                                                        <ChevronRightIcon className="h-4 w-4" />
                                                    }
                                                    <span className="font-medium">Pricing Configuration</span>
                                                </div>
                                            </div>
                                            {isSectionExpanded(service.id, 'pricing') && (
                                                <div className="border-t p-3 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label value="Pricing Model" />
                                                            <Select 
                                                                value={service.pricingModel || PRICING_MODELS.FIXED_TIER} 
                                                                onChange={e => handleUpdateService(service.id, { pricingModel: e.target.value })}
                                                            >
                                                                <option value={PRICING_MODELS.FIXED_TIER}>Fixed Price</option>
                                                                <option value={PRICING_MODELS.TIERED_MULTIPLIER}>Tiered</option>
                                                                <option value={PRICING_MODELS.HOURLY_RATE}>Hourly</option>
                                                                <option value={PRICING_MODELS.CUSTOM}>Custom</option>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label value="Base Price ($)" />
                                                            <TextInput 
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
                                            )}
                                        </div>

                                        {/* Addons Section - Collapsible */}
                                        <div className="border rounded-lg">
                                            <div
                                                className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                                onClick={() => toggleSection(service.id, 'addons')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isSectionExpanded(service.id, 'addons') ? 
                                                        <ChevronDownIcon className="h-4 w-4" /> : 
                                                        <ChevronRightIcon className="h-4 w-4" />
                                                    }
                                                    <span className="font-medium">Addons Configuration</span>
                                                    {service.addons && service.addons.length > 0 && (
                                                        <Badge color="blue" size="sm">
                                                            {service.addons.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {isSectionExpanded(service.id, 'addons') && (
                                                <div className="border-t p-3">
                                                    {service.addons && service.addons.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {service.addons.map((addon, addonIdx) => (
                                                                <div key={addonIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                    <span>{addon.name || `Addon ${addonIdx + 1}`}</span>
                                                                    <span className="text-green-600 font-medium">${addon.price || 0}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4 text-gray-500">
                                                            <p>No addons configured</p>
                                                        </div>
                                                    )}
                                                    <Button color="blue" size="sm" className="w-full mt-3">
                                                        <PlusIcon className="h-4 w-4 mr-1" />
                                                        Add Addon
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
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
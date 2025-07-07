import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { 
  Card, 
  Button, 
  TextInput, 
  Select, 
  Label, 
  Checkbox, 
  Badge, 
  Alert, 
  Spinner,
  Progress
} from 'flowbite-react';
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  SparklesIcon,
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function BookingCalculator() {
  const { companyId } = useParams();
  
  // State management
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    area: 50,
    rooms: '',
    frequency: 'weekly',
    addOns: [],
    windowSize: 'small',
    zipCode: '',
    useRut: false,
    promoCode: '',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  });
  
  const [config, setConfig] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default configuration values
  const defaultConfig = {
    services: [
      { id: 'basic-cleaning', name: 'Basic Cleaning', pricingModel: 'flat-rate', pricePerSqm: 10 },
      { id: 'deep-cleaning', name: 'Deep Cleaning', pricingModel: 'flat-rate', pricePerSqm: 15 },
      { id: 'move-cleaning', name: 'Move-in/Move-out Cleaning', pricingModel: 'flat-rate', pricePerSqm: 20 }
    ],
    frequencyMultiplier: { weekly: 1.0, biweekly: 1.15, monthly: 1.4, quarterly: 1.8 },
    addOns: { oven: 500, fridge: 500, balcony: 300, windows: 200 },
    windowCleaningPrices: { small: 90, medium: 120, large: 150 },
    zipAreas: ["41107", "41121", "41254", "41318", "41503"],
    rutPercentage: 0.3
  };

  // Load company configuration
  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError('');
      
      try {
        if (companyId) {
          const ref = doc(db, 'companies', companyId);
          const snap = await getDoc(ref);
          
          if (snap.exists()) {
            const companyData = snap.data();
            setConfig({ ...defaultConfig, ...companyData });
          } else {
            setError('Company configuration not found.');
            setConfig(defaultConfig);
          }
        } else {
          setConfig(defaultConfig);
        }
      } catch (e) {
        console.error('Error loading company config:', e);
        setError('Failed to load company configuration.');
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    }
    
    fetchConfig();
  }, [companyId]);

  // Initialize selected service when config loads
  useEffect(() => {
    if (config && config.services?.length > 0 && !selectedService) {
      setSelectedService(config.services[0].id);
    }
  }, [config, selectedService]);

  // Real-time price calculation
  const calculatePrice = useCallback(() => {
    if (!config || !selectedService || !formData.area) {
      setTotalPrice(0);
      setPriceBreakdown(null);
      return;
    }

    setCalculating(true);
    
    try {
      // Find selected service
      const service = config.services.find(s => s.id === selectedService);
      if (!service) return;

      let basePrice = 0;
      
      // Calculate base price
      switch (service.pricingModel) {
        case 'per-sqm-tiered': {
          const tier = service.tiers?.find(t => formData.area >= t.min && formData.area <= t.max);
          if (tier) {
            basePrice = formData.area * tier.pricePerSqm;
          }
          break;
        }
        case 'flat-rate':
          basePrice = formData.area * (service.pricePerSqm || 10);
          break;
        case 'per-room':
          basePrice = (formData.rooms || 1) * (service.pricePerRoom || 300);
          break;
        default:
          basePrice = formData.area * 10;
      }

      // Apply frequency multiplier
      const freqMultiplier = config.frequencyMultiplier[formData.frequency] || 1;
      basePrice = basePrice * freqMultiplier;

      // Add selected add-ons
      const addOnsCost = formData.addOns.reduce((total, addOnKey) => {
        return total + (config.addOns[addOnKey] || 0);
      }, 0);

      // Add window cleaning
      const windowCost = config.windowCleaningPrices[formData.windowSize] || 0;

      let total = basePrice + addOnsCost + windowCost;

      // Apply RUT discount if eligible
      if (formData.useRut && formData.zipCode && config.zipAreas.includes(formData.zipCode)) {
        total = total * (1 - config.rutPercentage);
      }

      const breakdown = {
        service: service.name,
        basePrice: Math.round(basePrice),
        addOns: addOnsCost,
        windowCleaning: windowCost,
        rutDiscount: formData.useRut && formData.zipCode && config.zipAreas.includes(formData.zipCode) ? 
          Math.round((basePrice + addOnsCost + windowCost) * config.rutPercentage) : 0,
        frequency: formData.frequency,
        frequencyMultiplier: freqMultiplier
      };

      setTotalPrice(Math.round(total));
      setPriceBreakdown(breakdown);
      
    } catch (error) {
      console.error('❌ Price calculation error:', error);
      toast.error('Failed to calculate price');
    } finally {
      setCalculating(false);
    }
  }, [config, selectedService, formData]);

  // Trigger price calculation when relevant data changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      calculatePrice();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [calculatePrice]);

  // Handle form field changes
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateNestedFormData = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  // Handle service selection
  const handleServiceSelect = useCallback((serviceId) => {
    setSelectedService(serviceId);
    // Reset service-specific fields
    setFormData(prev => ({
      ...prev,
      addOns: []
    }));
  }, []);

  // Handle add-on selection
  const handleAddOnChange = useCallback((addOnId, checked) => {
    setFormData(prev => ({
      ...prev,
      addOns: checked 
        ? [...prev.addOns, addOnId]
        : prev.addOns.filter(id => id !== addOnId)
    }));
  }, []);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.customerInfo.name || !formData.customerInfo.email || !formData.customerInfo.phone) {
      toast.error('Please fill in all required customer information');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        service: selectedService,
        area: formData.area,
        rooms: formData.rooms,
        frequency: formData.frequency,
        addOns: formData.addOns,
        windowSize: formData.windowSize,
        zipCode: formData.zipCode,
        useRut: formData.useRut,
        totalPrice,
        priceBreakdown,
        customerInfo: formData.customerInfo,
        companyId,
        submittedAt: new Date().toISOString(),
        created: Timestamp.now()
      };

      console.log('📋 Submitting booking:', bookingData);
      
      // Submit to Firestore
      await addDoc(collection(db, 'bookings'), bookingData);
      
      toast.success('Booking submitted successfully!');
      
      // Reset form
      setStep(1);
      setFormData({
        area: 50,
        rooms: '',
        frequency: 'weekly',
        addOns: [],
        windowSize: 'small',
        zipCode: '',
        useRut: false,
        promoCode: '',
        customerInfo: {
          name: '',
          email: '',
          phone: '',
          address: ''
        }
      });
      
    } catch (error) {
      console.error('❌ Booking submission error:', error);
      toast.error('Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <Alert color="failure">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span className="ml-2">{error}</span>
        </Alert>
      </div>
    );
  }

  // Render main calculator
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Calculator
            </h1>
            <p className="text-gray-600">
              Get instant pricing for your cleaning service
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {calculating && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Spinner size="sm" />
                <span className="text-sm">Calculating...</span>
              </div>
            )}
            
            <Badge color="primary" size="sm">
              Step {step} of 4
            </Badge>
          </div>
        </div>
        
        <Progress progress={(step / 4) * 100} color="primary" className="mt-4" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <ServiceSelectionStep
                config={config}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
                formData={formData}
                updateFormData={updateFormData}
                onNext={() => setStep(2)}
              />
            )}

            {/* Step 2: Service Details */}
            {step === 2 && (
              <ServiceDetailsStep
                config={config}
                formData={formData}
                updateFormData={updateFormData}
                handleAddOnChange={handleAddOnChange}
                onNext={() => setStep(3)}
                onPrev={() => setStep(1)}
              />
            )}

            {/* Step 3: Location & Preferences */}
            {step === 3 && (
              <LocationPreferencesStep
                formData={formData}
                updateFormData={updateFormData}
                config={config}
                onNext={() => setStep(4)}
                onPrev={() => setStep(2)}
              />
            )}

            {/* Step 4: Customer Information */}
            {step === 4 && (
              <CustomerInfoStep
                formData={formData}
                updateNestedFormData={updateNestedFormData}
                onPrev={() => setStep(3)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </form>
        </div>

        {/* Price Summary Sidebar */}
        <div className="space-y-6">
          <PricingSummaryCard
            totalPrice={totalPrice}
            priceBreakdown={priceBreakdown}
            selectedService={selectedService}
            config={config}
            formData={formData}
            calculating={calculating}
            formatPrice={formatPrice}
          />
          
          {/* Pricing Breakdown Details */}
          {priceBreakdown && (
            <PricingBreakdownCard
              breakdown={priceBreakdown}
              formatPrice={formatPrice}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
const ServiceSelectionStep = ({ config, selectedService, onServiceSelect, formData, updateFormData, onNext }) => (
  <Card>
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-blue-100 rounded-xl">
        <SparklesIcon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Select Service</h3>
        <p className="text-sm text-gray-500">Choose your cleaning service and area size</p>
      </div>
    </div>

    <div className="space-y-6">
      {/* Service Selection */}
      <div>
        <Label htmlFor="service" value="Service Type" />
        <Select
          id="service"
          value={selectedService}
          onChange={(e) => onServiceSelect(e.target.value)}
        >
          <option value="">Select a service...</option>
          {config?.services?.map(service => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Area Input */}
      <div>
        <Label htmlFor="area" value="Area (square meters)" />
        <TextInput
          id="area"
          type="number"
          min="1"
          max="1000"
          value={formData.area}
          onChange={(e) => updateFormData('area', Number(e.target.value))}
          placeholder="Enter area in m²"
          icon={HomeIcon}
        />
      </div>

      {/* Rooms Input (Optional) */}
      <div>
        <Label htmlFor="rooms" value="Number of Rooms (optional)" />
        <TextInput
          id="rooms"
          type="number"
          min="1"
          max="50"
          value={formData.rooms}
          onChange={(e) => updateFormData('rooms', Number(e.target.value))}
          placeholder="Number of rooms"
          icon={HomeIcon}
        />
      </div>

      {/* Frequency Selection */}
      <div>
        <Label htmlFor="frequency" value="Cleaning Frequency" />
        <Select
          id="frequency"
          value={formData.frequency}
          onChange={(e) => updateFormData('frequency', e.target.value)}
          icon={CalendarDaysIcon}
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly (+15%)</option>
          <option value="monthly">Monthly (+40%)</option>
          <option value="quarterly">Quarterly (+80%)</option>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button
          color="primary"
          onClick={onNext}
          disabled={!selectedService || !formData.area}
        >
          Next Step
        </Button>
      </div>
    </div>
  </Card>
);

const ServiceDetailsStep = ({ config, formData, updateFormData, handleAddOnChange, onNext, onPrev }) => (
  <Card>
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-green-100 rounded-xl">
        <CogIcon className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Service Details & Add-ons</h3>
        <p className="text-sm text-gray-500">Customize your cleaning service</p>
      </div>
    </div>

    <div className="space-y-6">
      {/* Add-ons */}
      <div>
        <Label value="Additional Services" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {Object.entries(config?.addOns || {}).map(([key, price]) => (
            <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id={`addon-${key}`}
                checked={formData.addOns.includes(key)}
                onChange={(e) => handleAddOnChange(key, e.target.checked)}
              />
              <Label htmlFor={`addon-${key}`} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge color="primary" size="sm">+{price} SEK</Badge>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Window Cleaning */}
      <div>
        <Label htmlFor="windows" value="Window Cleaning" />
        <Select
          id="windows"
          value={formData.windowSize}
          onChange={(e) => updateFormData('windowSize', e.target.value)}
          icon={SparklesIcon}
        >
          {Object.entries(config?.windowCleaningPrices || {}).map(([size, price]) => (
            <option key={size} value={size}>
              {size.charAt(0).toUpperCase() + size.slice(1)} (+{price} SEK)
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-between">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button color="primary" onClick={onNext}>Next Step</Button>
      </div>
    </div>
  </Card>
);

const LocationPreferencesStep = ({ formData, updateFormData, config, onNext, onPrev }) => (
  <Card>
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-purple-100 rounded-xl">
        <MapPinIcon className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Location & Preferences</h3>
        <p className="text-sm text-gray-500">Specify your location and preferences</p>
      </div>
    </div>

    <div className="space-y-6">
      {/* ZIP Code */}
      <div>
        <Label htmlFor="zip" value="ZIP Code" />
        <TextInput
          id="zip"
          type="text"
          value={formData.zipCode}
          onChange={(e) => updateFormData('zipCode', e.target.value)}
          placeholder="Enter ZIP code"
          icon={MapPinIcon}
        />
      </div>

      {/* RUT Discount */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rut"
            checked={formData.useRut}
            onChange={(e) => updateFormData('useRut', e.target.checked)}
          />
          <Label htmlFor="rut" className="cursor-pointer">
            <div className="flex items-center space-x-2">
              <StarIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Apply RUT discount (30% off for eligible areas)
              </span>
            </div>
          </Label>
        </div>
        {formData.useRut && formData.zipCode && config?.zipAreas?.includes(formData.zipCode) && (
          <div className="mt-2 flex items-center space-x-2 text-green-700">
            <CheckCircleIcon className="h-4 w-4" />
            <span className="text-sm">RUT discount available for ZIP code {formData.zipCode}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button color="primary" onClick={onNext}>Next Step</Button>
      </div>
    </div>
  </Card>
);

const CustomerInfoStep = ({ formData, updateNestedFormData, onPrev, onSubmit, isSubmitting }) => (
  <Card>
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-blue-100 rounded-xl">
        <UserIcon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Customer Information</h3>
        <p className="text-sm text-gray-500">We'll need these details to confirm your booking</p>
      </div>
    </div>

    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" value="Full Name *" />
          <TextInput
            id="name"
            type="text"
            required
            value={formData.customerInfo.name}
            onChange={(e) => updateNestedFormData('customerInfo.name', e.target.value)}
            placeholder="Enter your full name"
            icon={UserIcon}
          />
        </div>
        
        <div>
          <Label htmlFor="email" value="Email Address *" />
          <TextInput
            id="email"
            type="email"
            required
            value={formData.customerInfo.email}
            onChange={(e) => updateNestedFormData('customerInfo.email', e.target.value)}
            placeholder="Enter your email"
            icon={EnvelopeIcon}
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="phone" value="Phone Number *" />
          <TextInput
            id="phone"
            type="tel"
            required
            value={formData.customerInfo.phone}
            onChange={(e) => updateNestedFormData('customerInfo.phone', e.target.value)}
            placeholder="Enter your phone number"
            icon={PhoneIcon}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address" value="Address (optional)" />
          <TextInput
            id="address"
            type="text"
            value={formData.customerInfo.address}
            onChange={(e) => updateNestedFormData('customerInfo.address', e.target.value)}
            placeholder="Enter your address"
            icon={HomeIcon}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button
          type="submit"
          color="primary"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            'Complete Booking'
          )}
        </Button>
      </div>
    </div>
  </Card>
);

// Pricing Summary Card
const PricingSummaryCard = ({ totalPrice, priceBreakdown, selectedService, config, formData, calculating, formatPrice }) => {
  const service = config?.services?.find(s => s.id === selectedService);
  
  return (
    <Card className="sticky top-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Price Summary</h3>
        </div>

        {calculating ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : totalPrice > 0 ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatPrice(totalPrice)}
              </div>
              <p className="text-sm text-gray-600">
                {service?.name} • {formData.area} m² • {formData.frequency}
              </p>
            </div>

            {priceBreakdown?.rutDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>RUT Discount:</span>
                <span>-{formatPrice(priceBreakdown.rutDiscount)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CogIcon className="h-12 w-12 mx-auto mb-2" />
            <p>Select service and area to see pricing</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Pricing Breakdown Card
const PricingBreakdownCard = ({ breakdown, formatPrice }) => (
  <Card>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <ChartBarIcon className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">Pricing Breakdown</h4>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Base Price ({breakdown.service}):</span>
          <span>{formatPrice(breakdown.basePrice)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Frequency ({breakdown.frequency}):</span>
          <span>{breakdown.frequencyMultiplier}x</span>
        </div>
        
        {breakdown.addOns > 0 && (
          <div className="flex justify-between">
            <span>Add-ons:</span>
            <span>+{formatPrice(breakdown.addOns)}</span>
          </div>
        )}
        
        {breakdown.windowCleaning > 0 && (
          <div className="flex justify-between">
            <span>Window Cleaning:</span>
            <span>+{formatPrice(breakdown.windowCleaning)}</span>
          </div>
        )}
        
        {breakdown.rutDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>RUT Discount:</span>
            <span>-{formatPrice(breakdown.rutDiscount)}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
); 
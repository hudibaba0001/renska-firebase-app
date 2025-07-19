import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc } from 'firebase/firestore';
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
  Progress,
  Tooltip
} from 'flowbite-react';
import {
  HomeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlusIcon,
  SparklesIcon,
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CogIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Import our enhanced engines
import { PricingEngine, PRICING_MODELS, PricingUtils } from '../utils/pricingEngine';
import { ValidationEngine, FIELD_TYPES, ValidationUtils } from '../utils/validationEngine';
import { PricingRulesEngine, RULE_TYPES, RuleUtils } from '../utils/pricingRulesEngine';

export default function EnhancedBookingCalculator() {
  const { companyId } = useParams();
  
  // State management
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    area: '',
    rooms: '',
    frequency: 'monthly',
    addOns: [],
    windowCleaning: {},
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
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [pricingResult, setPricingResult] = useState(null);
  const [pricingBreakdown, setPricingBreakdown] = useState(null);

  // Initialize engines
  const [pricingEngine, setPricingEngine] = useState(null);
  const [validationEngine, setValidationEngine] = useState(null);
  const [rulesEngine, setRulesEngine] = useState(null);

  // Load company configuration
  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError('');
      
      try {
        const ref = doc(db, 'companies', companyId);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
          const companyData = snap.data();
          setConfig(companyData);
          
          // Initialize engines with company configuration
          initializeEngines(companyData);
        } else {
          setError('Company configuration not found.');
        }
      } catch (e) {
        console.error('Error loading company config:', e);
        setError('Failed to load company configuration.');
      } finally {
        setLoading(false);
      }
    }
    
    if (companyId) {
      fetchConfig();
    }
  }, [companyId]);

  // Initialize pricing engines
  const initializeEngines = useCallback((companyConfig) => {
    try {
      // Initialize pricing engine
      const pricingEngineInstance = new PricingEngine({
        frequencyMultipliers: companyConfig.frequencyMultipliers || {
          weekly: 1.0,
          biweekly: 1.15,
          monthly: 1.4,
          quarterly: 1.8,
          yearly: 2.5
        },
        addOnPrices: companyConfig.addOnPrices || {},
        rutPercentage: companyConfig.rutPercentage || 0.3,
        rutEligibleZips: companyConfig.zipAreas || [],
        debug: process.env.NODE_ENV === 'development'
      });
      
      // Initialize validation engine
      const validationEngineInstance = new ValidationEngine({
        debug: process.env.NODE_ENV === 'development'
      });
      
      // Initialize rules engine
      const rulesEngineInstance = new PricingRulesEngine({
        continueOnError: true,
        debug: process.env.NODE_ENV === 'development'
      });
      
      // Load company-specific pricing rules
      if (companyConfig.pricingRules) {
        companyConfig.pricingRules.forEach(rule => {
          rulesEngineInstance.addRule(rule);
        });
      }
      
      setPricingEngine(pricingEngineInstance);
      setValidationEngine(validationEngineInstance);
      setRulesEngine(rulesEngineInstance);
      
      console.log('✅ Engines initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing engines:', error);
      setError('Failed to initialize pricing engines.');
    }
  }, []);

  // Real-time price calculation
  const calculatePrice = useCallback(async () => {
    if (!pricingEngine || !selectedService || !formData.area) {
      setPricingResult(null);
      return;
    }

    setCalculating(true);
    
    try {
      // Prepare input data for pricing calculation
      const inputData = {
        service: selectedService,
        area: Number(formData.area),
        rooms: Number(formData.rooms) || null,
        frequency: formData.frequency,
        addOns: formData.addOns,
        windowCleaning: Object.keys(formData.windowCleaning).length > 0 ? formData.windowCleaning : null,
        zipCode: formData.zipCode,
        useRut: formData.useRut,
        promoCode: formData.promoCode,
        date: new Date().toISOString()
      };

      // Calculate price using the enhanced pricing engine
      const result = await pricingEngine.calculatePrice(inputData);
      
      // Apply additional rules if rules engine is available
      if (rulesEngine) {
        const rulesContext = {
          currentPrice: result.totalPrice,
          inputData,
          breakdown: result.breakdown
        };
        
        const rulesResult = await rulesEngine.applyRules(rulesContext);
        
        // Update result with rules engine output
        result.totalPrice = rulesResult.finalPrice;
        result.appliedRules = rulesResult.appliedRules;
        result.rulesAdjustment = rulesResult.totalAdjustment;
      }
      
      setPricingResult(result);
      setPricingBreakdown(result.breakdown);
      
      console.log('💰 Price calculated:', result);
    } catch (error) {
      console.error('❌ Price calculation error:', error);
      toast.error('Failed to calculate price');
    } finally {
      setCalculating(false);
    }
  }, [pricingEngine, rulesEngine, selectedService, formData]);

  // Trigger price calculation when relevant data changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      calculatePrice();
    }, 300); // Debounce to avoid excessive calculations

    return () => clearTimeout(debounceTimer);
  }, [calculatePrice]);

  // Validate form data
  const validateFormData = useCallback(async () => {
    if (!validationEngine) return { isValid: true };

    try {
      const validation = validationEngine.validatePricingInput({
        service: selectedService,
        area: Number(formData.area),
        rooms: Number(formData.rooms) || undefined,
        frequency: formData.frequency,
        zipCode: formData.zipCode,
        addOns: formData.addOns,
        useRut: formData.useRut
      });

      setValidationErrors(validation.fieldErrors || {});
      return validation;
    } catch (error) {
      console.error('Validation error:', error);
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  }, [validationEngine, selectedService, formData]);

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
    const service = config?.services?.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      // Reset service-specific fields
      setFormData(prev => ({
        ...prev,
        addOns: [],
        windowCleaning: {}
      }));
    }
  }, [config]);

  // Handle add-on selection
  const handleAddOnChange = useCallback((addOnId, checked) => {
    setFormData(prev => ({
      ...prev,
      addOns: checked 
        ? [...prev.addOns, addOnId]
        : prev.addOns.filter(id => id !== addOnId)
    }));
  }, []);

  // Handle window cleaning selection
  const handleWindowCleaningChange = useCallback((windowType, quantity) => {
    setFormData(prev => ({
      ...prev,
      windowCleaning: {
        ...prev.windowCleaning,
        [windowType]: quantity
      }
    }));
  }, []);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all form data
    const validation = await validateFormData();
    if (!validation.isValid) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    // Validate customer info
    if (validationEngine) {
      const customerValidation = validationEngine.validateCustomerInfo(formData.customerInfo);
      if (!customerValidation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          ...customerValidation.fieldErrors
        }));
        toast.error('Please provide valid customer information');
        return;
      }
    }

    try {
      // Submit booking (implementation depends on your backend)
      const bookingData = {
        ...formData,
        service: selectedService,
        pricing: pricingResult,
        companyId,
        submittedAt: new Date().toISOString()
      };

      console.log('📋 Submitting booking:', bookingData);
      toast.success('Booking submitted successfully!');
      
      // Reset form or redirect as needed
    } catch (error) {
      console.error('❌ Booking submission error:', error);
      toast.error('Failed to submit booking');
    }
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
              Enhanced Booking Calculator
            </h1>
            <p className="text-gray-600">
              Advanced pricing with rules engine and real-time validation
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
                validationErrors={validationErrors}
                onNext={() => setStep(2)}
              />
            )}

            {/* Step 2: Service Details */}
            {step === 2 && (
              <ServiceDetailsStep
                selectedService={selectedService}
                config={config}
                formData={formData}
                updateFormData={updateFormData}
                handleAddOnChange={handleAddOnChange}
                handleWindowCleaningChange={handleWindowCleaningChange}
                validationErrors={validationErrors}
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
                validationErrors={validationErrors}
                onNext={() => setStep(4)}
                onPrev={() => setStep(2)}
              />
            )}

            {/* Step 4: Customer Information */}
            {step === 4 && (
              <CustomerInfoStep
                formData={formData}
                updateNestedFormData={updateNestedFormData}
                validationErrors={validationErrors}
                onPrev={() => setStep(3)}
                onSubmit={handleSubmit}
              />
            )}
          </form>
        </div>

        {/* Price Summary Sidebar */}
        <div className="space-y-6">
          <PricingSummaryCard
            pricingResult={pricingResult}
            pricingBreakdown={pricingBreakdown}
            selectedService={selectedService}
            formData={formData}
            calculating={calculating}
          />
          
          {/* Pricing Breakdown Details */}
          {pricingResult && (
            <PricingBreakdownCard
              breakdown={pricingBreakdown}
              appliedRules={pricingResult.appliedRules}
              discounts={pricingResult.discounts}
              addOns={pricingResult.addOns}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
const ServiceSelectionStep = ({ config, selectedService, onServiceSelect, formData, updateFormData, validationErrors, onNext }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
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
            value={selectedService?.id || ''}
            onChange={(e) => onServiceSelect(e.target.value)}
            color={validationErrors.service ? 'failure' : 'gray'}
          >
            <option value="">Select a service...</option>
            {config?.services?.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.description}
              </option>
            ))}
          </Select>
          {validationErrors.service && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.service}</p>
          )}
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
            onChange={(e) => updateFormData('area', e.target.value)}
            placeholder="Enter area in m²"
            icon={HomeIcon}
            color={validationErrors.area ? 'failure' : 'gray'}
          />
          {validationErrors.area && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.area}</p>
          )}
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
            onChange={(e) => updateFormData('rooms', e.target.value)}
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
            <option value="yearly">Yearly (+150%)</option>
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
  </motion.div>
);

// Additional step components would be defined here...
// For brevity, I'll create placeholder components

const ServiceDetailsStep = ({ onNext, onPrev }) => (
  <Card>
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Service Details & Add-ons</h3>
      <p>Add-ons and service customization would go here...</p>
      <div className="flex justify-between">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button color="primary" onClick={onNext}>Next Step</Button>
      </div>
    </div>
  </Card>
);

const LocationPreferencesStep = ({ onNext, onPrev }) => (
  <Card>
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Location & Preferences</h3>
      <p>ZIP code, RUT discount, and preferences would go here...</p>
      <div className="flex justify-between">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button color="primary" onClick={onNext}>Next Step</Button>
      </div>
    </div>
  </Card>
);

const CustomerInfoStep = ({ onPrev, onSubmit }) => (
  <Card>
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Customer Information</h3>
      <p>Customer details form would go here...</p>
      <div className="flex justify-between">
        <Button color="gray" onClick={onPrev}>Previous</Button>
        <Button type="submit" color="primary" onClick={onSubmit}>
          Complete Booking
        </Button>
      </div>
    </div>
  </Card>
);

// Pricing Summary Card
const PricingSummaryCard = ({ pricingResult, selectedService, formData, calculating }) => (
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
      ) : pricingResult ? (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {PricingUtils.formatPrice(pricingResult.totalPrice)}
            </div>
            <p className="text-sm text-gray-600">
              {selectedService?.name} • {formData.area} m² • {formData.frequency}
            </p>
          </div>

          {pricingResult.discounts?.length > 0 && (
            <div className="space-y-1">
              {pricingResult.discounts.map((discount, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-green-600">{discount.type} Discount:</span>
                  <span className="text-green-600">
                    -{PricingUtils.formatPrice(discount.amount)}
                  </span>
                </div>
              ))}
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

// Pricing Breakdown Card
const PricingBreakdownCard = ({ breakdown, appliedRules }) => (
  <Card>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <ChartBarIcon className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">Pricing Breakdown</h4>
      </div>

      {breakdown && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Price:</span>
            <span>{PricingUtils.formatPrice(breakdown.base)}</span>
          </div>
          
          {breakdown.frequency && (
            <div className="flex justify-between">
              <span>Frequency Adjustment:</span>
              <span>{PricingUtils.formatPrice(breakdown.frequency.adjustment)}</span>
            </div>
          )}
          
          {breakdown.addOns?.length > 0 && (
            <div className="space-y-1">
              {breakdown.addOns.map((addOn, index) => (
                <div key={index} className="flex justify-between">
                  <span>{addOn.name}:</span>
                  <span>+{PricingUtils.formatPrice(addOn.price)}</span>
                </div>
              ))}
            </div>
          )}
          
          {breakdown.minimumFeeApplied && (
            <div className="flex justify-between text-amber-600 font-medium">
              <span>Minimum Fee Applied:</span>
              <span>{PricingUtils.formatPrice(breakdown.originalCalculatedPrice)} → {PricingUtils.formatPrice(breakdown.base)}</span>
            </div>
          )}
          
          {breakdown.hourlyDetails && (
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Hourly Calculation:</span>
                <span>{breakdown.hourlyDetails.hours} hours × {PricingUtils.formatPrice(breakdown.hourlyDetails.rate)}/hr</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Area: {breakdown.area} m² (Tier: {breakdown.hourlyDetails.minArea}-{breakdown.hourlyDetails.maxArea} m²)
              </div>
            </div>
          )}
          
          {appliedRules?.length > 0 && (
            <div className="pt-2 border-t">
              <p className="font-medium mb-1">Applied Rules:</p>
              {appliedRules.map((rule, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>{rule.ruleName}:</span>
                  <span>
                    {rule.newPrice > rule.originalPrice ? '+' : ''}
                    {PricingUtils.formatPrice(rule.newPrice - rule.originalPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </Card>
); 
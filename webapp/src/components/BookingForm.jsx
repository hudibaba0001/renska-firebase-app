import React, { useState, useMemo } from 'react'
import { db } from '../firebase/init'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
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
} from 'flowbite-react'
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
  StarIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function BookingForm({ config = {} }) {
  console.log('🔧 BookingForm config:', config);
  
  // Default values if config is empty
  const defaultServices = [
    { id: 'basic-cleaning', name: 'Basic Cleaning', pricingModel: 'flat-rate', pricePerSqm: 10 }
  ];
  const availableServices = config.services?.length > 0 ? config.services : defaultServices;
  const defaultFrequencyMultiplier = { weekly: 1, biweekly: 1.15, monthly: 1.4 };
  const defaultAddOns = { oven: 500, fridge: 500, balcony: 300 };
  const defaultWindowPrices = { small: 90, medium: 120, large: 150 };
  const defaultZipAreas = ["41107", "41121", "41254", "41318", "41503"];
  
  // Form state
  const [selectedService, setSelectedService] = useState(availableServices[0]?.id || '');
  const [sqm, setSqm] = useState(50);
  const [frequency, setFrequency] = useState('weekly');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [windowSize, setWindowSize] = useState('small');
  const [zip, setZip] = useState('');
  const [useRut, setUseRut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Get current service config
  const currentService = availableServices.find(s => s.id === selectedService) || availableServices[0];
  
  // Live price calculation
  const totalPrice = useMemo(() => {
    if (!currentService || !sqm) return 0;
    
    console.log('🔧 Calculating price for:', { currentService, sqm, frequency, selectedAddOns, windowSize, zip, useRut });
    
    let basePrice = 0;
    
    // 1. Calculate base price based on pricing model
    switch (currentService.pricingModel) {
      case 'per-sqm-tiered': {
        // Find the appropriate tier
        const tier = currentService.tiers?.find(t => sqm >= t.min && sqm <= t.max);
        if (tier) {
          basePrice = sqm * tier.pricePerSqm;
        }
        break;
      }
      case 'flat-rate':
        basePrice = sqm * (currentService.pricePerSqm || 10);
        break;
      case 'per-room':
        basePrice = sqm * (currentService.pricePerRoom || 300); // Assuming sqm represents rooms for simplicity
        break;
      default:
        basePrice = sqm * 10; // fallback
    }
    
    console.log('🔧 Base price:', basePrice);
    
    // 2. Apply frequency multiplier
    const frequencyMultiplier = config.frequencyMultiplier || defaultFrequencyMultiplier;
    const freqMultiplier = frequencyMultiplier[frequency] || 1;
    basePrice = basePrice * freqMultiplier;
    
    console.log('🔧 After frequency multiplier:', basePrice);
    
    // 3. Add selected add-ons
    const addOns = config.addOns || defaultAddOns;
    const addOnsCost = selectedAddOns.reduce((total, addOnKey) => {
      return total + (addOns[addOnKey] || 0);
    }, 0);
    
    console.log('🔧 Add-ons cost:', addOnsCost);
    
    // 4. Add window cleaning
    const windowPrices = config.windowCleaningPrices || defaultWindowPrices;
    const windowCost = windowPrices[windowSize] || 0;
    
    console.log('🔧 Window cost:', windowCost);
    
    let total = basePrice + addOnsCost + windowCost;
    
    // 5. Apply RUT discount if eligible
    if (useRut && zip) {
      const zipAreas = config.zipAreas || defaultZipAreas;
      const rutPercentage = config.rutPercentage || 0.3; // 30% RUT discount
      
      if (zipAreas.includes(zip)) {
        total = total * (1 - rutPercentage);
        console.log('🔧 RUT discount applied:', total);
      }
    }
    
    return Math.round(total);
  }, [currentService, sqm, frequency, selectedAddOns, windowSize, zip, useRut, config]);

  // Handle add-on selection
  const handleAddOnChange = (addOnKey, isChecked) => {
    setSelectedAddOns(prev => 
      isChecked 
        ? [...prev, addOnKey]
        : prev.filter(key => key !== addOnKey)
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const bookingData = {
        service: selectedService,
        sqm,
        frequency,
        addOns: selectedAddOns,
        windowSize,
        zip,
        useRut,
        total: totalPrice,
        customerInfo,
        companyId: config.slug || 'unknown',
        created: Timestamp.now()
      };

      console.log('🔧 Submitting booking:', bookingData);

      // In a real app, this would go to the company's bookings subcollection
      await addDoc(collection(db, 'bookings'), bookingData);
      
      setSubmitMessage('Booking submitted successfully!');
      toast.success('Booking submitted successfully!');
      
      // Reset form
      setCustomerInfo({ name: '', email: '', phone: '' });
      setCurrentStep(1);
      
    } catch (error) {
      console.error('❌ Booking submission error:', error);
      setSubmitMessage('Failed to submit booking. Please try again.');
      toast.error('Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form validation
  const isFormValid = selectedService && sqm > 0 && customerInfo.name && customerInfo.email && customerInfo.phone;

  const stepProgress = (currentStep / 3) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Book Your Service</h2>
          <Badge color="primary" size="sm">
            Step {currentStep} of 3
          </Badge>
        </div>
        <Progress progress={stepProgress} color="primary" />
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>Service Selection</span>
          <span>Add-ons & Options</span>
          <span>Customer Info</span>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-soft">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <HomeIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Select Your Service</h3>
                  <p className="text-sm text-gray-500">Choose the cleaning service that fits your needs</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <div className="mb-3 block">
                    <Label htmlFor="service" value="Service Type" />
                  </div>
                  <Select
                    id="service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    icon={SparklesIcon}
                  >
                    {availableServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Square Meters */}
                <div>
                  <div className="mb-3 block">
                    <Label htmlFor="sqm" value="Square Meters" />
                  </div>
                  <TextInput
                    id="sqm"
                    type="number"
                    min="1"
                    max="500"
                    value={sqm}
                    onChange={(e) => setSqm(Number(e.target.value))}
                    placeholder="Enter square meters"
                    icon={HomeIcon}
                  />
                </div>

                {/* Frequency */}
                <div>
                  <div className="mb-3 block">
                    <Label htmlFor="frequency" value="Cleaning Frequency" />
                  </div>
                  <Select
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    icon={CalendarDaysIcon}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly (+15%)</option>
                    <option value="monthly">Monthly (+40%)</option>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    color="primary"
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedService || !sqm}
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Add-ons & Options */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-soft">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-secondary-100 rounded-xl">
                  <PlusIcon className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Customize Your Service</h3>
                  <p className="text-sm text-gray-500">Add extra services and specify your location</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Add-ons */}
                <div>
                  <div className="mb-4 block">
                    <Label value="Additional Services" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(config.addOns || defaultAddOns).map(([key, price]) => (
                      <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`addon-${key}`}
                          checked={selectedAddOns.includes(key)}
                          onChange={(e) => handleAddOnChange(key, e.target.checked)}
                        />
                        <Label htmlFor={`addon-${key}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <Badge color="primary" size="sm">+{price} kr</Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Window Cleaning */}
                <div>
                  <div className="mb-3 block">
                    <Label htmlFor="windows" value="Window Cleaning" />
                  </div>
                  <Select
                    id="windows"
                    value={windowSize}
                    onChange={(e) => setWindowSize(e.target.value)}
                    icon={SparklesIcon}
                  >
                    {Object.entries(config.windowCleaningPrices || defaultWindowPrices).map(([size, price]) => (
                      <option key={size} value={size}>
                        {size.charAt(0).toUpperCase() + size.slice(1)} (+{price} kr)
                      </option>
                    ))}
                  </Select>
                </div>

                {/* ZIP Code */}
                <div>
                  <div className="mb-3 block">
                    <Label htmlFor="zip" value="ZIP Code" />
                  </div>
                  <TextInput
                    id="zip"
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="Enter ZIP code"
                    icon={MapPinIcon}
                  />
                </div>

                {/* RUT Discount */}
                <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rut"
                      checked={useRut}
                      onChange={(e) => setUseRut(e.target.checked)}
                    />
                    <Label htmlFor="rut" className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <StarIcon className="h-5 w-5 text-success-600" />
                        <span className="text-sm font-medium text-success-800">
                          Apply RUT discount (30% off for eligible areas)
                        </span>
                      </div>
                    </Label>
                  </div>
                  {useRut && zip && (config.zipAreas || defaultZipAreas).includes(zip) && (
                    <div className="mt-2 flex items-center space-x-2 text-success-700">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-sm">RUT discount available for ZIP code {zip}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    color="gray"
                    onClick={() => setCurrentStep(1)}
                  >
                    Previous
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => setCurrentStep(3)}
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Customer Information */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-soft">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-success-100 rounded-xl">
                  <UserIcon className="h-6 w-6 text-success-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Information</h3>
                  <p className="text-sm text-gray-500">We'll need these details to confirm your booking</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="name" value="Full Name *" />
                    </div>
                    <TextInput
                      id="name"
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      icon={UserIcon}
                    />
                  </div>
                  
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="email" value="Email Address *" />
                    </div>
                    <TextInput
                      id="email"
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      icon={EnvelopeIcon}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="mb-2 block">
                      <Label htmlFor="phone" value="Phone Number *" />
                    </div>
                    <TextInput
                      id="phone"
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      icon={PhoneIcon}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    color="gray"
                    onClick={() => setCurrentStep(2)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={!isFormValid || isSubmitting}
                    className="flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Complete Booking</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Price Summary - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-soft bg-gradient-to-r from-primary-50 to-secondary-50 sticky bottom-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Total Price</h3>
                  <p className="text-sm text-gray-600">
                    {currentService?.name} • {sqm} sqm • {frequency}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">{totalPrice} kr</div>
                {useRut && zip && (config.zipAreas || defaultZipAreas).includes(zip) && (
                  <div className="text-sm text-success-600 font-medium">
                    RUT discount applied
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Submit Message */}
        {submitMessage && (
          <Alert color={submitMessage.includes('success') ? 'success' : 'failure'}>
            {submitMessage}
          </Alert>
        )}
      </form>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
  Tooltip,
  Textarea
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
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Import our enhanced engines
import { PricingEngine, PRICING_MODELS, PricingUtils } from '../utils/pricingEngine';
import { ValidationEngine, FIELD_TYPES, ValidationUtils } from '../utils/validationEngine';
import { PricingRulesEngine, RULE_TYPES, RuleUtils } from '../utils/pricingRulesEngine';

// Placeholder step components
const ZipCodeStep = ({ onNext, formData, setFormData, allowedZipCodes, error, setError }) => {
  // Parse zip codes - handle both array and string formats
  const parseZipCodes = (zipCodes) => {
    if (!zipCodes) return [];
    if (Array.isArray(zipCodes)) return zipCodes;
    if (typeof zipCodes === 'string') {
      // Handle comma-separated or dot-separated strings
      return zipCodes.split(/[,.\s]+/).filter(zip => zip.trim().length > 0);
    }
    return [];
  };

  const validZipCodes = parseZipCodes(allowedZipCodes);
  
  console.log('🔍 ZipCodeStep - original allowedZipCodes:', allowedZipCodes);
  console.log('🔍 ZipCodeStep - parsed validZipCodes:', validZipCodes);
  console.log('🔍 ZipCodeStep - current zip:', formData.zip);
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Steg 1: Ange postnummer</h2>
      <input
        type="text"
        className="border p-2 rounded w-full mb-2"
        placeholder="Postnummer"
        maxLength={5}
        value={formData.zip || ''}
        onChange={e => {
          setFormData(f => ({ ...f, zip: e.target.value.replace(/\D/g, '').substring(0, 5) }));
          setError('');
        }}
      />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="text-xs text-gray-500 mb-2">
        Tillåtna postnummer: {validZipCodes.join(', ') || 'Inga konfigurerade'}
      </div>
      <button
        className="bg-pink-400 text-white px-4 py-2 rounded"
        disabled={!formData.zip || formData.zip.length !== 5}
        onClick={() => {
          console.log('🔍 Checking zip code:', formData.zip, 'against:', validZipCodes);
          if (validZipCodes.includes(formData.zip)) {
            setError('');
            onNext();
          } else {
            setError('Vi levererar tyvärr inte till detta postnummer.');
          }
        }}
      >
        Nästa
      </button>
    </div>
  );
};

const ServiceSelectStep = ({ onNext, onBack, formData, setFormData, config }) => {
  const services = Array.isArray(config.services) ? config.services : [];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Steg 2: Välj tjänst</h2>
      {services.length === 0 ? (
        <div className="text-red-600 mb-4">Inga tjänster är konfigurerade för detta företag.</div>
      ) : (
        <>
          <select
            className="border p-2 rounded w-full mb-4"
            value={formData.service || ''}
            onChange={e => setFormData(f => ({ ...f, service: e.target.value }))}
          >
            <option value="">-- Välj tjänst --</option>
            {services.map(svc => (
              <option key={svc.id} value={svc.id}>{svc.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={onBack}>Tillbaka</button>
            <button
              className="bg-pink-400 text-white px-4 py-2 rounded"
              disabled={!formData.service}
              onClick={onNext}
            >
              Nästa
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ServiceDetailsStep = ({ onNext, onBack, formData, setFormData, config }) => {
  const service = formData.service;
  
  // Get the selected service object
  const selectedService = config.services?.find(s => s.id === service);
  
  // Get add-ons from the selected service
  const addOns = selectedService?.addOns || [];
  
  console.log('🔍 ServiceDetailsStep - service ID:', service);
  console.log('🔍 ServiceDetailsStep - config:', config);
  console.log('🔍 ServiceDetailsStep - config.services:', config.services);
  console.log('🔍 ServiceDetailsStep - selectedService:', selectedService);
  console.log('🔍 ServiceDetailsStep - addOns:', addOns);
  console.log('🔍 ServiceDetailsStep - formData:', formData);
  
  // Add error handling
  if (!service) {
    console.error('❌ ServiceDetailsStep - No service selected');
    return (
      <div className="text-red-600">
        <h2 className="text-xl font-bold mb-4">Steg 3: Tjänstedetaljer & tillval</h2>
        <p>Ingen tjänst vald. Gå tillbaka och välj en tjänst.</p>
        <button className="bg-gray-300 px-4 py-2 rounded mt-4" onClick={onBack}>Tillbaka</button>
      </div>
    );
  }
  
  if (!selectedService) {
    console.error('❌ ServiceDetailsStep - Selected service not found in config');
    return (
      <div className="text-red-600">
        <h2 className="text-xl font-bold mb-4">Steg 3: Tjänstedetaljer & tillval</h2>
        <p>Den valda tjänsten kunde inte hittas. Gå tillbaka och välj en tjänst igen.</p>
        <button className="bg-gray-300 px-4 py-2 rounded mt-4" onClick={onBack}>Tillbaka</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Steg 3: Tjänstedetaljer & tillval</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Yta (m²)</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          min={1}
          value={formData.area || ''}
          onChange={e => setFormData(f => ({ ...f, area: e.target.value }))}
          placeholder="Ange yta i m²"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tillägg</label>
        {addOns.length === 0 ? (
          <div className="text-gray-500">Inga tillval tillgängliga för denna tjänst.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {addOns.map((addOn, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData[`addon_${addOn.name || addOn}`]}
                  onChange={e => setFormData(f => ({ 
                    ...f, 
                    [`addon_${addOn.name || addOn}`]: e.target.checked 
                  }))}
                />
                <span>{addOn.name || addOn}</span>
                {addOn.price && (
                  <span className="text-sm text-gray-600">(+{addOn.price} kr)</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={onBack}>Tillbaka</button>
        <button className="bg-pink-400 text-white px-4 py-2 rounded" onClick={onNext} disabled={!formData.area}>Nästa</button>
      </div>
    </div>
  );
};

const CustomerInfoStep = ({ onBack, formData, setFormData, companyId, totalPrice, rutApplied, paymentConfig }) => {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Add null checks and default values for paymentConfig
  const safePaymentConfig = paymentConfig || { mode: 'manual', instructions: 'Vi kommer att kontakta dig för betalning.' };

  // Debug logging
  console.log('🔍 CustomerInfoStep - paymentConfig:', paymentConfig);
  console.log('🔍 CustomerInfoStep - safePaymentConfig:', safePaymentConfig);
  console.log('🔍 CustomerInfoStep - formData:', formData);
  console.log('🔍 CustomerInfoStep - totalPrice:', totalPrice);
  console.log('🔍 CustomerInfoStep - rutApplied:', rutApplied);

  const handleSubmit = async e => {
    e.preventDefault();
    setProcessing(true);
    // Basic validation
    const requiredFields = ['customerName', 'customerPhone', 'customerEmail', 'customerAddress', 'customerDate', 'customerTime'];
    if (rutApplied) {
      requiredFields.push('personalNumber');
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError('Vänligen fyll i alla obligatoriska fält, inklusive personnummer för RUT-avdrag.');
        setProcessing(false);
        return;
      }
    }
    setError('');

    const bookingData = {
      ...formData,
      totalPrice: totalPrice,
      rutApplied,
      status: 'pending',
      createdAt: new Date(),
      companyId: companyId,
    };

    if (safePaymentConfig.mode === 'manual') {
      try {
        await addDoc(collection(db, `companies/${companyId}/bookings`), bookingData);
        toast.success('Bokning skickad! Företaget kommer att kontakta dig för betalning.');
      } catch (err) {
        console.error("Error creating booking:", err);
        toast.error('Kunde inte slutföra bokningen.');
        setError('Ett fel uppstod. Försök igen.');
      } finally {
        setProcessing(false);
      }
    } else { // Online payment
      try {
        const functions = getFunctions();
        const createBookingPaymentIntent = httpsCallable(functions, 'createBookingPaymentIntent');
        const result = await createBookingPaymentIntent({
          companyId,
          bookingData,
          successUrl: `${window.location.origin}/booking/${companyId}/success`,
          cancelUrl: window.location.href
        });
        
        window.location.href = result.data.sessionUrl;
      } catch (err) {
        console.error("Error creating payment intent:", err);
        toast.error('Kunde inte initiera betalning.');
        setError('Ett fel uppstod med betalningen. Försök igen.');
        setProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Steg 4: Kundinformation</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {rutApplied && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">Personnummer (för RUT) *</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={formData.personalNumber || ''}
            onChange={e => setFormData(f => ({ ...f, personalNumber: e.target.value }))}
            placeholder="ÅÅÅÅMMDD-XXXX"
            required
          />
        </div>
      )}
      {/* ... other fields ... */}
      <div className="flex gap-2">
        <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onBack}>Tillbaka</button>
        <Button type="submit" color="pink" disabled={processing}>
          {processing ? <Spinner/> : (safePaymentConfig.mode === 'manual' ? 'Skicka bokning' : 'Gå till betalning')}
        </Button>
      </div>
      {safePaymentConfig.mode === 'manual' && safePaymentConfig.instructions && (
        <Alert color="info" className="mt-4">
          <p className="font-semibold">Betalningsinstruktioner:</p>
          <p>{safePaymentConfig.instructions}</p>
        </Alert>
      )}
    </form>
  );
};

const PriceCard = ({ originalPrice, finalPrice, rutApplied, selectedService, formData, step }) => {
  // Calculate add-ons total
  const addOnsTotal = selectedService?.addOns?.reduce((total, addOn) => {
    const addOnKey = `addon_${addOn.name || addOn}`;
    return formData[addOnKey] ? total + (addOn.price || 0) : total;
  }, 0) || 0;

  // Calculate base price (without add-ons only, custom fees are part of the base service)
  const basePrice = originalPrice - addOnsTotal;

  // Debug logging
  console.log('💰 PriceCard - originalPrice:', originalPrice);
  console.log('💰 PriceCard - addOnsTotal:', addOnsTotal);
  console.log('💰 PriceCard - basePrice:', basePrice);
  console.log('💰 PriceCard - custom fees:', selectedService?.customFees);
  console.log('💰 PriceCard - step:', step);

  return (
    <div className="sticky top-4 bg-white shadow-lg rounded-lg p-6 min-w-[320px] border border-gray-200">
      {/* Header */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
        Sammanställning
      </h3>
      
      {/* Service Breakdown */}
      <div className="space-y-3 mb-4">
        {selectedService ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{selectedService.name}</span>
              <span className="font-semibold text-gray-900">{basePrice.toLocaleString()} kr</span>
            </div>
            
            {/* Add-ons */}
            {selectedService?.addOns?.map((addOn, index) => {
              const addOnKey = `addon_${addOn.name || addOn}`;
              if (formData[addOnKey]) {
                return (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">+ {addOn.name || addOn}</span>
                    <span className="font-medium text-gray-700">{(addOn.price || 0).toLocaleString()} kr</span>
                  </div>
                );
              }
              return null;
            })}
            
            {/* Custom Fees */}
            {selectedService?.customFees && selectedService.customFees.length > 0 && (
              <>
                <div className="pt-2 border-t border-gray-100">
                  {selectedService.customFees.map((fee, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{fee.label || 'Custom Fee'}</span>
                      <span className="font-medium text-gray-700">{(fee.amount || 0).toLocaleString()} kr</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="h-12 w-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm">
                {step === 1 ? 'Ange ditt postnummer för att komma igång' : 
                 step === 2 ? 'Välj en tjänst för att se priset' :
                 'Konfigurera tjänsten för att se priset'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Date and Time Section */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Datum och tid</h4>
        <span className="text-gray-500">-</span>
      </div>
      
      {/* Total Section */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-1">Totalt</h4>
        {rutApplied && (
          <p className="text-xs text-gray-500 mb-2">efter rutavdrag</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            {selectedService ? (rutApplied ? finalPrice : originalPrice) : 0} kr
            {rutApplied && <span className="text-xs text-gray-500 ml-1">*</span>}
          </span>
        </div>
        {rutApplied && (
          <p className="text-xs text-gray-500 mt-1">
            *Framkörningsavgift kan tillkomma om du bor utanför stadsgräns.
          </p>
        )}
      </div>
      
      {/* RUT Breakdown (if applicable) */}
      {rutApplied && selectedService && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-green-700">RUT-avdrag</span>
            <span className="font-semibold text-green-700">
              -{(originalPrice - finalPrice).toLocaleString()} kr
            </span>
          </div>
        </div>
      )}
      
      {/* Discount Code Section */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Rabattkod</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ange kod"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            LÄGG TILL
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BookingCalculator({ config: propConfig, companyId: propCompanyId }) {
  const { companyId: paramCompanyId } = useParams();
  const companyId = propCompanyId || paramCompanyId;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [config, setConfig] = useState(propConfig);
  const [services, setServices] = useState(propConfig?.services || []);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loading, setLoading] = useState(!propConfig);
  const [error, setError] = useState('');
  const [zipError, setZipError] = useState('');
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [rutApplied, setRutApplied] = useState(false);

  // Update config and services when propConfig changes
  useEffect(() => {
    if (propConfig) {
      console.log('📋 BookingCalculator received config:', propConfig);
      setConfig(propConfig);
      setServices(propConfig.services || []);
      setLoading(false);
    }
  }, [propConfig]);

  useEffect(() => {
    async function fetchConfig() {
      // Only fetch if no config was passed as prop
      if (propConfig) {
        console.log('📋 Using config from props, skipping fetch');
        return;
      }

      console.log('🔍 BookingCalculator fetching config for company:', companyId);
      setLoading(true);
      setError('');
      try {
        // Fetch company config
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (!companyDoc.exists()) {
          setError('Företag hittades inte.');
          return;
        }
        const companyData = companyDoc.data();
        setConfig(companyData);

        // Fetch services
        const servicesSnapshot = await getDocs(collection(db, `companies/${companyId}/services`));
        const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesData);

        // Fetch payment config
        const paymentDoc = await getDoc(doc(db, 'companies', companyId, 'config', 'payment'));
        if (paymentDoc.exists()) {
          setPaymentConfig(paymentDoc.data());
        } else {
          setPaymentConfig({ mode: 'manual', instructions: 'Vi kommer att kontakta dig för betalning.' });
        }
      } catch (err) {
        console.error('Error fetching config:', err);
        setError('Kunde inte ladda konfiguration.');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [companyId, propConfig]);

  useEffect(() => {
    const selectedService = services.find(s => s.id === formData.service);
    console.log('💰 Price calculation - selectedService:', selectedService);
    console.log('💰 Price calculation - formData:', formData);
    console.log('💰 Price calculation - custom fees:', selectedService?.customFees);
    
    if (formData.area && selectedService) {
      let calculatedPrice = 0;
      
      // Calculate base price based on service pricing model
      if (selectedService.pricingModel === 'universal') {
        // Universal rate per sqm
        calculatedPrice = formData.area * (selectedService.universalRate || 50);
      } else if (selectedService.pricingModel === 'fixed-tier') {
        // Fixed tier pricing
        const tier = selectedService.tiers?.find(t => 
          formData.area >= t.min && formData.area <= t.max
        );
        calculatedPrice = tier?.price || selectedService.minPrice || 1000;
      } else if (selectedService.pricingModel === 'hourly') {
        // Hourly pricing
        const hourlyTier = selectedService.hourlyTiers?.find(t => 
          formData.area >= t.min && formData.area <= t.max
        );
        const hours = hourlyTier?.hours || 3;
        calculatedPrice = hours * (selectedService.hourlyRate || 400);
      } else {
        // Default pricing
        calculatedPrice = formData.area * (selectedService.pricePerSqm || 50);
      }
      
      // Add add-ons prices
      let addOnsPrice = 0;
      if (selectedService.addOns && Array.isArray(selectedService.addOns)) {
        selectedService.addOns.forEach(addOn => {
          const addOnKey = `addon_${addOn.name || addOn}`;
          if (formData[addOnKey]) {
            addOnsPrice += addOn.price || 0;
          }
        });
      }
      
      // Add custom fees from the service
      let customFeesPrice = 0;
      if (selectedService.customFees && Array.isArray(selectedService.customFees)) {
        selectedService.customFees.forEach(fee => {
          customFeesPrice += fee.amount || 0;
        });
      }
      
      const totalPrice = calculatedPrice + addOnsPrice + customFeesPrice;
      
      console.log('💰 Price calculation - base price:', calculatedPrice);
      console.log('💰 Price calculation - add-ons price:', addOnsPrice);
      console.log('💰 Price calculation - custom fees price:', customFeesPrice);
      console.log('💰 Price calculation - total price:', totalPrice);
      
      setOriginalPrice(totalPrice);

      // Apply RUT discount if eligible
      if (selectedService.rutEligible && config.rutEnabled) {
        const rutDiscount = totalPrice * (config.rutPercentage || 0.3);
        setFinalPrice(totalPrice - rutDiscount);
        setRutApplied(true);
      } else {
        setFinalPrice(totalPrice);
        setRutApplied(false);
      }
    } else {
      setOriginalPrice(0);
      setFinalPrice(0);
      setRutApplied(false);
    }
  }, [formData, services, config]);

  if (loading) return <div>Laddar...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!config) return <div>Ingen konfiguration hittades.</div>;

  return (
    <div className="flex gap-8">
      <div className={step >= 3 ? "flex-1" : "w-full"}>
        {step === 1 && (
          <>
            {console.log('🔍 BookingCalculator - config.zipAreas:', config?.zipAreas)}
            <ZipCodeStep
              onNext={() => setStep(2)}
              formData={formData}
              setFormData={setFormData}
              allowedZipCodes={config.zipAreas || []}
              error={zipError}
              setError={setZipError}
            />
          </>
        )}
        {step === 2 && (
          <ServiceSelectStep
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            formData={formData}
            setFormData={setFormData}
            config={config}
          />
        )}
        {step === 3 && (
          <>
            {console.log('🎯 Step 3 - ServiceDetailsStep active')}
            {console.log('🎯 Step 3 - formData:', formData)}
            {console.log('🎯 Step 3 - config:', config)}
            {console.log('🎯 Step 3 - selectedService:', services.find(s => s.id === formData.service))}
            <ServiceDetailsStep
              onNext={() => {
                console.log('🎯 Step 3 - Next button clicked, moving to step 4');
                setStep(4);
              }}
              onBack={() => {
                console.log('🎯 Step 3 - Back button clicked, moving to step 2');
                setStep(2);
              }}
              formData={formData}
              setFormData={setFormData}
              config={config}
            />
          </>
        )}
        {step === 4 && (
          <CustomerInfoStep
            onBack={() => setStep(3)}
            formData={formData}
            setFormData={setFormData}
            companyId={companyId}
            totalPrice={finalPrice}
            rutApplied={rutApplied}
            paymentConfig={paymentConfig}
          />
        )}
      </div>
      {step >= 3 && (
        <div className="w-80">
          {console.log('💰 PriceCard rendering - step:', step, 'originalPrice:', originalPrice)}
          <div className={step === 3 ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg' : ''}>
            <PriceCard originalPrice={originalPrice} finalPrice={finalPrice} rutApplied={rutApplied} selectedService={services.find(s => s.id === formData.service)} formData={formData} config={config} step={step} />
          </div>
        </div>
      )}
    </div>
  );
}

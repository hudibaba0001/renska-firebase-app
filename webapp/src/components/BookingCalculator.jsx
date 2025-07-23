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
      className="border p-2 rounded w-full mb-2 bg-white"
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
  // Use the services from the form config, not all company services
  const services = Array.isArray(config.services) ? config.services : [];
  
  console.log('🔍 ServiceSelectStep - config.services:', config.services);
  console.log('🔍 ServiceSelectStep - filtered services:', services);
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Steg 2: Välj tjänst</h2>
      {services.length === 0 ? (
        <div className="text-red-600 mb-4">Inga tjänster är konfigurerade för detta formulär.</div>
      ) : (
        <>
          <select
            className="border p-2 rounded w-full mb-4 bg-white"
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
  
  // Get the selected service object from the form config services
  const selectedService = config.services?.find(s => s.id === service);
  
  // Get add-ons from the selected service
  const addOns = selectedService?.addOns || [];
  
  // Debug logging
  console.log('🔍 ServiceDetailsStep - service ID:', service);
  console.log('🔍 ServiceDetailsStep - config:', config);
  console.log('🔍 ServiceDetailsStep - config.services:', config.services);
  console.log('🔍 ServiceDetailsStep - selectedService:', selectedService);
  console.log('🔍 ServiceDetailsStep - addOns:', addOns);
  console.log('🔍 ServiceDetailsStep - formData:', formData);
  console.log('🔍 ServiceDetailsStep - frequencyEnabled:', selectedService?.frequencyEnabled);
  console.log('🔍 ServiceDetailsStep - frequencyMultipliers:', config.frequencyMultipliers);
  console.log('🔍 ServiceDetailsStep - frequencyMultipliers length:', config.frequencyMultipliers?.length);
  
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

  // Check if this is a window cleaning service
  const isWindowService = selectedService.pricingModel === 'window';
  const windowTypes = selectedService.windowTypes || [];
  
  // Check if this is a per-room service
  const isPerRoomService = selectedService.pricingModel === 'per-room';
  const roomTypes = selectedService.perRoomRates || [];
  
  // Check if form is valid for next step
  const isFormValid = () => {
    if (isWindowService) {
      // For window services, check if at least one window type has quantity > 0
      return windowTypes.some((_, index) => (formData[`window_${index}`] || 0) > 0);
    } else if (isPerRoomService) {
      // For per-room services, check if at least one room type has quantity > 0
      return roomTypes.some((_, index) => (formData[`room_${index}`] || 0) > 0);
    } else {
      // For other services, check if area is filled
      return formData.area && formData.area > 0;
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Steg 3: Tjänstedetaljer & tillval</h2>
      
      {isWindowService ? (
        // Window cleaning service
        <div className="mb-4">
          <label className="block font-semibold mb-1">Fönstertyper</label>
          {windowTypes.length === 0 ? (
            <div className="text-gray-500">Inga fönstertyper konfigurerade för denna tjänst.</div>
          ) : (
            <div className="space-y-3">
              {windowTypes.map((windowType, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <span className="font-medium">{windowType.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({windowType.price} kr/st)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Antal:</label>
                    <div className="flex items-center border rounded">
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border-r text-gray-600 font-bold"
                        onClick={() => {
                          const currentValue = formData[`window_${index}`] || 0;
                          if (currentValue > 0) {
                            setFormData(f => ({ 
                              ...f, 
                              [`window_${index}`]: currentValue - 1 
                            }));
                          }
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="w-16 p-1 text-center border-none focus:ring-0"
                        value={formData[`window_${index}`] || 0}
                        onChange={e => setFormData(f => ({ 
                          ...f, 
                          [`window_${index}`]: parseInt(e.target.value) || 0 
                        }))}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border-l text-gray-600 font-bold"
                        onClick={() => {
                          const currentValue = formData[`window_${index}`] || 0;
                          setFormData(f => ({ 
                            ...f, 
                            [`window_${index}`]: currentValue + 1 
                          }));
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isPerRoomService ? (
        // Per-room service
        <div className="mb-4">
          <label className="block font-semibold mb-1">Rumstyper</label>
          {roomTypes.length === 0 ? (
            <div className="text-gray-500">Inga rumstyper konfigurerade för denna tjänst.</div>
          ) : (
            <div className="space-y-3">
              {roomTypes.map((roomType, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <span className="font-medium">{roomType.type || roomType.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({roomType.price} kr/rum)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Antal:</label>
                    <div className="flex items-center border rounded">
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border-r text-gray-600 font-bold"
                        onClick={() => {
                          const currentValue = formData[`room_${index}`] || 0;
                          if (currentValue > 0) {
                            setFormData(f => ({ 
                              ...f, 
                              [`room_${index}`]: currentValue - 1 
                            }));
                          }
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="w-16 p-1 text-center border-none focus:ring-0"
                        value={formData[`room_${index}`] || 0}
                        onChange={e => setFormData(f => ({ 
                          ...f, 
                          [`room_${index}`]: parseInt(e.target.value) || 0 
                        }))}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border-l text-gray-600 font-bold"
                        onClick={() => {
                          const currentValue = formData[`room_${index}`] || 0;
                          setFormData(f => ({ 
                            ...f, 
                            [`room_${index}`]: currentValue + 1 
                          }));
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Regular service with area input
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
      )}
      
      {/* Additional Options & Modifiers */}
      {(() => {
        // Check for any available modifiers (frequency, pet surcharge, etc.)
        const companyFrequencyMultipliers = config.frequencyMultipliers;
        const serviceFrequencyMultipliers = selectedService?.frequencyMultipliers;
        const frequencyMultipliers = serviceFrequencyMultipliers || companyFrequencyMultipliers;
        
        const hasFrequencyOptions = selectedService.frequencyEnabled !== false && frequencyMultipliers && frequencyMultipliers.length > 0;
        const hasPetSurcharge = selectedService.petSurcharge !== false;
        const hasAccessibilityOptions = selectedService.accessibilityOptions && selectedService.accessibilityOptions.length > 0;
        const hasTimePreferences = selectedService.timePreferences && selectedService.timePreferences.length > 0;
        const hasPropertyTypeOptions = selectedService.propertyTypeOptions && selectedService.propertyTypeOptions.length > 0;
        
        const hasAnyModifiers = hasFrequencyOptions || hasPetSurcharge || hasAccessibilityOptions || hasTimePreferences || hasPropertyTypeOptions;
        
        console.log('🔍 Additional Options check:');
        console.log('  - hasFrequencyOptions:', hasFrequencyOptions);
        console.log('  - hasPetSurcharge:', hasPetSurcharge);
        console.log('  - hasAccessibilityOptions:', hasAccessibilityOptions);
        console.log('  - hasTimePreferences:', hasTimePreferences);
        console.log('  - hasPropertyTypeOptions:', hasPropertyTypeOptions);
        console.log('  - hasAnyModifiers:', hasAnyModifiers);
        
        return hasAnyModifiers;
      })() && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Ytterligare alternativ</h3>
          
          {/* Frequency Selection */}
          {(() => {
            const companyFrequencyMultipliers = config.frequencyMultipliers;
            const serviceFrequencyMultipliers = selectedService?.frequencyMultipliers;
            const frequencyMultipliers = serviceFrequencyMultipliers || companyFrequencyMultipliers;
            
            console.log('🔍 Frequency Selection Debug:');
            console.log('  - companyFrequencyMultipliers:', companyFrequencyMultipliers);
            console.log('  - serviceFrequencyMultipliers:', serviceFrequencyMultipliers);
            console.log('  - frequencyMultipliers (final):', frequencyMultipliers);
            console.log('  - selectedService.frequencyEnabled:', selectedService.frequencyEnabled);
            
            return selectedService.frequencyEnabled !== false && frequencyMultipliers && frequencyMultipliers.length > 0;
          })() && (
            <div className="mb-4">
              <label className="block font-semibold mb-2">Frekvens</label>
              <select
                className="border p-2 rounded w-full"
                value={formData.frequency || ''}
                onChange={e => setFormData(f => ({ ...f, frequency: e.target.value }))}
              >
                <option value="">Välj frekvens</option>
                {(selectedService?.frequencyMultipliers || config.frequencyMultipliers || []).map((freq, index) => {
                  console.log('🔍 Frequency option:', freq);
                  console.log('  - freq.key:', freq.key);
                  console.log('  - freq.label:', freq.label);
                  console.log('  - freq.multiplier:', freq.multiplier);
                  console.log('  - option value will be:', freq.key || freq.label);
                  return (
                    <option key={index} value={freq.key || freq.label}>
                      {freq.label} {freq.multiplier !== 1 ? `(${freq.multiplier}x)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          
          {/* Pet Surcharge */}
          {selectedService.petSurcharge !== false && (
            <div className="mb-4">
              <label className="flex items-center gap-2 font-semibold mb-2">
                <input
                  type="checkbox"
                  checked={!!formData.hasPets}
                  onChange={e => setFormData(f => ({ ...f, hasPets: e.target.checked }))}
                  className="rounded"
                />
                <span>Har ni husdjur? (+10%)</span>
              </label>
              <p className="text-sm text-gray-600 ml-6">Vi tar extra tid för att säkerställa att husdjuren är trygga under städningen.</p>
            </div>
          )}
          
          {/* Accessibility Options */}
          {selectedService.accessibilityOptions && selectedService.accessibilityOptions.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-2">Tillgänglighet</label>
              <div className="space-y-2">
                {selectedService.accessibilityOptions.map((option, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formData[`accessibility_${index}`]}
                      onChange={e => setFormData(f => ({ 
                        ...f, 
                        [`accessibility_${index}`]: e.target.checked 
                      }))}
                      className="rounded"
                    />
                    <span>{option.label}</span>
                    {option.surcharge && (
                      <span className="text-sm text-gray-600">(+{option.surcharge}%)</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Time Preferences */}
          {selectedService.timePreferences && selectedService.timePreferences.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-2">Tidspreferens</label>
              <select
                className="border p-2 rounded w-full"
                value={formData.timePreference || ''}
                onChange={e => setFormData(f => ({ ...f, timePreference: e.target.value }))}
              >
                <option value="">Välj tidspreferens</option>
                {selectedService.timePreferences.map((pref, index) => (
                  <option key={index} value={pref.key || pref.label}>
                    {pref.label} {pref.surcharge ? `(+${pref.surcharge}%)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Property Type */}
          {selectedService.propertyTypeOptions && selectedService.propertyTypeOptions.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-2">Fastighetstyp</label>
              <select
                className="border p-2 rounded w-full"
                value={formData.propertyType || ''}
                onChange={e => setFormData(f => ({ ...f, propertyType: e.target.value }))}
              >
                <option value="">Välj fastighetstyp</option>
                {selectedService.propertyTypeOptions.map((type, index) => (
                  <option key={index} value={type.key || type.label}>
                    {type.label} {type.surcharge ? `(+${type.surcharge}%)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      
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
        <button className="bg-pink-400 text-white px-4 py-2 rounded" onClick={onNext} disabled={!isFormValid()}>Nästa</button>
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
      
      {/* Customer Name */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Namn *</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={formData.customerName || ''}
          onChange={e => setFormData(f => ({ ...f, customerName: e.target.value }))}
          placeholder="Ditt fullständiga namn"
          required
        />
      </div>
      
      {/* Customer Email */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">E-post *</label>
        <input
          type="email"
          className="border p-2 rounded w-full"
          value={formData.customerEmail || ''}
          onChange={e => setFormData(f => ({ ...f, customerEmail: e.target.value }))}
          placeholder="din.email@example.com"
          required
        />
      </div>
      
      {/* Customer Phone */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Telefon *</label>
        <input
          type="tel"
          className="border p-2 rounded w-full"
          value={formData.customerPhone || ''}
          onChange={e => setFormData(f => ({ ...f, customerPhone: e.target.value }))}
          placeholder="070-123 45 67"
          required
        />
      </div>
      
      {/* Customer Address */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Adress *</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={formData.customerAddress || ''}
          onChange={e => setFormData(f => ({ ...f, customerAddress: e.target.value }))}
          placeholder="Gatuadress, postnummer och ort"
          required
        />
      </div>
      
      {/* Preferred Date */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Önskat datum *</label>
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={formData.customerDate || ''}
          onChange={e => setFormData(f => ({ ...f, customerDate: e.target.value }))}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      
      {/* Preferred Time */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Önskad tid *</label>
        <select
          className="border p-2 rounded w-full"
          value={formData.customerTime || ''}
          onChange={e => setFormData(f => ({ ...f, customerTime: e.target.value }))}
          required
        >
          <option value="">Välj tid</option>
          <option value="08:00">08:00</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="12:00">12:00</option>
          <option value="13:00">13:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
          <option value="17:00">17:00</option>
        </select>
      </div>
      
      {/* Personal Number for RUT */}
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
      
      {/* GDPR Consent */}
      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.gdprConsent || false}
            onChange={e => setFormData(f => ({ ...f, gdprConsent: e.target.checked }))}
            required
            className="rounded"
          />
          <span className="text-sm">
            Jag godkänner att mina uppgifter behandlas enligt GDPR för att hantera min bokning. *
          </span>
        </label>
      </div>
      
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

const PriceCard = ({ originalPrice, finalPrice, rutApplied, selectedService, formData, step, config }) => {
  // Calculate add-ons total
  const addOnsTotal = selectedService?.addOns?.reduce((total, addOn) => {
    const addOnKey = `addon_${addOn.name || addOn}`;
    return formData[addOnKey] ? total + (addOn.price || 0) : total;
  }, 0) || 0;

  // Calculate custom fees total - only if there's service data
  const hasServiceData = (selectedService?.pricingModel === 'window' && 
    selectedService.windowTypes?.some((_, index) => (formData[`window_${index}`] || 0) > 0)) ||
    (selectedService?.pricingModel === 'per-room' && 
    selectedService.perRoomRates?.some((_, index) => (formData[`room_${index}`] || 0) > 0)) ||
    (selectedService?.pricingModel !== 'window' && selectedService?.pricingModel !== 'per-room' && formData.area && formData.area > 0);

  const customFeesTotal = hasServiceData && selectedService?.customFees ? 
    selectedService.customFees.reduce((total, fee) => total + (fee.amount || 0), 0) : 0;

  // Calculate base price from service data instead of subtracting from total
  let basePrice = 0;
  if (hasServiceData && selectedService) {
    if (selectedService.pricingModel === 'window') {
      const windowTypes = selectedService.windowTypes || [];
      windowTypes.forEach((windowType, index) => {
        const quantity = formData[`window_${index}`] || 0;
        basePrice += quantity * (windowType.price || 0);
      });
    } else if (selectedService.pricingModel === 'per-room') {
      const roomTypes = selectedService.perRoomRates || [];
      roomTypes.forEach((roomType, index) => {
        const quantity = formData[`room_${index}`] || 0;
        basePrice += quantity * (roomType.price || 0);
      });
    } else if (selectedService.pricingModel === 'universal') {
      const area = formData.area || 0;
      basePrice = area * (selectedService.universalRate || 50);
    } else if (selectedService.pricingModel === 'fixed-tier') {
      const area = formData.area || 0;
      const tier = selectedService.tiers?.find(t => area >= t.min && area <= t.max);
      basePrice = tier?.price || selectedService.minPrice || 1000;
    } else if (selectedService.pricingModel === 'tiered-multiplier') {
      const area = formData.area || 0;
      const tier = selectedService.tiers?.find(t => area >= t.min && area <= t.max);
      if (tier) {
        basePrice = area * (tier.multiplier || tier.price || 50);
      } else {
        basePrice = selectedService.minPrice || 1000;
      }
    } else if (selectedService.pricingModel === 'hourly') {
      const area = formData.area || 0;
      const hourlyTier = selectedService.hourlyTiers?.find(t => area >= t.min && area <= t.max);
      const hours = hourlyTier?.hours || 3;
      basePrice = hours * (selectedService.hourlyRate || 400);
    } else {
      // Default pricing
      const area = formData.area || 0;
      basePrice = area * (selectedService.pricePerSqm || 50);
    }

    // Apply minimum price if applicable
    if (hasServiceData && selectedService.minPrice) {
      basePrice = Math.max(basePrice, selectedService.minPrice);
    }

    // Apply frequency multiplier if selected
    if (formData.frequency) {
      console.log('🔍 Frequency multiplier check:');
      console.log('  - formData.frequency:', formData.frequency);
      console.log('  - selectedService.frequencyMultipliers:', selectedService.frequencyMultipliers);
      console.log('  - config.frequencyMultipliers:', config.frequencyMultipliers);
      
      // Use service frequency multipliers first, fallback to company
      const frequencyMultipliers = selectedService.frequencyMultipliers || config.frequencyMultipliers;
      
      // Try multiple matching strategies
      let selectedFrequency = frequencyMultipliers.find(freq => 
        (freq.key || freq.label) === formData.frequency
      );
      
      // If not found, try case-insensitive matching
      if (!selectedFrequency) {
        selectedFrequency = frequencyMultipliers.find(freq => 
          (freq.key || freq.label)?.toLowerCase() === formData.frequency?.toLowerCase()
        );
      }
      
      // If still not found, try partial matching
      if (!selectedFrequency) {
        selectedFrequency = frequencyMultipliers.find(freq => 
          (freq.key || freq.label)?.toLowerCase().includes(formData.frequency?.toLowerCase()) ||
          formData.frequency?.toLowerCase().includes((freq.key || freq.label)?.toLowerCase())
        );
      }
      
      console.log('  - selectedFrequency:', selectedFrequency);
      console.log('  - selectedFrequency?.multiplier:', selectedFrequency?.multiplier);
      
      if (selectedFrequency && selectedFrequency.multiplier && selectedFrequency.multiplier !== 1) {
        console.log('  - Applying frequency multiplier:', selectedFrequency.multiplier);
        console.log('  - Base price before frequency:', basePrice);
        basePrice = Math.round(basePrice * selectedFrequency.multiplier);
        console.log('  - Base price after frequency:', basePrice);
      } else {
        console.log('  - No frequency multiplier applied (multiplier is 1 or not found)');
      }
    } else {
      console.log('🔍 No frequency selected');
    }
    
    // Apply pet surcharge if selected
    if (formData.hasPets && selectedService.petSurcharge !== false) {
      const petSurcharge = selectedService.petSurchargePercentage || 10; // Default 10%
      console.log('🐕 Applying pet surcharge:', petSurcharge + '%');
      console.log('  - Base price before pet surcharge:', basePrice);
      basePrice = Math.round(basePrice * (1 + petSurcharge / 100));
      console.log('  - Base price after pet surcharge:', basePrice);
    }
    
    // Apply accessibility surcharges
    if (selectedService.accessibilityOptions && selectedService.accessibilityOptions.length > 0) {
      selectedService.accessibilityOptions.forEach((option, index) => {
        if (formData[`accessibility_${index}`] && option.surcharge) {
          console.log('♿ Applying accessibility surcharge:', option.label, option.surcharge + '%');
          console.log('  - Base price before accessibility surcharge:', basePrice);
          basePrice = Math.round(basePrice * (1 + option.surcharge / 100));
          console.log('  - Base price after accessibility surcharge:', basePrice);
        }
      });
    }
    
    // Apply time preference surcharge
    if (formData.timePreference && selectedService.timePreferences) {
      const selectedTimePref = selectedService.timePreferences.find(pref => 
        (pref.key || pref.label) === formData.timePreference
      );
      if (selectedTimePref && selectedTimePref.surcharge) {
        console.log('⏰ Applying time preference surcharge:', selectedTimePref.label, selectedTimePref.surcharge + '%');
        console.log('  - Base price before time surcharge:', basePrice);
        basePrice = Math.round(basePrice * (1 + selectedTimePref.surcharge / 100));
        console.log('  - Base price after time surcharge:', basePrice);
      }
    }
    
    // Apply property type surcharge
    if (formData.propertyType && selectedService.propertyTypeOptions) {
      const selectedPropertyType = selectedService.propertyTypeOptions.find(type => 
        (type.key || type.label) === formData.propertyType
      );
      if (selectedPropertyType && selectedPropertyType.surcharge) {
        console.log('🏠 Applying property type surcharge:', selectedPropertyType.label, selectedPropertyType.surcharge + '%');
        console.log('  - Base price before property surcharge:', basePrice);
        basePrice = Math.round(basePrice * (1 + selectedPropertyType.surcharge / 100));
        console.log('  - Base price after property surcharge:', basePrice);
      }
    }
  }

  // Debug logging
  console.log('💰 PriceCard - originalPrice:', originalPrice);
  console.log('💰 PriceCard - addOnsTotal:', addOnsTotal);
  console.log('💰 PriceCard - customFeesTotal:', customFeesTotal);
  console.log('💰 PriceCard - basePrice:', basePrice);
  console.log('💰 PriceCard - hasServiceData:', hasServiceData);
  console.log('💰 PriceCard - step:', step);

  // Show price card on steps 3 and 4, but on step 3 show with zero values until user enters data
  const shouldShowPriceCard = step >= 3;

  if (!shouldShowPriceCard) {
    return null;
  }

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
              <span className="font-semibold text-gray-900">{hasServiceData ? basePrice.toLocaleString() : '0'} kr</span>
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
            
            {/* Modifiers */}
            {formData.hasPets && selectedService.petSurcharge !== false && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">+ Husdjurstillägg</span>
                <span className="font-medium text-gray-700">{(basePrice * 0.1).toLocaleString()} kr</span>
              </div>
            )}
            
            {selectedService.accessibilityOptions && selectedService.accessibilityOptions.map((option, index) => {
              if (formData[`accessibility_${index}`] && option.surcharge) {
                return (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">+ {option.label}</span>
                    <span className="font-medium text-gray-700">{(basePrice * (option.surcharge / 100)).toLocaleString()} kr</span>
                  </div>
                );
              }
              return null;
            })}
            
            {formData.timePreference && selectedService.timePreferences && (() => {
              const selectedTimePref = selectedService.timePreferences.find(pref => 
                (pref.key || pref.label) === formData.timePreference
              );
              if (selectedTimePref && selectedTimePref.surcharge) {
                return (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">+ {selectedTimePref.label}</span>
                    <span className="font-medium text-gray-700">{(basePrice * (selectedTimePref.surcharge / 100)).toLocaleString()} kr</span>
                  </div>
                );
              }
              return null;
            })()}
            
            {formData.propertyType && selectedService.propertyTypeOptions && (() => {
              const selectedPropertyType = selectedService.propertyTypeOptions.find(type => 
                (type.key || type.label) === formData.propertyType
              );
              if (selectedPropertyType && selectedPropertyType.surcharge) {
                return (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">+ {selectedPropertyType.label}</span>
                    <span className="font-medium text-gray-700">{(basePrice * (selectedPropertyType.surcharge / 100)).toLocaleString()} kr</span>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Custom Fees - only show if there's service data */}
            {customFeesTotal > 0 && (
              <>
                <div className="pt-2 border-t border-gray-100">
                  {selectedService.customFees.map((fee, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {fee.label || 'Custom Fee'}
                        {fee.rutEligible === false && <span className="text-xs text-gray-400 ml-1">(ej RUT)</span>}
                      </span>
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
                Välj en tjänst för att se priset
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
            {hasServiceData ? (rutApplied ? finalPrice : originalPrice) : 0} kr
            {rutApplied && hasServiceData && <span className="text-xs text-gray-500 ml-1">*</span>}
          </span>
        </div>
        {rutApplied && hasServiceData && (
          <p className="text-xs text-gray-500 mt-1">
            *RUT-avdrag på {Math.round((config.rutPercentage || 0.5) * 100)}% applicerat
          </p>
        )}
      </div>
      
      {/* RUT Breakdown (if applicable) */}
      {rutApplied && selectedService && hasServiceData && (
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

  // Check if zip code validation is enabled
  const isZipCodeEnabled = config?.zipAreas && Array.isArray(config.zipAreas) && config.zipAreas.length > 0;
  
  // Get the actual services for this form (filtered by form config)
  const formServices = config?.services || services;
  
  console.log('🔍 BookingCalculator - isZipCodeEnabled:', isZipCodeEnabled);
  console.log('🔍 BookingCalculator - zipAreas:', config?.zipAreas);
  console.log('🔍 BookingCalculator - formServices:', formServices);
  console.log('🔍 BookingCalculator - all services:', services);

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
        console.log('🔍 Company config loaded:', companyData);
        console.log('🔍 RUT settings - rutEnabled:', companyData.rutEnabled);
        console.log('🔍 RUT settings - rutPercentage:', companyData.rutPercentage);
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
    const selectedService = formServices.find(s => s.id === formData.service);
    console.log('💰 Price calculation - selectedService:', selectedService);
    console.log('💰 Price calculation - formData:', formData);
    console.log('💰 Price calculation - custom fees:', selectedService?.customFees);
    
    if (selectedService) {
      let calculatedPrice = 0;
      
      // Calculate base price based on service pricing model
      if (selectedService.pricingModel === 'window') {
        // Window cleaning pricing
        const windowTypes = selectedService.windowTypes || [];
        let hasWindowSelection = false;
        windowTypes.forEach((windowType, index) => {
          const quantity = formData[`window_${index}`] || 0;
          calculatedPrice += quantity * (windowType.price || 0);
          if (quantity > 0) hasWindowSelection = true;
        });
        
        // Apply minimum price only if user has selected windows
        if (hasWindowSelection) {
          const minPrice = selectedService.minPrice || 700;
          calculatedPrice = Math.max(calculatedPrice, minPrice);
        }
      } else if (selectedService.pricingModel === 'universal') {
        // Universal rate per sqm
        const area = formData.area || 0;
        if (area > 0) {
          calculatedPrice = area * (selectedService.universalRate || 50);
          // Apply minimum price only if area is entered
          const minPrice = selectedService.minPrice || 1000;
          calculatedPrice = Math.max(calculatedPrice, minPrice);
        }
      } else if (selectedService.pricingModel === 'fixed-tier') {
        // Fixed tier pricing
        const area = formData.area || 0;
        if (area > 0) {
          const tier = selectedService.tiers?.find(t => 
            area >= t.min && area <= t.max
          );
          calculatedPrice = tier?.price || selectedService.minPrice || 1000;
        }
      } else if (selectedService.pricingModel === 'tiered-multiplier') {
        // Tiered multiplier pricing
        const area = formData.area || 0;
        if (area > 0) {
          const tier = selectedService.tiers?.find(t => 
            area >= t.min && area <= t.max
          );
          if (tier) {
            // For tiered multiplier, multiply area by the tier's multiplier rate
            calculatedPrice = area * (tier.multiplier || tier.price || 50);
          } else {
            calculatedPrice = selectedService.minPrice || 1000;
          }
        }
      } else if (selectedService.pricingModel === 'hourly') {
        // Hourly pricing
        const area = formData.area || 0;
        if (area > 0) {
          const hourlyTier = selectedService.hourlyTiers?.find(t => 
            area >= t.min && area <= t.max
          );
          const hours = hourlyTier?.hours || 3;
          calculatedPrice = hours * (selectedService.hourlyRate || 400);
        }
      } else if (selectedService.pricingModel === 'per-room') {
        // Per room pricing
        const roomTypes = selectedService.perRoomRates || [];
        let hasRoomSelection = false;
        roomTypes.forEach((roomType, index) => {
          const quantity = formData[`room_${index}`] || 0;
          calculatedPrice += quantity * (roomType.price || 0);
          if (quantity > 0) hasRoomSelection = true;
        });
        
        // Apply minimum price only if user has selected rooms
        if (hasRoomSelection) {
          const minPrice = selectedService.minPrice || 700;
          calculatedPrice = Math.max(calculatedPrice, minPrice);
        }
      } else {
        // Default pricing
        const area = formData.area || 0;
        if (area > 0) {
          calculatedPrice = area * (selectedService.pricePerSqm || 50);
        }
      }
      
      // Apply frequency multiplier if selected
      if (formData.frequency) {
        console.log('🔍 Frequency multiplier check (calculation):');
        console.log('  - formData.frequency:', formData.frequency);
        console.log('  - selectedService.frequencyMultipliers:', selectedService.frequencyMultipliers);
        console.log('  - config.frequencyMultipliers:', config.frequencyMultipliers);
        
        // Use service frequency multipliers first, fallback to company
        const frequencyMultipliers = selectedService.frequencyMultipliers || config.frequencyMultipliers;
        
        // Try multiple matching strategies
        let selectedFrequency = frequencyMultipliers.find(freq => 
          (freq.key || freq.label) === formData.frequency
        );
        
        // If not found, try case-insensitive matching
        if (!selectedFrequency) {
          selectedFrequency = frequencyMultipliers.find(freq => 
            (freq.key || freq.label)?.toLowerCase() === formData.frequency?.toLowerCase()
          );
        }
        
        // If still not found, try partial matching
        if (!selectedFrequency) {
          selectedFrequency = frequencyMultipliers.find(freq => 
            (freq.key || freq.label)?.toLowerCase().includes(formData.frequency?.toLowerCase()) ||
            formData.frequency?.toLowerCase().includes((freq.key || freq.label)?.toLowerCase())
          );
        }
        
        console.log('  - selectedFrequency:', selectedFrequency);
        console.log('  - selectedFrequency?.multiplier:', selectedFrequency?.multiplier);
        
        if (selectedFrequency && selectedFrequency.multiplier && selectedFrequency.multiplier !== 1) {
          console.log('  - Applying frequency multiplier:', selectedFrequency.multiplier);
          console.log('  - Calculated price before frequency:', calculatedPrice);
          calculatedPrice = Math.round(calculatedPrice * selectedFrequency.multiplier);
          console.log('  - Calculated price after frequency:', calculatedPrice);
          console.log('💰 Price calculation - frequency applied:', selectedFrequency.label, 'multiplier:', selectedFrequency.multiplier);
        } else {
          console.log('  - No frequency multiplier applied (multiplier is 1 or not found)');
        }
      } else {
        console.log('🔍 No frequency selected or no frequencyMultipliers configured (calculation)');
      }
      
      // Apply pet surcharge if selected
      if (formData.hasPets && selectedService.petSurcharge !== false) {
        const petSurcharge = selectedService.petSurchargePercentage || 10; // Default 10%
        console.log('🐕 Applying pet surcharge (calculation):', petSurcharge + '%');
        console.log('  - Calculated price before pet surcharge:', calculatedPrice);
        calculatedPrice = Math.round(calculatedPrice * (1 + petSurcharge / 100));
        console.log('  - Calculated price after pet surcharge:', calculatedPrice);
      }
      
      // Apply accessibility surcharges
      if (selectedService.accessibilityOptions && selectedService.accessibilityOptions.length > 0) {
        selectedService.accessibilityOptions.forEach((option, index) => {
          if (formData[`accessibility_${index}`] && option.surcharge) {
            console.log('♿ Applying accessibility surcharge (calculation):', option.label, option.surcharge + '%');
            console.log('  - Calculated price before accessibility surcharge:', calculatedPrice);
            calculatedPrice = Math.round(calculatedPrice * (1 + option.surcharge / 100));
            console.log('  - Calculated price after accessibility surcharge:', calculatedPrice);
          }
        });
      }
      
      // Apply time preference surcharge
      if (formData.timePreference && selectedService.timePreferences) {
        const selectedTimePref = selectedService.timePreferences.find(pref => 
          (pref.key || pref.label) === formData.timePreference
        );
        if (selectedTimePref && selectedTimePref.surcharge) {
          console.log('⏰ Applying time preference surcharge (calculation):', selectedTimePref.label, selectedTimePref.surcharge + '%');
          console.log('  - Calculated price before time surcharge:', calculatedPrice);
          calculatedPrice = Math.round(calculatedPrice * (1 + selectedTimePref.surcharge / 100));
          console.log('  - Calculated price after time surcharge:', calculatedPrice);
        }
      }
      
      // Apply property type surcharge
      if (formData.propertyType && selectedService.propertyTypeOptions) {
        const selectedPropertyType = selectedService.propertyTypeOptions.find(type => 
          (type.key || type.label) === formData.propertyType
        );
        if (selectedPropertyType && selectedPropertyType.surcharge) {
          console.log('🏠 Applying property type surcharge (calculation):', selectedPropertyType.label, selectedPropertyType.surcharge + '%');
          console.log('  - Calculated price before property surcharge:', calculatedPrice);
          calculatedPrice = Math.round(calculatedPrice * (1 + selectedPropertyType.surcharge / 100));
          console.log('  - Calculated price after property surcharge:', calculatedPrice);
        }
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
      let rutEligibleFees = 0;
      let nonRutEligibleFees = 0;
      
      // Only add custom fees if there's actual service data
      const hasServiceData = (selectedService.pricingModel === 'window' && 
        selectedService.windowTypes?.some((_, index) => (formData[`window_${index}`] || 0) > 0)) ||
        (selectedService.pricingModel === 'per-room' && 
        selectedService.perRoomRates?.some((_, index) => (formData[`room_${index}`] || 0) > 0)) ||
        (selectedService.pricingModel !== 'window' && selectedService.pricingModel !== 'per-room' && formData.area && formData.area > 0);
      
      if (hasServiceData && selectedService.customFees && Array.isArray(selectedService.customFees)) {
        selectedService.customFees.forEach(fee => {
          const feeAmount = fee.amount || 0;
          customFeesPrice += feeAmount;
          
          // Check if this fee is RUT eligible
          if (fee.rutEligible !== false) {
            rutEligibleFees += feeAmount;
          } else {
            nonRutEligibleFees += feeAmount;
          }
        });
      }
      
      const totalPrice = calculatedPrice + addOnsPrice + customFeesPrice;
      
      console.log('💰 Price calculation - hasServiceData:', hasServiceData);
      console.log('💰 Price calculation - base price:', calculatedPrice);
      console.log('💰 Price calculation - add-ons price:', addOnsPrice);
      console.log('💰 Price calculation - custom fees price:', customFeesPrice);
      console.log('💰 Price calculation - RUT eligible fees:', rutEligibleFees);
      console.log('💰 Price calculation - non-RUT eligible fees:', nonRutEligibleFees);
      console.log('💰 Price calculation - total price:', totalPrice);
      
      setOriginalPrice(totalPrice);

      // Apply RUT discount if eligible and there's actual service data
      if (selectedService.rutEligible && config.rutEnabled && totalPrice > 0 && hasServiceData) {
        // Calculate RUT only on eligible portions
        const rutEligibleTotal = calculatedPrice + addOnsPrice + rutEligibleFees;
        const rutPercentage = config.rutPercentage || 0.5; // Default to 50% if not set
        const rutDiscount = rutEligibleTotal * rutPercentage;
        const finalPrice = rutEligibleTotal - rutDiscount + nonRutEligibleFees;
        
        console.log('💰 RUT calculation - rutEligibleTotal:', rutEligibleTotal);
        console.log('💰 RUT calculation - rutPercentage:', rutPercentage);
        console.log('💰 RUT calculation - rutDiscount:', rutDiscount);
        console.log('💰 RUT calculation - nonRutEligibleFees:', nonRutEligibleFees);
        console.log('💰 RUT calculation - finalPrice:', finalPrice);
        
        setFinalPrice(finalPrice);
        setRutApplied(true);
      } else {
        console.log('💰 RUT not applied - rutEligible:', selectedService.rutEligible);
        console.log('💰 RUT not applied - rutEnabled:', config.rutEnabled);
        console.log('💰 RUT not applied - totalPrice:', totalPrice);
        console.log('💰 RUT not applied - hasServiceData:', hasServiceData);
        setFinalPrice(totalPrice);
        setRutApplied(false);
      }
    } else {
      setOriginalPrice(0);
      setFinalPrice(0);
      setRutApplied(false);
    }
  }, [formData, formServices, config]);

  if (loading) return <div>Laddar...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!config) return <div>Ingen konfiguration hittades.</div>;

  return (
    <div className="w-full">
      {/* Step 1: Zip Code - Clean, integrated form like Hemfrid */}
      {step === 1 && (
        <div className="text-center py-12">
          <div className="inline-block max-w-md w-full">
            <div className="bg-transparent rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Hur kan vi hjälpa dig?
              </h2>
              <p className="text-gray-600 mb-6">
                Ange ditt postnummer för att se tillgängliga tjänster
              </p>
              {isZipCodeEnabled ? (
                <ZipCodeStep
                  onNext={() => setStep(2)}
                  formData={formData}
                  setFormData={setFormData}
                  allowedZipCodes={config.zipAreas || []}
                  error={zipError}
                  setError={setZipError}
                />
              ) : (
                <ServiceSelectStep
                  onNext={() => setStep(2)}
                  formData={formData}
                  setFormData={setFormData}
                  config={{ ...config, services: formServices }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Service Selection - Centered like Step 1 */}
      {step === 2 && (
        <div className="text-center py-12">
          <div className="inline-block max-w-md w-full">
            <div className="bg-transparent rounded-lg p-8">
              <ServiceSelectStep
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
                formData={formData}
                setFormData={setFormData}
                config={{ ...config, services: formServices }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Steps 3-4: Full-screen layout for iframe embedding */}
      {step >= 3 && (
        <div className="w-full h-screen min-h-screen">
          <div className="flex h-full min-h-screen">
            {/* Left Column - Main Form */}
            <div className="flex-1 p-8 overflow-y-auto">
              {step === 3 && (
                <ServiceDetailsStep
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                  formData={formData}
                  setFormData={setFormData}
                  config={{ ...config, services: formServices }}
                />
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
            
            {/* Right Column - Fixed Summary Panel */}
            <div className="w-96 flex-shrink-0 p-6 bg-gray-50">
              <div className="sticky top-4">
                <PriceCard
                  originalPrice={originalPrice}
                  finalPrice={finalPrice}
                  rutApplied={rutApplied}
                  selectedService={formServices.find(s => s.id === formData.service)}
                  formData={formData}
                  step={step}
                  config={config}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

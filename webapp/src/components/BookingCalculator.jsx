import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAnalytics, logEvent } from "firebase/analytics";
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
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Import our enhanced engines
import { PricingEngine, PRICING_MODELS, PricingUtils } from '../utils/pricingEngine';
import { ValidationEngine, FIELD_TYPES, ValidationUtils } from '../utils/validationEngine';
import { PricingRulesEngine, RULE_TYPES, RuleUtils } from '../utils/pricingRulesEngine';

// Placeholder step components
const ZipCodeStep = ({ onNext, formData, setFormData, allowedZipCodes, error, setError }) => (
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
    <button
      className="bg-pink-400 text-white px-4 py-2 rounded"
      disabled={!formData.zip || formData.zip.length !== 5}
      onClick={() => {
        if (allowedZipCodes.includes(formData.zip)) {
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
  // Area input and add-ons (placeholder for now)
  const addOns = (config.addOns && typeof config.addOns === 'object' && config.addOns[service]) ? config.addOns[service] : [];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Steg 3: Tjänstedetaljer & tillval</h2>
      {service && (
        <>
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
                {addOns.map(addOn => (
                  <label key={addOn} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formData[`addon_${addOn}`]}
                      onChange={e => setFormData(f => ({ ...f, [`addon_${addOn}`]: e.target.checked }))}
                    />
                    {addOn}
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      )}
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

    if (paymentConfig.mode === 'manual') {
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
          {processing ? <Spinner/> : (paymentConfig.mode === 'manual' ? 'Skicka bokning' : 'Gå till betalning')}
        </Button>
      </div>
      {paymentConfig.mode === 'manual' && paymentConfig.instructions && (
        <Alert color="info" className="mt-4">
          <p className="font-semibold">Betalningsinstruktioner:</p>
          <p>{paymentConfig.instructions}</p>
        </Alert>
      )}
    </form>
  );
};

const PriceCard = ({ originalPrice, finalPrice, rutApplied }) => (
  <div className="sticky top-4 bg-white shadow rounded p-4 min-w-[260px]">
    <h3 className="font-bold text-lg mb-2">Prisöversikt</h3>
    {rutApplied ? (
      <div>
        <p className="line-through text-gray-500">Originalpris: {originalPrice} kr</p>
        <p className="text-green-600 font-semibold">RUT-avdrag: -{originalPrice - finalPrice} kr</p>
        <p className="text-xl font-bold mt-2">Att betala: {finalPrice} kr</p>
      </div>
    ) : (
      <p className="text-xl font-bold">Total: {finalPrice} kr</p>
    )}
  </div>
);

export default function BookingCalculator() {
  const { companyId } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [config, setConfig] = useState(null);
  const [services, setServices] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zipError, setZipError] = useState('');
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [rutApplied, setRutApplied] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      // ... fetch company and payment config ...
    }
    fetchConfig();
  }, [companyId]);

  useEffect(() => {
    const selectedService = services.find(s => s.id === formData.service);
    if (formData.area && selectedService && selectedService.servicesData) {
        const serviceData = selectedService.servicesData;
        const basePrice = serviceData.basePrice || 500;
        const pricePerSqM = serviceData.pricePerSqM || 20;
        const calculatedPrice = basePrice + formData.area * pricePerSqM;
        setOriginalPrice(calculatedPrice);

        if (selectedService.rutEligible) {
          setFinalPrice(calculatedPrice * 0.5);
          setRutApplied(true);
        } else {
          setFinalPrice(calculatedPrice);
          setRutApplied(false);
        }
    }
  }, [formData, services]);

  if (loading) return <div>Laddar...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!config) return <div>Ingen konfiguration hittades.</div>;

  return (
    <div className="flex gap-8">
      <div className="flex-1">
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
        {/* ... other steps ... */}
      </div>
      <div className="w-80">
        <PriceCard originalPrice={originalPrice} finalPrice={finalPrice} rutApplied={rutApplied} />
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
              <option key={svc} value={svc}>{svc}</option>
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

const CustomerInfoStep = ({ onBack, formData, setFormData }) => {
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    // Basic validation
    const requiredFields = ['customerName', 'customerPhone', 'customerEmail', 'customerAddress', 'customerDate', 'customerTime'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError('Vänligen fyll i alla obligatoriska fält.');
        return;
      }
    }
    setError('');
    // For now, just log the data
    console.log('Booking submission:', formData);
    alert('Bokningsdata skickad! (Se konsolen för detaljer)');
    // Here you would send to Firestore or backend
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Steg 4: Kundinformation</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Namn *</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={formData.customerName || ''}
          onChange={e => setFormData(f => ({ ...f, customerName: e.target.value }))}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Telefon *</label>
        <input
          type="tel"
          className="border p-2 rounded w-full"
          value={formData.customerPhone || ''}
          onChange={e => setFormData(f => ({ ...f, customerPhone: e.target.value }))}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">E-post *</label>
        <input
          type="email"
          className="border p-2 rounded w-full"
          value={formData.customerEmail || ''}
          onChange={e => setFormData(f => ({ ...f, customerEmail: e.target.value }))}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Adress *</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={formData.customerAddress || ''}
          onChange={e => setFormData(f => ({ ...f, customerAddress: e.target.value }))}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Datum *</label>
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={formData.customerDate || ''}
          onChange={e => setFormData(f => ({ ...f, customerDate: e.target.value }))}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tid *</label>
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
        </select>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="flex gap-2">
        <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onBack}>Tillbaka</button>
        <button type="submit" className="bg-pink-400 text-white px-4 py-2 rounded">Skicka</button>
      </div>
    </form>
  );
};

const PriceCard = ({ formData }) => (
  <div className="sticky top-4 bg-white shadow rounded p-4 min-w-[260px]">
    <h3 className="font-bold text-lg mb-2">Prisöversikt</h3>
    {/* Placeholder for price calculation and summary */}
    <div>[Pris och sammanfattning]</div>
  </div>
);

export default function BookingCalculator() {
  const { companyId } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zipError, setZipError] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError('');
      try {
          const ref = doc(db, 'companies', companyId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
          setConfig(snap.data());
        } else {
          setError('Företagsdata kunde inte hämtas.');
        }
      } catch (err) {
        setError('Fel vid hämtning av företagsdata.');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [companyId]);

  if (loading) return <div>Laddar...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!config) return <div>Ingen konfiguration hittades.</div>;

  // Universal VAT setting (applies to all pricing models)
  const vatRate = config.vatRate || 25;

  // Allowed zip codes (example, could be from config)
  const allowedZipCodes = config.allowedZipCodes || ['12345', '23456', '34567'];

  return (
    <div className="flex gap-8">
      <div className="flex-1">
            {step === 1 && (
          <ZipCodeStep
            onNext={() => setStep(2)}
                formData={formData}
            setFormData={setFormData}
            allowedZipCodes={allowedZipCodes}
            error={zipError}
            setError={setZipError}
          />
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
          <ServiceDetailsStep
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
                formData={formData}
            setFormData={setFormData}
                config={config}
              />
            )}
            {step === 4 && (
              <CustomerInfoStep
            onBack={() => setStep(3)}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        <div className="mt-6">
          <div className="font-bold">Moms (VAT): {vatRate}%</div>
        </div>
      </div>
      <div className="w-80">
        <PriceCard formData={formData} />
      </div>
    </div>
  );
} 
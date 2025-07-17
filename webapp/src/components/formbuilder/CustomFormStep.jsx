import React, { useState, useMemo } from 'react';
import { TextInput, Checkbox, Button, Modal, Label, Select, Spinner } from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Allowed booking times
const allowedTimes = ['08:00', '13:00'];

// Default GDPR links
const DEFAULT_PRIVACY = 'https://swedprime.com/privacy';
const DEFAULT_TERMS = 'https://swedprime.com/terms';

export default function CustomFormStep({ config, onNext }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    personalNumber: '',
    date: '',
    time: '',
    rut: false,
    gdpr: false,
    gdprModal: false,
    privacyLink: DEFAULT_PRIVACY,
    termsLink: DEFAULT_TERMS,
    frequency: false,
    serviceId: '',
    // Add more as needed
  });
  const [submitting, setSubmitting] = useState(false);

  // Dynamic fields for selected service
  const selectedService = (config.services || []).find(s => s.id === form.serviceId);

  // Example: fetch add-ons, custom fees, etc. from selectedService
  const addOns = selectedService?.addOns || [];
  const customFees = selectedService?.customFees || [];
  const basePrice = selectedService?.basePrice || 0;

  // Price calculation
  const price = useMemo(() => {
    let total = basePrice;
    addOns.forEach(a => { if (a.selected) total += a.price; });
    customFees.forEach(f => { total += f.amount; });
    if (form.rut) total = total * 0.5;
    return Math.round(total);
  }, [basePrice, addOns, customFees, form.rut]);

  // Handle field changes
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  // Validate personal number (YYYYMMDD-XXXX)
  const isPersonalNumberValid = form.personalNumber.match(/^[0-9]{8}-[0-9]{4}$/);

  // Save config to Firestore (stub)
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: Save to Firestore
      toast.success(t('Booking form saved!'));
      onNext();
    } catch (e) {
      toast.error(t('Failed to save. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('Custom Booking Form')}</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <TextInput
          label={t('Name')}
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          aria-label={t('Name')}
          required
        />
        <TextInput
          label={t('Email')}
          value={form.email}
          onChange={e => handleChange('email', e.target.value)}
          aria-label={t('Email')}
          type="email"
          required
        />
        <TextInput
          label={t('Phone')}
          value={form.phone}
          onChange={e => handleChange('phone', e.target.value)}
          aria-label={t('Phone')}
          required
        />
        <TextInput
          label={t('Address')}
          value={form.address}
          onChange={e => handleChange('address', e.target.value)}
          aria-label={t('Address')}
        />
        <TextInput
          label={t('Personal Number')}
          value={form.personalNumber}
          onChange={e => handleChange('personalNumber', e.target.value)}
          aria-label={t('Personal Number')}
          required
          color={form.personalNumber && !isPersonalNumberValid ? 'failure' : undefined}
          helperText={form.personalNumber && !isPersonalNumberValid ? t('Format: YYYYMMDD-XXXX') : ''}
        />
        <div className="flex gap-4">
          <TextInput
            label={t('Date')}
            type="date"
            value={form.date}
            onChange={e => handleChange('date', e.target.value)}
            aria-label={t('Date')}
            required
          />
          <Select
            label={t('Time')}
            value={form.time}
            onChange={e => handleChange('time', e.target.value)}
            aria-label={t('Time')}
            required
          >
            <option value="">{t('Select time')}</option>
            {allowedTimes.map(time => <option key={time} value={time}>{time}</option>)}
          </Select>
        </div>
        <Checkbox
          checked={form.rut}
          onChange={e => handleChange('rut', e.target.checked)}
          label={t('Enable RUT Deduction')}
          aria-label={t('Enable RUT Deduction')}
        />
        <Checkbox
          checked={form.frequency}
          onChange={e => handleChange('frequency', e.target.checked)}
          label={t('Recurring Booking (if supported)')}
          aria-label={t('Recurring Booking')}
        />
        <Select
          label={t('Service')}
          value={form.serviceId}
          onChange={e => handleChange('serviceId', e.target.value)}
          aria-label={t('Service')}
          required
        >
          <option value="">{t('Select service')}</option>
          {(config.services || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        {/* Dynamic fields for selected service (e.g., window types, area, add-ons) */}
        {/* ... Add dynamic fields here based on selectedService ... */}
        <Checkbox
          checked={form.gdpr}
          onChange={e => handleChange('gdpr', e.target.checked)}
          label={t('I consent to GDPR and accept the privacy policy and terms.')}
          aria-label={t('GDPR Consent')}
          required
        />
        <div className="flex gap-4">
          <a href={form.privacyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{t('Privacy Policy')}</a>
          <a href={form.termsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{t('Terms & Conditions')}</a>
        </div>
        <div
          className="p-4 rounded bg-green-50 border border-green-200 text-green-800 text-lg font-bold text-center"
        >
          {t('Total Price')}: {price} SEK
        </div>
        <Button type="submit" color="primary" disabled={submitting || !form.gdpr} aria-label={t('Save Booking Form')}>
          {submitting ? <Spinner size="sm" /> : t('Save Booking Form')}
        </Button>
      </form>
      <Modal show={form.gdprModal} onClose={() => setForm(f => ({ ...f, gdprModal: false }))}>
        <Modal.Header>{t('GDPR Consent Required')}</Modal.Header>
        <Modal.Body>
          <p>{t('You must consent to GDPR and accept the privacy policy and terms to proceed.')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setForm(f => ({ ...f, gdprModal: false }))}>{t('Close')}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 
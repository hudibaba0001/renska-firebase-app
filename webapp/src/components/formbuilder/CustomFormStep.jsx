import React, { useState, useMemo } from 'react';
import { TextInput, Checkbox, Button, Modal, Label, Select, Spinner, Textarea } from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Allowed booking times
const allowedTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

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
    zipCode: '',
    area: '',
    addOns: {},
    windowCleaning: false,
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
    addOns.forEach(a => { if (form.addOns[a.id]) total += a.price; });
    customFees.forEach(f => { total += f.amount; });
    if (form.rut) total = total * 0.5;
    return Math.round(total);
  }, [basePrice, addOns, customFees, form.rut, form.addOns]);

  // Handle field changes
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  // Validate personal number (YYYYMMDD-XXXX)
  const isPersonalNumberValid = form.personalNumber.match(/^[0-9]{8}-[0-9]{4}$/);

  // Render field based on field type
  const renderField = (fieldId) => {
    const fieldLabel = config.fieldLabels?.[fieldId] || fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const fieldHelp = config.fieldHelp?.[fieldId] || '';

    switch (fieldId) {
      case 'zipCode':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            value={form.zipCode}
            onChange={e => handleChange('zipCode', e.target.value)}
            placeholder="Enter ZIP code"
            required
            helperText={fieldHelp}
          />
        );

      case 'serviceSelector':
        return (
          <Select
            key={fieldId}
            label={fieldLabel}
            value={form.serviceId}
            onChange={e => handleChange('serviceId', e.target.value)}
            required
            helperText={fieldHelp}
          >
            <option value="">Select a service</option>
            {(config.services || []).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        );

      case 'area':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            value={form.area}
            onChange={e => handleChange('area', e.target.value)}
            placeholder="Enter area in sqm"
            type="number"
            required
            helperText={fieldHelp}
          />
        );

      case 'frequency':
        return (
          <Select
            key={fieldId}
            label={fieldLabel}
            value={form.frequency}
            onChange={e => handleChange('frequency', e.target.value)}
            required
            helperText={fieldHelp}
          >
            <option value="">Select frequency</option>
            <option value="once">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        );

      case 'addOns':
        return selectedService && addOns.length > 0 ? (
          <div key={fieldId} className="space-y-3">
            <Label>{fieldLabel}</Label>
            {addOns.map(addon => (
              <Checkbox
                key={addon.id}
                checked={form.addOns[addon.id] || false}
                onChange={e => handleChange('addOns', { ...form.addOns, [addon.id]: e.target.checked })}
                label={`${addon.name} (+${addon.price} kr)`}
              />
            ))}
            {fieldHelp && <p className="text-sm text-gray-500">{fieldHelp}</p>}
          </div>
        ) : null;

      case 'windowCleaning':
        return (
          <Checkbox
            key={fieldId}
            checked={form.windowCleaning}
            onChange={e => handleChange('windowCleaning', e.target.checked)}
            label={fieldLabel}
            helperText={fieldHelp}
          />
        );

      case 'rutToggle':
        return config.rutEnabled ? (
          <Checkbox
            key={fieldId}
            checked={form.rut}
            onChange={e => handleChange('rut', e.target.checked)}
            label={fieldLabel || `Enable RUT Deduction (${Math.round((config.rutPercentage || 0.5) * 100)}%)`}
            helperText={fieldHelp}
          />
        ) : null;

      case 'name':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            required
            helperText={fieldHelp}
          />
        );

      case 'email':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            type="email"
            required
            helperText={fieldHelp}
          />
        );

      case 'phone':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
            required
            helperText={fieldHelp}
          />
        );

      case 'address':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            value={form.address}
            onChange={e => handleChange('address', e.target.value)}
            helperText={fieldHelp}
          />
        );

      case 'personalNumber':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            value={form.personalNumber}
            onChange={e => handleChange('personalNumber', e.target.value)}
            required
            color={form.personalNumber && !isPersonalNumberValid ? 'failure' : undefined}
            helperText={form.personalNumber && !isPersonalNumberValid ? 'Format: YYYYMMDD-XXXX' : fieldHelp}
          />
        );

      case 'date':
        return (
          <TextInput
            key={fieldId}
            label={fieldLabel}
            type="date"
            value={form.date}
            onChange={e => handleChange('date', e.target.value)}
            required
            helperText={fieldHelp}
          />
        );

      case 'time':
        return (
          <Select
            key={fieldId}
            label={fieldLabel}
            value={form.time}
            onChange={e => handleChange('time', e.target.value)}
            required
            helperText={fieldHelp}
          >
            <option value="">Select time</option>
            {allowedTimes.map(time => <option key={time} value={time}>{time}</option>)}
          </Select>
        );

      default:
        return null;
    }
  };

  // Save config to Firestore (stub)
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: Save to Firestore
      toast.success(t('Booking form saved!'));
      onNext();
    } catch {
      toast.error(t('Failed to save. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('Custom Booking Form Preview')}</h2>
      <p className="text-gray-600 mb-6">This is how your booking form will appear to customers.</p>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Render fields based on fieldOrder */}
        {(config.fieldOrder || []).map(fieldId => renderField(fieldId))}
        
        {/* GDPR Consent */}
        <Checkbox
          checked={form.gdpr}
          onChange={e => handleChange('gdpr', e.target.checked)}
          label={t('I consent to GDPR and accept the privacy policy and terms.')}
          required
        />
        
        <div className="flex gap-4">
          <a href={form.privacyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{t('Privacy Policy')}</a>
          <a href={form.termsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{t('Terms & Conditions')}</a>
        </div>
        
        {/* Price Display */}
        {selectedService && (
          <div className="p-4 rounded bg-green-50 border border-green-200 text-green-800 text-lg font-bold text-center">
            {t('Total Price')}: {price} SEK
          </div>
        )}
        
        <Button type="submit" color="primary" disabled={submitting || !form.gdpr}>
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
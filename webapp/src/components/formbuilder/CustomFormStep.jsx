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
    timeSlots: '',
    rut: false,
    gdpr: false,
    gdprModal: false,
    privacyLink: DEFAULT_PRIVACY,
    termsLink: DEFAULT_TERMS,
    frequency: false,
    serviceId: '',
    zipCode: '',
    checkboxes: {},
    radioSelections: {},
    dropdownSelections: {},
    // Add more as needed
  });
  const [submitting, setSubmitting] = useState(false);

  // Dynamic fields for selected service
  const selectedService = (config.services || []).find(s => s.id === form.serviceId);

  // Price calculation
  const price = useMemo(() => {
    let total = selectedService?.basePrice || 0;
    if (form.rut) total = total * 0.5;
    return Math.round(total);
  }, [selectedService?.basePrice, form.rut]);

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
    const placeholder = config.fieldPlaceholders?.[fieldId] || '';

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

      case 'radio':
        return (
          <div key={fieldId} className="space-y-3">
            <Label>{fieldLabel}</Label>
            <div className="space-y-2">
              {(config.fieldRadioOptions?.[fieldId] || ['Alternativ 1', 'Alternativ 2']).map((option, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`radio-${fieldId}`}
                    checked={form.radioSelections?.[fieldId] === index}
                    onChange={() => {
                      const newRadioSelections = { ...form.radioSelections, [fieldId]: index };
                      handleChange('radioSelections', newRadioSelections);
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {fieldHelp && <p className="text-sm text-gray-500">{fieldHelp}</p>}
          </div>
        );

      case 'dropdown':
        return (
          <div key={fieldId} className="space-y-3">
            <Label>{fieldLabel}</Label>
            <Select
              value={form.dropdownSelections?.[fieldId] || ''}
              onChange={e => {
                const newDropdownSelections = { ...form.dropdownSelections, [fieldId]: e.target.value };
                handleChange('dropdownSelections', newDropdownSelections);
              }}
              required
            >
              <option value="">{placeholder || '-- Välj --'}</option>
              {(config.fieldDropdownOptions?.[fieldId] || ['Alternativ 1', 'Alternativ 2']).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Select>
            {fieldHelp && <p className="text-sm text-gray-500">{fieldHelp}</p>}
          </div>
        );

      case 'gdprConsent':
        return (
          <div key={fieldId} className="space-y-3">
            <Checkbox
              checked={form.gdpr}
              onChange={e => handleChange('gdpr', e.target.checked)}
              label={
                <span 
                  dangerouslySetInnerHTML={{
                    __html: (config.fieldGdprText?.[fieldId] || 'Jag godkänner integritetspolicy och villkor')
                      .replace('[privacy]', `<a href="${config.fieldPrivacyPolicyUrl?.[fieldId] || '#'}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">integritetspolicy</a>`)
                      .replace('[terms]', `<a href="${config.fieldTermsUrl?.[fieldId] || '#'}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">villkor</a>`)
                  }}
                />
              }
              required
            />
            {fieldHelp && <p className="text-sm text-gray-500">{fieldHelp}</p>}
          </div>
        );

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

      case 'checkbox':
        return (
          <div key={fieldId} className="space-y-3">
            <Label>{fieldLabel}</Label>
            {(config.fieldCheckboxOptions?.[fieldId] || ['Jag godkänner villkoren']).map((option, index) => (
              <Checkbox
                key={index}
                checked={form.checkboxes?.[index] || false}
                onChange={e => {
                  const newCheckboxes = { ...form.checkboxes, [index]: e.target.checked };
                  handleChange('checkboxes', newCheckboxes);
                }}
                label={option}
              />
            ))}
            {fieldHelp && <p className="text-sm text-gray-500">{fieldHelp}</p>}
          </div>
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

      case 'timeSlots':
        return (
          <div key={fieldId} className="space-y-3">
            <Label>{fieldLabel}</Label>
            <div className="space-y-2">
              {(config.timeSlots || ['08:00', '13:00']).map(time => (
                <Checkbox
                  key={time}
                  checked={form.timeSlots === time}
                  onChange={e => handleChange('timeSlots', e.target.checked ? time : '')}
                  label={time}
                />
              ))}
            </div>
            {fieldHelp && <p className="text-sm text-gray-500">{fieldHelp}</p>}
          </div>
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
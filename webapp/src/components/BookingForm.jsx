// webapp/src/components/BookingForm.jsx

import React, { useState, useMemo } from 'react';
import { createBooking } from '../services/firestore';
import { 
  Card, Button, TextInput, Select, Label, Checkbox, Badge, Alert, Spinner, Progress
} from 'flowbite-react';
import { 
  HomeIcon, CurrencyDollarIcon, CalendarDaysIcon, PlusIcon, SparklesIcon,
  MapPinIcon, UserIcon, EnvelopeIcon, PhoneIcon, CheckCircleIcon,
  ExclamationTriangleIcon, StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function BookingForm({ config = {} }) {
  const availableServices = config.services?.length > 0 ? config.services : [{ id: 'default', name: 'Default Service', pricePerSqm: 10 }];
  const [selectedService, setSelectedService] = useState(availableServices[0]?.id || '');
  const [sqm, setSqm] = useState(50);
  // ... other form states
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    useRut: false 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [gdprConsent, setGdprConsent] = useState(false);

  // Get company name for display
  const companyName = config.name || config.companyName || 'Company';

  // Price calculation logic
  const currentService = availableServices.find(s => s.id === selectedService) || availableServices[0];
  const totalPrice = useMemo(() => {
    let total = (currentService?.pricePerSqm || 10) * sqm;
    
    // Apply RUT discount if eligible
    if (config.rutEnabled && customerInfo.useRut && currentService?.rutEligible) {
      const rutDiscount = total * (config.rutPercentage || 0.3); // Default 30% if not specified
      total -= rutDiscount;
    }
    
    return Math.round(total);
  }, [currentService, sqm, config, customerInfo.useRut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      const bookingData = {
        serviceId: selectedService,
        sqm,
        customerInfo,
        companyId: config.id || config.companyId || 'unknown',
        totalPrice,
        createdAt: new Date(),
        status: 'pending'
      };
      await createBooking(bookingData);
      setSubmitMessage('Booking submitted successfully!');
      toast.success('Booking submitted successfully!');
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

  const isFormValid = selectedService && sqm > 0 && customerInfo.name && customerInfo.email && gdprConsent;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">New Booking for {companyName}</h2>
          <Badge color="primary">Step {currentStep} of 3</Badge>
        </div>
        <Progress progress={(currentStep / 3) * 100} />
      </Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <div>
            <Card>
              <h3 className="text-xl font-bold">1. Select Your Service</h3>
              <div>
                <Label htmlFor="service" value="Service Type" />
                <Select id="service" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                  {availableServices.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="sqm" value="Square Meters" />
                <TextInput id="sqm" type="number" value={sqm} onChange={(e) => setSqm(Number(e.target.value))} />
              </div>
              <Button onClick={() => setCurrentStep(2)} disabled={!selectedService || !sqm}>Next</Button>
            </Card>
          </div>
        )}
        {currentStep === 2 && (
          <div>
            <Card>
              <h3 className="text-xl font-bold">2. Add-ons & Options</h3>
              <p>Add-on UI would go here...</p>
              {config.rutEnabled && (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="rut-eligible"
                      checked={customerInfo.useRut}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, useRut: e.target.checked }))}
                    />
                    <Label htmlFor="rut-eligible" className="flex items-center gap-1">
                      <span>RUT Eligible</span>
                      <span className="text-xs text-gray-500">(30% tax deduction)</span>
                    </Label>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <Button color="gray" onClick={() => setCurrentStep(1)}>Previous</Button>
                <Button onClick={() => setCurrentStep(3)}>Next</Button>
              </div>
            </Card>
          </div>
        )}
        {currentStep === 3 && (
          <div>
            <Card>
              <h3 className="text-xl font-bold">3. Your Information</h3>
              <div>
                <Label htmlFor="name" value="Full Name" />
                <TextInput id="name" type="text" value={customerInfo.name} onChange={(e) => setCustomerInfo(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="email" value="Email Address" />
                <TextInput id="email" type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <Checkbox id="gdpr-consent" checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)} required />
                <Label htmlFor="gdpr-consent"> I consent to the GDPR terms.</Label>
              </div>
              <div className="flex justify-between">
                <Button color="gray" onClick={() => setCurrentStep(2)}>Previous</Button>
                <Button type="submit" disabled={!isFormValid || isSubmitting}>
                  {isSubmitting ? <Spinner /> : 'Complete Booking'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </form>
      {submitMessage && (
        <Alert color={submitMessage.includes('success') ? 'success' : 'failure'}>{submitMessage}</Alert>
      )}
    </div>
  );
}

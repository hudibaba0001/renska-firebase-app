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
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [gdprConsent, setGdprConsent] = useState(false);

  // Price calculation logic
  const currentService = availableServices.find(s => s.id === selectedService) || availableServices[0];
  const totalPrice = useMemo(() => {
    let total = (currentService?.pricePerSqm || 10) * sqm;
    return Math.round(total);
  }, [currentService, sqm, config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      const bookingData = {
        serviceId: selectedService,
        sqm,
        customerInfo,
        companyId: config.slug || 'unknown',
        totalPrice,
      };
      await createBooking(config.id || config.companyId, bookingData);
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
          <h2 className="text-2xl font-bold">Book Your Service</h2>
          <Badge color="primary">Step {currentStep} of 3</Badge>
        </div>
        <Progress progress={(currentStep / 3) * 100} />
      </Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <h3 className="text-xl font-bold">2. Add-ons & Options</h3>
              <p>Add-on UI would go here...</p>
              <div className="flex justify-between">
                <Button color="gray" onClick={() => setCurrentStep(1)}>Previous</Button>
                <Button onClick={() => setCurrentStep(3)}>Next</Button>
              </div>
            </Card>
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          </motion.div>
        )}
      </form>
      {submitMessage && (
        <Alert color={submitMessage.includes('success') ? 'success' : 'failure'}>{submitMessage}</Alert>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { createBooking } from '../../services/bookingService';
import { CalculatorProvider } from '../../context/calculatorContext';
import StepRenderer from './StepRenderer';
import PriceCard from './PriceCard';
import ProgressBar from './ProgressBar';
import { getTotalSteps } from './calculatorSteps';

const BookingCalculator = ({ config: propConfig, companyId: propCompanyId, isEmbedded = false }) => {
  const { companyId: paramCompanyId } = useParams();
  const companyId = propCompanyId || paramCompanyId;
  
  const [config, setConfig] = useState(propConfig);
  const [loading, setLoading] = useState(!propConfig);
  const [error, setError] = useState('');
  
  // Fetch company configuration if not provided
  useEffect(() => {
    if (propConfig) {
      setConfig(propConfig);
      setLoading(false);
      return;
    }
    
    const fetchConfig = async () => {
      try {
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (!companyDoc.exists()) {
          throw new Error('Company not found');
        }
        
        const companyData = companyDoc.data();
        setConfig({
          name: companyData.name,
          services: companyData.services || [],
          zipAreas: companyData.zipAreas || [],
          rutEnabled: companyData.rutEnabled || false,
          rutPercentage: companyData.rutPercentage || 0.3,
          paymentConfig: companyData.paymentConfig || { mode: 'manual' }
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company config:', err);
        setError('Could not load calculator configuration');
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [propConfig, companyId]);
  
  const handleSubmit = async (formData) => {
    try {
      // Create booking data structure
      const bookingData = {
        ...formData,
        companyId,
        status: 'pending',
        createdAt: new Date(),
      };
      
      // Create booking
      const bookingData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        personnummer: formData.personnummer,
        useRut: formData.useRut,
        
        serviceId: formData.serviceId,
        serviceName: config.services.find(s => s.id === formData.serviceId)?.name,
        
        originalPrice: formData.originalPrice,
        finalPrice: formData.finalPrice,
        rutDiscount: formData.useRut ? (formData.originalPrice - formData.finalPrice) : 0,
        
        area: formData.area,
        rooms: formData.rooms,
        frequency: formData.frequency,
        zipCode: formData.zipCode,
        addOns: formData.addOns,
        timePreference: formData.timePreference,
        specialInstructions: formData.specialInstructions,
        
        date: formData.date,
        time: formData.time
      };
      
      await createBooking(companyId, bookingData);
      
      // Handle payment based on configuration
      if (config.paymentConfig.mode === 'manual') {
        // Create booking directly
        const bookingRef = await addDoc(
          collection(db, `companies/${companyId}/bookings`),
          bookingData
        );
        toast.success('Bokning skickad! Vi kontaktar dig för betalning.');
        return bookingRef.id;
      } else {
        // Redirect to payment
        const functions = getFunctions();
        const createPaymentIntent = httpsCallable(functions, 'createBookingPaymentIntent');
        const result = await createPaymentIntent({
          companyId,
          bookingData,
          successUrl: `${window.location.origin}/booking/${companyId}/success`,
          cancelUrl: window.location.href
        });
        window.location.href = result.data.sessionUrl;
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      toast.error('Kunde inte slutföra bokningen. Försök igen.');
      throw err;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <CalculatorProvider>
      <div className="max-w-3xl mx-auto">
        <ProgressBar steps={getTotalSteps()} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main form area */}
          <div className="md:col-span-2">
            <StepRenderer
              config={config}
              onSubmit={handleSubmit}
            />
          </div>
          
          {/* Price card */}
          <div className="md:col-span-1">
            <PriceCard config={config} />
          </div>
        </div>
      </div>
    </CalculatorProvider>
  );
};

export default BookingCalculator;
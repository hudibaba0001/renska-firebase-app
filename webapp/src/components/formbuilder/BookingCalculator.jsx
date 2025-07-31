import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { createBooking } from '../../services/bookingService';
import { createLeadFromBooking } from '../../crm/services/bookingLeadService';
import { toast } from 'react-hot-toast';
import { useSubmit } from '../../hooks/useSubmit';
import LoadingOverlay from '../ui/LoadingOverlay';
import { CalculatorProvider } from '../../context/calculatorContext';
import StepRenderer from './StepRenderer';
import PriceCard from './PriceCard';
import ProgressBar from './ProgressBar';
import { getTotalSteps } from './calculatorSteps';
import ResumeBanner from './ResumeBanner';
import { loadFormState, clearFormState } from '../../utils/storage';

const BookingCalculator = ({ config: propConfig, companyId: propCompanyId, isEmbedded = false }) => {
  const { companyId: paramCompanyId } = useParams();
  const companyId = propCompanyId || paramCompanyId;
  
  const [config, setConfig] = useState(propConfig);
  const [loading, setLoading] = useState(!propConfig);
  const [error, setError] = useState('');
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [savedState, setSavedState] = useState(null);
  
  // Check for saved state
  useEffect(() => {
    if (!companyId) return;

    const saved = loadFormState(companyId);
    if (saved) {
      setSavedState(saved);
      setShowResumeBanner(true);
    }
  }, [companyId]);

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
  
  // Handle form submission
  const { 
    submit: handleSubmit,
    isSubmitting,
    error: submitError,
    fieldErrors
  } = useSubmit(async (formData) => {
    // Prepare booking data
    const bookingData = {
      // Customer information
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      personnummer: formData.personnummer,
      useRut: formData.useRut,
      
      // Service details
      serviceId: formData.serviceId,
      serviceName: config.services.find(s => s.id === formData.serviceId)?.name,
      area: formData.area,
      rooms: formData.rooms,
      frequency: formData.frequency,
      
      // Add-ons and customization
      addOns: formData.addOns,
      windowTypes: formData.windowTypes,
      customFees: formData.customFees,
      
      // Pricing
      originalPrice: formData.originalPrice,
      finalPrice: formData.finalPrice,
      rutDiscount: formData.useRut ? (formData.originalPrice - formData.finalPrice) : 0,
      
      // Scheduling
      date: formData.date,
      time: formData.time,
      specialInstructions: formData.specialInstructions,
      
      // Metadata
      zipCode: formData.zipCode,
      calculatorVersion: '2.0',
      submittedAt: new Date().toISOString()
    };
    
    // Create lead and follow-up task in CRM
    const { lead, task } = await createLeadFromBooking(companyId, bookingData);
    
    // Create booking record
    const booking = await createBooking(companyId, {
      ...bookingData,
      leadId: lead.id,
      status: 'pending',
      createdAt: new Date()
    });
    
    return { lead, task, booking };
  }, {
    successMessage: 'Booking submitted! We will contact you shortly.',
    errorMessage: 'Could not submit booking. Please try again.',
    resetOnSuccess: true
  });
      
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
  
  const handleResume = () => {
    setShowResumeBanner(false);
  };

  const handleDecline = () => {
    if (companyId) {
      clearFormState(companyId);
    }
    setSavedState(null);
    setShowResumeBanner(false);
  };

  return (
    <CalculatorProvider companyId={companyId} initialState={savedState}>
      <div className="max-w-3xl mx-auto relative">
        {showResumeBanner && (
          <ResumeBanner
            onResume={handleResume}
            onDecline={handleDecline}
          />
        )
        {/* Loading overlay */}
        <LoadingOverlay 
          isLoading={isSubmitting} 
          message="Submitting your booking..." 
        />
        
        {/* Error message */}
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{submitError}</p>
          </div>
        )}
        
        <ProgressBar steps={getTotalSteps()} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main form area */}
          <div className="md:col-span-2">
            <StepRenderer
              config={config}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              fieldErrors={fieldErrors}
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
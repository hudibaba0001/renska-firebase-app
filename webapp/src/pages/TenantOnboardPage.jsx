import { useState } from 'react';
import { Card, Button, TextInput, Label, Select, Alert, Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/init';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';
import { BuildingOfficeIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline';
import { 
  validateTextInput, 
  validateEmail, 
  validateSlug, 
  sanitizeObject, 
  checkRateLimit,
  validateNumber
} from '../utils/security';

export default function TenantOnboardPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    plan: 'basic',
    trialDays: 14,
    contactName: '',
    contactEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugError, setSlugError] = useState('');
  const navigate = useNavigate();

  function handleNext() { 
    if (validateCurrentStep()) {
      setStep(s => Math.min(3, s + 1)); 
    }
  }
  
  function handleBack() { 
    setStep(s => Math.max(1, s - 1)); 
  }
  
  function handleChange(e) {
    const { id, value } = e.target;
    
    // Sanitize input to prevent XSS
    const sanitizedValue = validateTextInput(value, id === 'name' || id === 'contactName' ? 100 : 
                                            id === 'contactEmail' ? 254 : 
                                            id === 'slug' ? 50 : 1000);
    
    setForm(f => ({ ...f, [id]: sanitizedValue }));
    
    if (id === 'name') {
      // auto-generate slug from sanitized input
      const autoSlug = sanitizedValue
        .toLowerCase()
        .replace(/[åä]/g, 'a')
        .replace(/[ö]/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug: autoSlug }));
      setSlugError('');
    }
    
    if (id === 'slug') {
      setSlugError('');
    }
  }

  function validateCurrentStep() {
    // Check rate limiting for form submission attempts
    if (!checkRateLimit('form_validation', 10, 60000)) {
      toast.error('Too many validation attempts. Please wait a minute.');
      return false;
    }

    if (step === 1) {
      if (!form.name.trim()) {
        toast.error('Company name is required');
        return false;
      }
      if (!form.slug.trim()) {
        toast.error('URL slug is required');
        return false;
      }
      if (!validateSlug(form.slug)) {
        toast.error('URL slug must be 2-50 characters with lowercase letters, numbers, and hyphens only');
        return false;
      }
      return true;
    }
    
    if (step === 2) {
      if (!form.plan) {
        toast.error('Please select a subscription plan');
        return false;
      }
      if (!validateNumber(form.trialDays, 0, 90)) {
        toast.error('Trial period must be between 0 and 90 days');
        return false;
      }
      return true;
    }
    
    if (step === 3) {
      if (!form.contactName.trim()) {
        toast.error('Contact name is required');
        return false;
      }
      if (!form.contactEmail.trim()) {
        toast.error('Contact email is required');
        return false;
      }
      if (!validateEmail(form.contactEmail)) {
        toast.error('Please enter a valid email address');
        return false;
      }
      return true;
    }
    
    return true;
  }

  async function checkSlugAvailability() {
    if (!form.slug.trim()) return;
    
    try {
      const q = query(collection(db, 'companies'), where('slug', '==', form.slug.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setSlugError('This URL slug is already taken. Please choose another.');
        return false;
      } else {
        setSlugError('');
        return true;
      }
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return true; // Allow to proceed if check fails
    }
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // Final slug availability check
      const slugAvailable = await checkSlugAvailability();
      if (!slugAvailable) {
        setIsSubmitting(false);
        return;
      }

      // Create tenant document with sanitized data
      const rawDocData = {
        name: form.name.trim(),
        companyName: form.name.trim(),
        slug: form.slug.trim(),
        subscription: {
          plan: form.plan,
          trialDays: parseInt(form.trialDays),
          status: 'trial',
          active: true
        },
        billing: {
          contactName: form.contactName.trim(),
          contactEmail: form.contactEmail.trim()
        },
        createdAt: serverTimestamp(),
        settings: {
          emailNotifications: true,
          bookingConfirmation: true,
          rutPercentage: 50,
          isPublic: false // Secure: Require authentication to read by default
        }
      };
      
      // Sanitize all string inputs to prevent injection attacks
      const docData = sanitizeObject(rawDocData);
      
      const docRef = await addDoc(collection(db, 'companies'), docData);
      console.log('✅ Tenant created with ID:', docRef.id);

      toast.success(`🎉 Tenant "${form.name}" created successfully!`);
      navigate(`/super-admin/tenants`);
    } catch (error) {
      console.error('Error creating tenant:', error);
      
      let errorMessage = 'Failed to create tenant. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure you have super admin privileges.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 bg-background min-h-screen font-mono">
      <PageHeader 
        title="Onboard New Tenant" 
        subtitle="Create a new company account with 3 simple steps"
        backLink="/super-admin/tenants" 
      />
      
      <Card className="max-w-4xl mx-auto">
        {/* Custom Steps Navigation */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === 1 ? 'bg-brand border-brand text-white' : 
                step > 1 ? 'bg-green-500 border-green-500 text-white' : 
                'border-gray-300 text-gray-500'
              }`}>
                {step > 1 ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <BuildingOfficeIcon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step === 1 ? 'text-brand' : step > 1 ? 'text-green-600' : 'text-gray-500'}`}>
                  Step 1
                </p>
                <p className={`text-xs ${step === 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Basic Info
                </p>
              </div>
            </div>

            {/* Connector */}
            <div className={`flex-1 h-0.5 mx-4 ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === 2 ? 'bg-brand border-brand text-white' : 
                step > 2 ? 'bg-green-500 border-green-500 text-white' : 
                'border-gray-300 text-gray-500'
              }`}>
                {step > 2 ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <CreditCardIcon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step === 2 ? 'text-brand' : step > 2 ? 'text-green-600' : 'text-gray-500'}`}>
                  Step 2
                </p>
                <p className={`text-xs ${step === 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Plan & Trial
                </p>
              </div>
            </div>

            {/* Connector */}
            <div className={`flex-1 h-0.5 mx-4 ${step > 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === 3 ? 'bg-brand border-brand text-white' : 
                'border-gray-300 text-gray-500'
              }`}>
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step === 3 ? 'text-brand' : 'text-gray-500'}`}>
                  Step 3
                </p>
                <p className={`text-xs ${step === 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Billing Contact
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
                <p className="text-gray-600">Enter the basic details for the new tenant</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="name" value="Company Name *" className="font-mono font-medium" />
                  <TextInput 
                    id="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="Acme Cleaning AB" 
                    required 
                    className="mt-2 font-mono"
                    sizing="lg"
                    aria-describedby="name-help"
                  />
                  <p id="name-help" className="text-sm text-gray-500 mt-1 font-mono">
                    Full legal company name
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="slug" value="URL Slug *" className="font-mono font-medium" />
                  <TextInput 
                    id="slug" 
                    value={form.slug} 
                    onChange={handleChange} 
                    onBlur={checkSlugAvailability}
                    placeholder="acme-cleaning" 
                    required 
                    className="mt-2 font-mono"
                    sizing="lg"
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens allowed"
                    aria-describedby="slug-help"
                    color={slugError ? 'failure' : 'gray'}
                  />
                  {slugError ? (
                    <Alert color="failure" className="mt-2">
                      {slugError}
                    </Alert>
                  ) : (
                    <div id="slug-help" className="text-sm text-gray-500 mt-1 font-mono">
                      This will be used in URLs: /booking/<strong>{form.slug || 'your-slug'}</strong>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNext} 
                  className="font-mono"
                  size="lg"
                  disabled={!form.name.trim() || !form.slug.trim() || !!slugError}
                >
                  Next: Plan & Trial →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Plan</h2>
                <p className="text-gray-600">Choose the plan and trial period for this tenant</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="plan" value="Subscription Plan *" className="font-mono font-medium" />
                  <Select 
                    id="plan" 
                    value={form.plan} 
                    onChange={handleChange}
                    className="mt-2 font-mono"
                    sizing="lg"
                    aria-describedby="plan-help"
                  >
                    <option value="basic">Basic - 199 SEK/month</option>
                    <option value="standard">Standard - 399 SEK/month</option>
                    <option value="premium">Premium - 699 SEK/month</option>
                  </Select>
                  <p id="plan-help" className="text-sm text-gray-500 mt-1 font-mono">
                    The tenant can upgrade or downgrade later
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="trialDays" value="Trial Period (days) *" className="font-mono font-medium" />
                  <TextInput 
                    id="trialDays" 
                    type="number" 
                    min="0"
                    max="90"
                    value={form.trialDays} 
                    onChange={handleChange} 
                    required 
                    className="mt-2 font-mono"
                    sizing="lg"
                    aria-describedby="trial-help"
                  />
                  <p id="trial-help" className="text-sm text-gray-500 mt-1 font-mono">
                    Free trial period before billing starts (0-90 days)
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  color="light" 
                  onClick={handleBack}
                  className="font-mono"
                  size="lg"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={handleNext}
                  className="font-mono"
                  size="lg"
                  disabled={!form.plan || form.trialDays < 0}
                >
                  Next: Billing Contact →
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing Contact</h2>
                <p className="text-gray-600">Who should we contact for billing and administrative matters?</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="contactName" value="Billing Contact Name *" className="font-mono font-medium" />
                  <TextInput 
                    id="contactName" 
                    value={form.contactName} 
                    onChange={handleChange} 
                    placeholder="John Doe"
                    required 
                    className="mt-2 font-mono"
                    sizing="lg"
                    aria-describedby="contact-name-help"
                  />
                  <p id="contact-name-help" className="text-sm text-gray-500 mt-1 font-mono">
                    Primary contact person for this account
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="contactEmail" value="Billing Contact Email *" className="font-mono font-medium" />
                  <TextInput 
                    id="contactEmail" 
                    type="email" 
                    value={form.contactEmail} 
                    onChange={handleChange} 
                    placeholder="john@acme-cleaning.com"
                    required 
                    className="mt-2 font-mono"
                    sizing="lg"
                    aria-describedby="contact-email-help"
                  />
                  <p id="contact-email-help" className="text-sm text-gray-500 mt-1 font-mono">
                    Email for invoices and important notifications
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="max-w-md mx-auto mt-8">
                <Card>
                  <h3 className="font-bold text-gray-900 font-mono mb-4">Review & Confirm</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{form.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">URL Slug:</span>
                      <span className="font-medium">{form.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium capitalize">{form.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial:</span>
                      <span className="font-medium">{form.trialDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{form.contactName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{form.contactEmail}</span>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  color="light" 
                  onClick={handleBack}
                  className="font-mono"
                  size="lg"
                  disabled={isSubmitting}
                >
                  ← Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="font-mono"
                  size="lg"
                  disabled={isSubmitting || !form.contactName.trim() || !form.contactEmail.trim()}
                  gradientMonochrome="teal"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Creating Tenant...
                    </>
                  ) : (
                    '🚀 Create Tenant'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 
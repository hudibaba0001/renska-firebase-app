// webapp/src/pages/TenantOnboardPage.jsx

import { useState } from 'react';
import { Card, Button, TextInput, Label, Select, Alert, Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
// Import the centralized function for creating tenants from our new service layer.
// All other direct Firestore imports are no longer needed here.
import { createTenant } from '../services/firestore'; 
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';
import { BuildingOfficeIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline';
import { 
  validateTextInput, 
  validateEmail, 
  validateSlug, 
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
  // This state is now used to display any error from the service layer, not just slug errors.
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  function handleNext() { 
    if (validateCurrentStep()) {
      setFormError(''); // Clear previous errors
      setStep(s => Math.min(3, s + 1)); 
    }
  }
  
  function handleBack() { 
    setStep(s => Math.max(1, s - 1)); 
  }
  
  function handleChange(e) {
    const { id, value } = e.target;
    
    // Input validation remains in the component to provide immediate user feedback.
    const sanitizedValue = validateTextInput(value, 100);
    
    setForm(f => ({ ...f, [id]: sanitizedValue }));
    
    // Auto-generate the slug from the company name.
    if (id === 'name') {
      const autoSlug = sanitizedValue
        .toLowerCase()
        .replace(/[åä]/g, 'a')
        .replace(/[ö]/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug: autoSlug }));
      setFormError(''); // Clear errors when the user is correcting them.
    }
    
    // Clear slug-specific errors when the user manually changes the slug.
    if (id === 'slug') {
      setFormError('');
    }
  }

  // This function validates the inputs for the current step of the form.
  function validateCurrentStep() {
    if (!checkRateLimit('form_validation', 10, 60000)) {
      toast.error('Too many validation attempts. Please wait a minute.');
      return false;
    }

    if (step === 1) {
      if (!form.name.trim()) { toast.error('Company name is required'); return false; }
      if (!form.slug.trim()) { toast.error('URL slug is required'); return false; }
      if (!validateSlug(form.slug)) { toast.error('URL slug must be 2-50 characters with lowercase letters, numbers, and hyphens only'); return false; }
    }
    
    if (step === 2) {
      if (!form.plan) { toast.error('Please select a subscription plan'); return false; }
      if (!validateNumber(form.trialDays, 0, 90)) { toast.error('Trial period must be between 0 and 90 days'); return false; }
    }
    
    if (step === 3) {
      if (!form.contactName.trim()) { toast.error('Contact name is required'); return false; }
      if (!form.contactEmail.trim()) { toast.error('Contact email is required'); return false; }
      if (!validateEmail(form.contactEmail)) { toast.error('Please enter a valid email address'); return false; }
    }
    
    return true;
  }

  // The slug availability check is no longer needed here, as it's now handled
  // by the `createTenant` function in the firestore.js service. This simplifies the component greatly.

  /**
   * Handles the final submission of the form.
   * This function now delegates the entire creation process to the `createTenant` service function.
   * This makes the component's code cleaner and focused only on UI state management.
   */
  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Call the centralized `createTenant` function from the service layer,
      // passing the entire form state. The service now handles all the complex logic
      // of validation, sanitization, and database interaction.
      const newTenantId = await createTenant(form);

      console.log('✅ Tenant created with ID:', newTenantId);
      toast.success(`🎉 Tenant "${form.name}" created successfully!`);
      navigate(`/super-admin/tenants`);

    } catch (error) {
      // The catch block now handles errors thrown from our service function.
      // This allows us to display specific, user-friendly messages.
      console.error('Error creating tenant:', error);
      
      // We check for the specific error code we defined in our service for slug conflicts.
      if (error.code === 'slug-not-available') {
        setFormError(error.message); // Display the slug error message in the form.
        setStep(1); // Take the user back to the step with the slug field.
      } else {
        // For all other errors, display a generic toast notification.
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      // This ensures the submitting state is reset regardless of success or failure.
      setIsSubmitting(false);
    }
  }

  // The JSX for rendering the form remains largely the same.
  // The 'Alert' component now uses the generic 'formError' state.
  return (
    <div className="p-6 bg-background min-h-screen font-mono">
      <PageHeader 
        title="Onboard New Tenant" 
        subtitle="Create a new company account with 3 simple steps"
        backLink="/super-admin/tenants" 
      />
      
      <Card className="max-w-4xl mx-auto">
        {/* Stepper Navigation */}
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
                {/* Step 1 */}
                <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step === 1 ? 'bg-brand border-brand text-white' : 
                        step > 1 ? 'bg-green-500 border-green-500 text-white' : 
                        'border-gray-300 text-gray-500'
                    }`}>
                        {step > 1 ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <BuildingOfficeIcon className="w-5 h-5" />}
                    </div>
                    <div className="ml-3"><p className={`text-base font-medium ${step === 1 ? 'text-brand' : step > 1 ? 'text-green-600' : 'text-text-subtle'}`}>Step 1</p><p className={`text-base ${step === 1 ? 'text-text-heading' : 'text-text-subtle'}`}>Basic Info</p></div>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                {/* Step 2 */}
                <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step === 2 ? 'bg-brand border-brand text-white' : 
                        step > 2 ? 'bg-green-500 border-green-500 text-white' : 
                        'border-gray-300 text-gray-500'
                    }`}>
                        {step > 2 ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <CreditCardIcon className="w-5 h-5" />}
                    </div>
                    <div className="ml-3"><p className={`text-base font-medium ${step === 2 ? 'text-brand' : step > 2 ? 'text-green-600' : 'text-text-subtle'}`}>Step 2</p><p className={`text-base ${step === 2 ? 'text-text-heading' : 'text-text-subtle'}`}>Plan & Trial</p></div>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step > 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                {/* Step 3 */}
                <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${ step === 3 ? 'bg-brand border-brand text-white' : 'border-gray-300 text-gray-500' }`}>
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="ml-3"><p className={`text-base font-medium ${step === 3 ? 'text-brand' : 'text-text-subtle'}`}>Step 3</p><p className={`text-base ${step === 3 ? 'text-text-heading' : 'text-text-subtle'}`}>Billing Contact</p></div>
                </div>
            </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6"><h2 className="text-2xl font-bold text-text-heading dark:text-white">Company Information</h2><p className="text-base text-text-main dark:text-white">Enter the basic details for the new tenant</p></div>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="name" value="Company Name *" className="font-mono font-medium" />
                  <TextInput id="name" value={form.name} onChange={handleChange} placeholder="Acme Cleaning AB" required className="mt-2 font-mono" sizing="lg" />
                </div>
                <div>
                  <Label htmlFor="slug" value="URL Slug *" className="font-mono font-medium" />
                  <TextInput id="slug" value={form.slug} onChange={handleChange} placeholder="acme-cleaning" required className="mt-2 font-mono" sizing="lg" color={formError ? 'failure' : 'gray'}/>
                  {formError ? (
                    <Alert color="failure" className="mt-2">{formError}</Alert>
                  ) : (
                    <div className="text-base text-text-subtle mt-1 font-mono">/booking/<strong>{form.slug || 'your-slug'}</strong></div>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4"><Button onClick={handleNext} className="font-mono" size="lg" disabled={!form.name.trim() || !form.slug.trim() || !!formError}>Next: Plan & Trial →</Button></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6"><h2 className="text-2xl font-bold text-text-heading dark:text-white">Subscription Plan</h2><p className="text-base text-text-main dark:text-white">Choose the plan and trial period for this tenant</p></div>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="plan" value="Subscription Plan *" className="font-mono font-medium" />
                  <Select id="plan" value={form.plan} onChange={handleChange} className="mt-2 font-mono" sizing="lg">
                    <option value="basic">Basic - 199 SEK/month</option>
                    <option value="standard">Standard - 399 SEK/month</option>
                    <option value="premium">Premium - 699 SEK/month</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trialDays" value="Trial Period (days) *" className="font-mono font-medium" />
                  <TextInput id="trialDays" type="number" min="0" max="90" value={form.trialDays} onChange={handleChange} required className="mt-2 font-mono" sizing="lg"/>
                </div>
              </div>
              <div className="flex justify-between pt-4"><Button color="light" onClick={handleBack} className="font-mono" size="lg">← Back</Button><Button onClick={handleNext} className="font-mono" size="lg" disabled={!form.plan || form.trialDays < 0}>Next: Billing Contact →</Button></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6"><h2 className="text-2xl font-bold text-text-heading dark:text-white">Billing Contact</h2><p className="text-base text-text-main dark:text-white">Who should we contact for billing and administrative matters?</p></div>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="contactName" value="Billing Contact Name *" className="font-mono font-medium" />
                  <TextInput id="contactName" value={form.contactName} onChange={handleChange} placeholder="John Doe" required className="mt-2 font-mono" sizing="lg"/>
                </div>
                <div>
                  <Label htmlFor="contactEmail" value="Billing Contact Email *" className="font-mono font-medium" />
                  <TextInput id="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="john@acme-cleaning.com" required className="mt-2 font-mono" sizing="lg"/>
                </div>
              </div>
              <div className="max-w-md mx-auto mt-8">
                <Card>
                  <h3 className="font-bold text-text-heading font-mono mb-4">Review & Confirm</h3>
                  <div className="space-y-2 text-base font-mono">
                    <div className="flex justify-between"><span className="text-text-subtle">Company:</span><span className="font-medium">{form.name}</span></div>
                    <div className="flex justify-between"><span className="text-text-subtle">URL Slug:</span><span className="font-medium">{form.slug}</span></div>
                    <div className="flex justify-between"><span className="text-text-subtle">Plan:</span><span className="font-medium capitalize">{form.plan}</span></div>
                    <div className="flex justify-between"><span className="text-text-subtle">Trial:</span><span className="font-medium">{form.trialDays} days</span></div>
                    <div className="flex justify-between"><span className="text-text-subtle">Contact:</span><span className="font-medium">{form.contactName}</span></div>
                    <div className="flex justify-between"><span className="text-text-subtle">Email:</span><span className="font-medium">{form.contactEmail}</span></div>
                  </div>
                </Card>
              </div>
              <div className="flex justify-between pt-4">
                <Button color="light" onClick={handleBack} className="font-mono" size="lg" disabled={isSubmitting}>← Back</Button>
                <Button onClick={handleSubmit} className="font-mono" size="lg" disabled={isSubmitting || !form.contactName.trim() || !form.contactEmail.trim()} gradientMonochrome="teal">
                  {isSubmitting ? (<><Spinner size="sm" className="mr-2" />Creating Tenant...</>) : ('🚀 Create Tenant')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
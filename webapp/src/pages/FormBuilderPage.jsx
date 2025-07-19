import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getTenant, getAllServicesForCompany } from '../services/firestore';

// Step Components
import CreateCalculatorStep from '../components/formbuilder/CreateCalculatorStep';
import FieldOrderingStep from '../components/formbuilder/FieldOrderingStep';
import CustomFormStep from '../components/formbuilder/CustomFormStep';
// import FormBuilderDragDrop from '../components/formbuilder/FormBuilderDragDrop';
import ServiceSelectionStep from '../components/formbuilder/ServiceSelectionStep';
import ZipCodeValidationStep from '../components/formbuilder/ZipCodeValidationStep';

// Dynamically build steps based on config
function getSteps(config) {
  const steps = [
    { id: 1, title: 'Form Details', component: CreateCalculatorStep }
  ];
  
  if (config.zipAreas && config.zipAreas.length > 0) {
    steps.push({ id: 2, title: 'ZIP Code Validation', component: ZipCodeValidationStep });
  }
  
  steps.push({ id: 3, title: 'Service Selection', component: ServiceSelectionStep });
  steps.push({ id: 4, title: 'Custom Form Builder', component: FieldOrderingStep });
  steps.push({ id: 5, title: 'Preview & Test', component: CustomFormStep });
  
  return steps;
}

export default function FormBuilderPage() {
  const { companyId, formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Add detailed debugging for formId
  console.log('🔍 FormBuilderPage - Initial params:', { companyId, formId });
  console.log('🔍 FormBuilderPage - formId type:', typeof formId);
  console.log('🔍 FormBuilderPage - formId === "new":', formId === 'new');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    // Basic Info
    name: '',
    slug: '',
    description: '',
    
    // Services with pricing models
    services: [],
    
    // Global Options
    frequencyMultipliers: [],
    addOns: {},
    windowCleaning: {},
    zipAreas: [],
    rutSettings: {
      enabled: false,
      discountPercent: 50,
      annualCap: 50000
    },
    
    // Field Ordering & Customization
    fieldOrder: [
      'name',
      'email',
      'phone'
    ],
    fieldLabels: {},
    fieldHelp: {},
    
    // Meta
    status: 'draft', // draft | published
    createdAt: null,
    updatedAt: null,
    createdBy: null
  });

  // Load existing config if editing
  useEffect(() => {
    console.log('🔍 FormBuilderPage - useEffect triggered:', { formId, companyId });
    if (formId && formId !== 'new') {
      console.log('🔍 FormBuilderPage - Loading existing config for formId:', formId);
      loadExistingConfig();
    } else {
      console.log('🔍 FormBuilderPage - Creating new form (formId is "new" or falsy)');
    }
  }, [formId, companyId]);

  useEffect(() => {
    async function fetchCompanyData() {
      if (!companyId) return;
      setLoading(true);
      try {
        // Fetch company config and services
        const [companyConfig, services] = await Promise.all([
          getTenant(companyId),
          getAllServicesForCompany(companyId)
        ]);
        setConfig(prev => ({
          ...prev,
          zipAreas: (companyConfig && companyConfig.zipAreas) ? companyConfig.zipAreas : prev.zipAreas,
          services: services.length > 0 ? services : prev.services
        }));
      } catch (error) {
        console.error('Error fetching company config/services:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyData();
    // eslint-disable-next-line
  }, [companyId]);

  const loadExistingConfig = async () => {
    setLoading(true);
    try {
      console.log('🔧 Loading form config for:', { companyId, formId });
      console.log('🔧 Firestore path: companies/' + companyId + '/calculators/' + formId);
      
      const docRef = doc(db, 'companies', companyId, 'calculators', formId);
      const docSnap = await getDoc(docRef);
      
      console.log('🔧 Document exists:', docSnap.exists());
      console.log('🔧 Document ID:', docSnap.id);
      
      if (docSnap.exists()) {
        const formData = docSnap.data();
        console.log('🔧 Loaded existing form data:', formData);
        
        // Merge with default config, preserving existing data
        setConfig(prevConfig => {
          const mergedConfig = {
            ...prevConfig,
            ...formData,
            // Ensure these arrays are properly initialized
            services: formData.services || prevConfig.services || [],
            fieldOrder: formData.fieldOrder || prevConfig.fieldOrder || ['name', 'email', 'phone'],
            fieldLabels: formData.fieldLabels || prevConfig.fieldLabels || {},
            fieldHelp: formData.fieldHelp || prevConfig.fieldHelp || {},
            zipAreas: formData.zipAreas || prevConfig.zipAreas || []
          };
          console.log('🔧 Merged config:', mergedConfig);
          return mergedConfig;
        });
      } else {
        console.error('❌ Form not found in Firestore:', { companyId, formId });
        console.error('❌ Document path: companies/' + companyId + '/calculators/' + formId);
        
        // Let's check what calculators exist for this company
        const calculatorsRef = collection(db, 'companies', companyId, 'calculators');
        const calculatorsSnapshot = await getDocs(calculatorsRef);
        const existingCalculators = calculatorsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug
        }));
        console.log('🔧 Existing calculators for this company:', existingCalculators);
        
        // If form doesn't exist, redirect to new form
        navigate(`/admin/${companyId}/forms/new`, { replace: true });
      }
    } catch (error) {
      console.error('❌ Error loading config:', error);
      // If there's an error, redirect to new form
      navigate(`/admin/${companyId}/forms/new`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      console.log('💾 Saving draft for:', { companyId, formId, config });
      
      // Use the existing formId if editing, or generate a new one for new forms
      const targetFormId = formId === 'new' ? config.slug : formId;
      const docRef = doc(db, 'companies', companyId, 'calculators', targetFormId);
      const now = new Date();
      
      const updatedConfig = {
        ...config,
        updatedAt: now,
        ...(formId === 'new' && {
          createdAt: now,
          createdBy: user?.uid
        })
      };
      
      console.log('💾 Saving config to:', targetFormId);
      await setDoc(docRef, updatedConfig, { merge: true });
      setConfig(updatedConfig);
      
      // Update URL if this is a new form
      if (formId === 'new') {
        const newUrl = `/admin/${companyId}/forms/${config.slug}`;
        console.log('🔄 Updating URL to:', newUrl);
        navigate(newUrl, { replace: true });
      }
      
      console.log('✅ Draft saved successfully');
    } catch (error) {
      console.error('❌ Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const publishForm = async () => {
    setSaving(true);
    try {
      console.log('🚀 Publishing form for:', { companyId, formId, config });
      
      // Use the existing formId if editing, or generate a new one for new forms
      const targetFormId = formId === 'new' ? config.slug : formId;
      const docRef = doc(db, 'companies', companyId, 'calculators', targetFormId);
      const now = new Date();
      
      const publishedConfig = {
        ...config,
        status: 'published',
        publishedAt: now,
        updatedAt: now,
        ...(formId === 'new' && {
          createdAt: now,
          createdBy: user?.uid
        })
      };
      
      console.log('🚀 Publishing config to:', targetFormId);
      await setDoc(docRef, publishedConfig);
      setConfig(publishedConfig);
      
      // Update URL if this is a new form
      if (formId === 'new') {
        const newUrl = `/admin/${companyId}/forms/${config.slug}`;
        console.log('🔄 Updating URL to:', newUrl);
        navigate(newUrl, { replace: true });
      }
      
      console.log('✅ Form published successfully');
    } catch (error) {
      console.error('❌ Error publishing form:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Dynamically get steps based on config
  const STEPS = getSteps(config);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading form builder...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Current form config:', {
    name: config.name,
    slug: config.slug,
    formId,
    companyId,
    currentStep,
    totalSteps: STEPS.length,
    fieldOrder: config.fieldOrder,
    services: config.services?.length
  });

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-heading dark:text-white">
              {config.name || 'New Form Builder'}
            </h1>
            <p className="text-sm text-text-main dark:text-white">
              {config.description || 'Create a custom booking calculator'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={saveDraft}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-md text-text-main hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            
            {currentStep === STEPS.length && (
              <button
                onClick={publishForm}
                disabled={saving || config.status === 'published'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {config.status === 'published' ? 'Published' : 'Publish'}
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <nav className="flex space-x-8 px-6">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(idx + 1)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  idx + 1 === currentStep
                    ? 'border-blue-500 text-blue-600'
                    : idx + 1 < currentStep
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-text-subtle hover:text-text-main'
                }`}
              >
                <span className="flex items-center">
                  <span className={`mr-2 w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                    idx + 1 === currentStep
                      ? 'bg-blue-100 text-blue-600'
                      : idx + 1 < currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-text-subtle'
                  }`}>
                    {idx + 1 < currentStep ? '✓' : idx + 1}
                  </span>
                  {step.title}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Step Content */}
      <div>
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Debug Info</h3>
          <p className="text-sm text-yellow-700">
            Current Step: {currentStep} of {STEPS.length} - {STEPS[currentStep - 1]?.title}
          </p>
          <div className="mt-2 space-x-2">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(idx + 1)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {idx + 1}: {step.title}
              </button>
            ))}
          </div>
        </div>

        {CurrentStepComponent && (
          <CurrentStepComponent
            config={config}
            updateConfig={updateConfig}
            onNext={nextStep}
            onPrev={prevStep}
            companyId={companyId}
            isLastStep={currentStep === STEPS.length}
          />
        )}
      </div>
    </div>
  );
} 
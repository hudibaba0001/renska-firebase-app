import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

// Step Components
import CreateCalculatorStep from '../components/formbuilder/CreateCalculatorStep';
import DefineServicesStep from '../components/formbuilder/DefineServicesStep';
import GlobalOptionsStep from '../components/formbuilder/GlobalOptionsStep';
import FieldOrderingStep from '../components/formbuilder/FieldOrderingStep';
import PreviewTestStep from '../components/formbuilder/PreviewTestStep';

const STEPS = [
  { id: 1, title: 'Create Calculator', component: CreateCalculatorStep },
  { id: 2, title: 'Define Services', component: DefineServicesStep },
  { id: 3, title: 'Global Options', component: GlobalOptionsStep },
  { id: 4, title: 'Field Ordering', component: FieldOrderingStep },
  { id: 5, title: 'Preview & Test', component: PreviewTestStep }
];

export default function FormBuilderPage() {
  const { companyId, formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
      'zipCode',
      'serviceSelector',
      'area',
      'frequency',
      'addOns',
      'windowCleaning',
      'rutToggle'
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
    if (formId && formId !== 'new') {
      loadExistingConfig();
    }
  }, [formId, companyId]);

  const loadExistingConfig = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'companies', companyId, 'calculators', formId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(prevConfig => ({
          ...prevConfig,
          ...docSnap.data()
        }));
      }
    } catch (error) {
              logger.error('FormBuilder', 'Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'companies', companyId, 'calculators', formId || config.slug);
      const now = new Date();
      
      const updatedConfig = {
        ...config,
        updatedAt: now,
        ...(formId === 'new' && {
          createdAt: now,
          createdBy: user?.uid
        })
      };
      
      await setDoc(docRef, updatedConfig, { merge: true });
      setConfig(updatedConfig);
      
      // Update URL if this is a new form
      if (formId === 'new') {
        navigate(`/admin/${companyId}/forms/${config.slug}`, { replace: true });
      }
    } catch (error) {
              logger.error('FormBuilder', 'Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const publishForm = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'companies', companyId, 'calculators', formId || config.slug);
      await updateDoc(docRef, {
        status: 'published',
        publishedAt: new Date()
      });
      
      setConfig(prev => ({ 
        ...prev, 
        status: 'published',
        publishedAt: new Date()
      }));
    } catch (error) {
              logger.error('FormBuilder', 'Error publishing form:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

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

  const CurrentStepComponent = STEPS.find(step => step.id === currentStep)?.component;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {config.name || 'New Form Builder'}
            </h1>
            <p className="text-gray-600">
              {config.description || 'Create a custom booking calculator'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={saveDraft}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  step.id === currentStep
                    ? 'border-blue-500 text-blue-600'
                    : step.id < currentStep
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  <span className={`mr-2 w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                    step.id === currentStep
                      ? 'bg-blue-100 text-blue-600'
                      : step.id < currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.id < currentStep ? '✓' : step.id}
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
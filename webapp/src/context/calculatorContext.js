import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { stepOrder, stepSchema } from '../components/formbuilder/calculatorSteps';
import { loadFormState, debouncedSave, clearFormState } from '../utils/storage';
import SaveIndicator from '../components/ui/SaveIndicator';

// Action types
const ACTIONS = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  LOAD_SAVED_STATE: 'LOAD_SAVED_STATE',
  RESET: 'RESET'
};

// Initial state
const initialState = {
  currentStep: 0,
  formData: {},
  errors: {},
  loading: false,
  isValid: false,
  isDirty: false,
  visitedSteps: new Set([0])
};

// Reducer
function calculatorReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_FIELD: {
      const newFormData = {
        ...state.formData,
        ...action.payload.fields
      };
      
      // Clear errors for updated fields
      const newErrors = { ...state.errors };
      Object.keys(action.payload.fields).forEach(field => {
        delete newErrors[field];
      });
      
      return {
        ...state,
        formData: newFormData,
        errors: newErrors,
        isDirty: true
      };
    }
    
    case ACTIONS.SET_STEP: {
      const newStep = action.payload.step;
      if (newStep < 0 || newStep >= stepOrder.length) {
        return state;
      }
      
      return {
        ...state,
        currentStep: newStep,
        visitedSteps: new Set([...state.visitedSteps, newStep])
      };
    }
    
    case ACTIONS.NEXT_STEP: {
      const nextStep = state.currentStep + 1;
      if (nextStep >= stepOrder.length) {
        return state;
      }
      
      return {
        ...state,
        currentStep: nextStep,
        visitedSteps: new Set([...state.visitedSteps, nextStep])
      };
    }
    
    case ACTIONS.PREV_STEP: {
      const prevStep = state.currentStep - 1;
      if (prevStep < 0) {
        return state;
      }
      
      return {
        ...state,
        currentStep: prevStep
      };
    }
    
    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.payload.errors
        }
      };
    }
    
    case ACTIONS.CLEAR_ERROR: {
      const newErrors = { ...state.errors };
      if (action.payload.field) {
        delete newErrors[action.payload.field];
      } else {
        return {
          ...state,
          errors: {}
        };
      }
      return {
        ...state,
        errors: newErrors
      };
    }
    
    case ACTIONS.SET_LOADING: {
      return {
        ...state,
        loading: action.payload.loading
      };
    }
    
    case ACTIONS.LOAD_SAVED_STATE: {
      return {
        ...state,
        ...action.payload.state,
        loading: false
      };
    }
    
    case ACTIONS.RESET: {
      return {
        ...initialState,
        visitedSteps: new Set([0])
      };
    }
    
    default:
      return state;
  }
}

// Context
const CalculatorContext = createContext();

// Provider component
export function CalculatorProvider({ children, companyId, initialState = null }) {
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [state, dispatch] = useReducer(calculatorReducer, initialState || {
    ...initialState,
    currentStep: 0,
    formData: {},
    errors: {},
    loading: false,
    isValid: false,
    isDirty: false,
    visitedSteps: new Set([0])
  });
  
  // Load saved state from localStorage on mount
  useEffect(() => {
    if (!companyId) return;
    
    const savedState = loadFormState(companyId);
    if (savedState) {
      dispatch({
        type: ACTIONS.LOAD_SAVED_STATE,
        payload: { state: savedState }
      });
    }
  }, [companyId]);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    if (!companyId || !state.isDirty) return;
    
    const saveState = () => {
      const success = debouncedSave(companyId, {
        formData: state.formData,
        currentStep: state.currentStep,
        visitedSteps: Array.from(state.visitedSteps)
      });
      
      if (success) {
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
      }
    };
    
    saveState();
  }, [state, companyId]);
  
  // Helper to check if a step should be skipped
  const shouldSkipStep = (stepIndex) => {
    const step = stepSchema[stepOrder[stepIndex]];
    if (!step.dependencies) return false;
    
    // Check each dependency
    return step.dependencies.some(dep => {
      const { field, value, operator = '=' } = dep;
      const fieldValue = state.formData[field];
      
      switch (operator) {
        case '=':
          return fieldValue !== value;
        case '!=':
          return fieldValue === value;
        case 'exists':
          return fieldValue === undefined;
        case 'notExists':
          return fieldValue !== undefined;
        default:
          return false;
      }
    });
  };
  
  // Navigate to next non-skipped step
  const nextStep = async () => {
    // Validate current step before proceeding
    if (!(await isCurrentStepValid())) {
      return false;
    }

    let nextStepIndex = state.currentStep + 1;
    while (nextStepIndex < stepOrder.length && shouldSkipStep(nextStepIndex)) {
      nextStepIndex++;
    }
    
    if (nextStepIndex < stepOrder.length) {
      dispatch({ type: ACTIONS.SET_STEP, payload: { step: nextStepIndex } });
      return true;
    }
    return false;
  };
  
  // Navigate to previous non-skipped step
  const prevStep = () => {
    let prevStepIndex = state.currentStep - 1;
    while (prevStepIndex >= 0 && shouldSkipStep(prevStepIndex)) {
      prevStepIndex--;
    }
    
    if (prevStepIndex >= 0) {
      dispatch({ type: ACTIONS.SET_STEP, payload: { step: prevStepIndex } });
    }
  };
  
  // Update form fields
  const updateField = (fields) => {
    dispatch({ type: ACTIONS.UPDATE_FIELD, payload: { fields } });
  };
  
  // Set error(s)
  const setError = (errors) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: { errors } });
  };
  
  // Clear error(s)
  const clearError = (field) => {
    dispatch({ type: ACTIONS.CLEAR_ERROR, payload: { field } });
  };
  
  // Set loading state
  const setLoading = (loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { loading } });
  };
  
  // Reset calculator
  const reset = () => {
    if (companyId) {
      clearFormState(companyId);
    }
    dispatch({ type: ACTIONS.RESET });
  };
  
  // Get current step data
  const getCurrentStep = () => {
    const stepId = stepOrder[state.currentStep];
    return stepSchema[stepId];
  };
  
  // Check if current step is valid
  const isCurrentStepValid = async () => {
    const step = getCurrentStep();
    if (!step.validation) return true;
    
    try {
      await step.validation.validate(state.formData, { abortEarly: false });
      return true;
    } catch (err) {
      const errors = {};
      err.inner.forEach(error => {
        errors[error.path] = error.message;
      });
      setError(errors);
      return false;
    }
  };
  
  const value = {
    state,
    updateField,
    nextStep,
    prevStep,
    setError,
    clearError,
    setLoading,
    reset,
    getCurrentStep,
    isCurrentStepValid,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === stepOrder.length - 1,
    progress: ((state.currentStep + 1) / stepOrder.length) * 100
  };
  
  return (
    <CalculatorContext.Provider value={value}>
      {children}
      <SaveIndicator show={showSaveIndicator} />
    </CalculatorContext.Provider>
  );
}

// Hook
export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
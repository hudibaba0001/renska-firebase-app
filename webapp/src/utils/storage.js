/**
 * Utilities for handling form state persistence
 */

const STORAGE_PREFIX = 'calculator_';
const DEBOUNCE_MS = 300;

// Debounce helper
const debounce = (fn, ms) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

/**
 * Save form state to localStorage with company-specific key
 */
export const saveFormState = (companyId, state) => {
  try {
    const key = `${STORAGE_PREFIX}${companyId}`;
    const serializedState = JSON.stringify({
      formData: state.formData,
      currentStep: state.currentStep,
      lastSaved: new Date().toISOString()
    });
    localStorage.setItem(key, serializedState);
    return true;
  } catch (error) {
    console.error('Failed to save form state:', error);
    return false;
  }
};

/**
 * Load form state from localStorage
 */
export const loadFormState = (companyId) => {
  try {
    const key = `${STORAGE_PREFIX}${companyId}`;
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    
    const state = JSON.parse(saved);
    
    // Check if state is too old (24 hours)
    const lastSaved = new Date(state.lastSaved);
    const now = new Date();
    if (now - lastSaved > 24 * 60 * 60 * 1000) {
      clearFormState(companyId);
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load form state:', error);
    return null;
  }
};

/**
 * Clear saved form state
 */
export const clearFormState = (companyId) => {
  try {
    const key = `${STORAGE_PREFIX}${companyId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear form state:', error);
    return false;
  }
};

// Debounced save function
export const debouncedSave = debounce(saveFormState, DEBOUNCE_MS);
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { secureLogger } from '../utils/secureLogger';

/**
 * Hook for handling form submissions with loading states and feedback
 * @param {Function} submitFn - The async function to call on submit
 * @param {Object} options - Configuration options
 * @returns {Object} Submit handler and state
 */
export const useSubmit = (submitFn, {
  onSuccess,
  onError,
  successMessage = 'Successfully submitted!',
  errorMessage = 'Submission failed. Please try again.',
  resetOnSuccess = false
} = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const submit = useCallback(async (...args) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setFieldErrors({});
      
      const result = await submitFn(...args);
      
      // Show success message
      toast.success(successMessage);
      
      // Reset form if requested
      if (resetOnSuccess) {
        // Let the component handle reset logic
        onSuccess?.();
      }
      
      return result;
      
    } catch (err) {
      secureLogger.error('Form submission failed', {
        error: err,
        context: args[0] // Log first argument (usually form data)
      });
      
      // Handle validation errors
      if (err.validationErrors) {
        setFieldErrors(err.validationErrors);
        toast.error('Please fix the highlighted errors');
      } else {
        setError(err.message || errorMessage);
        toast.error(errorMessage);
      }
      
      // Let component handle error
      onError?.(err);
      
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, successMessage, errorMessage, resetOnSuccess, onSuccess, onError]);
  
  return {
    submit,
    isSubmitting,
    error,
    fieldErrors,
    clearError: () => setError(null),
    clearFieldErrors: () => setFieldErrors({})
  };
};

export default useSubmit;
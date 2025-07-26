import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Input variants
const inputVariants = cva(
  'form-input w-full transition-all duration-200',
  {
    variants: {
      variant: {
        default: '',
        error: 'error',
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[2.25rem]',
        base: 'px-4 py-3 text-base min-h-[2.75rem]',
        lg: 'px-5 py-4 text-lg min-h-[3.25rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
  }
);

/**
 * Modern Input Component
 * 
 * Features:
 * - Multiple sizes and variants
 * - Error states with validation
 * - High contrast accessibility
 * - Label and help text support
 * - Icon support
 * - WCAG 2.1 AA compliant
 */
const Input = forwardRef(({
  className,
  variant,
  size,
  type = 'text',
  label,
  helpText,
  error,
  required = false,
  leftIcon,
  rightIcon,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helpTextId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  
  const inputVariant = error ? 'error' : variant;

  return (
    <div className="form-group">
      {label && (
        <label 
          htmlFor={inputId} 
          className={cn('form-label', required && 'required')}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            inputVariants({ variant: inputVariant, size }),
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          aria-describedby={cn(
            helpTextId && helpTextId,
            errorId && errorId
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <p id={helpTextId} className="form-help">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input, inputVariants };
export default Input;

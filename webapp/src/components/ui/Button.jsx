import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Button variants using class-variance-authority for type-safe styling
const buttonVariants = cva(
  // Base styles
  'btn inline-flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
        success: 'btn-success',
        warning: 'btn-warning',
        error: 'btn-error',
      },
      size: {
        xs: 'btn-xs',
        sm: 'btn-sm',
        base: 'btn-base',
        lg: 'btn-lg',
        xl: 'btn-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
    },
  }
);

/**
 * Modern Button Component
 * 
 * Features:
 * - Multiple variants and sizes
 * - High contrast accessibility
 * - Loading states
 * - Icon support
 * - Full keyboard navigation
 * - WCAG 2.1 AA compliant
 */
const Button = forwardRef(({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="spinner" aria-hidden="true" />
      )}
      {!loading && leftIcon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;

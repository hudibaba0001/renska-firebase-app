import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Card variants
const cardVariants = cva(
  'card',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg hover:shadow-xl',
        outlined: 'border-2',
        ghost: 'border-none shadow-none bg-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        base: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'base',
    },
  }
);

/**
 * Modern Card Component
 * 
 * Features:
 * - Multiple variants and padding options
 * - Interactive hover states
 * - Accessible structure
 * - Header, body, footer sections
 * - High contrast design
 */
const Card = forwardRef(({
  className,
  variant,
  padding,
  interactive,
  children,
  onClick,
  ...props
}, ref) => {
  const isInteractive = interactive || !!onClick;
  
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive: isInteractive }), className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header Component
const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('card-header', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

// Card Body Component
const CardBody = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('card-body', className)}
    {...props}
  >
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

// Card Footer Component
const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('card-footer', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

// Card Title Component
const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-heading-md mb-2', className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

// Card Description Component
const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body-sm text-secondary', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  cardVariants
};

export default Card;

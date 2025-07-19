import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * A reusable collapsible section component with smooth animations and accessibility support
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Content to show when expanded
 * @param {boolean} props.defaultExpanded - Whether section starts expanded
 * @param {string|number} props.badge - Badge content to show next to title
 * @param {React.ReactNode} props.icon - Icon to show before title
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onToggle - Callback when section is toggled
 * @param {boolean} props.disabled - Whether the section is disabled
 */
export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  badge,
  icon,
  className = '',
  onToggle,
  disabled = false
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Calculate content height when expanded state changes or content changes
  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      const height = isExpanded ? contentRef.current.scrollHeight : 0;
      setContentHeight(height);
    }
  }, [isExpanded]);

  useEffect(() => {
    updateHeight();
  }, [updateHeight, children]);

  // Handle window resize to recalculate height
  useEffect(() => {
    const handleResize = () => {
      if (isExpanded) {
        updateHeight();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, updateHeight]);

  const handleToggle = () => {
    if (disabled) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-3 transition-colors duration-200 ${
          disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer hover:bg-gray-50'
        }`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        aria-disabled={disabled}
      >
        <div className="flex items-center gap-2">
          {/* Expand/Collapse Arrow */}
          <ChevronRightIcon 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
          
          {/* Optional Icon */}
          {icon && (
            <div className="text-gray-600">
              {icon}
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-medium text-gray-900">
            {title}
          </h3>
          
          {/* Optional Badge */}
          {badge && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        id={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${contentHeight}px` }}
        aria-hidden={!isExpanded}
      >
        <div className="p-3 pt-0 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
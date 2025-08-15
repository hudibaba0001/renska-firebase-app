// Utility for merging class names with conditional logic
// Similar to clsx but optimized for our use case

/**
 * Merge class names conditionally
 * @param {...(string|object|array)} classes - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...classes) {
  const result = [];
  
  for (const cls of classes) {
    if (!cls) continue;
    
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (Array.isArray(cls)) {
      const merged = cn(...cls);
      if (merged) result.push(merged);
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key);
      }
    }
  }
  
  return result.join(' ');
}

/**
 * Create a variant-based class name generator
 * @param {object} config - Configuration object with base and variants
 * @returns {function} - Function to generate class names
 */
export function createVariants(config) {
  const { base = '', variants = {}, defaultVariants = {} } = config;
  
  return function(props = {}) {
    const classes = [base];
    
    // Apply default variants first
    const mergedProps = { ...defaultVariants, ...props };
    
    // Apply variant classes
    for (const [variantName, variantValue] of Object.entries(mergedProps)) {
      if (variantValue && variants[variantName] && variants[variantName][variantValue]) {
        classes.push(variants[variantName][variantValue]);
      }
    }
    
    return cn(...classes);
  };
}

export default cn;

import React from 'react';
import { useCalculator } from '../../context/calculatorContext';
import { CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const PriceCard = ({ config }) => {
  const { state } = useCalculator();
  const { formData } = state;
  
  // Calculate prices
  const calculatePrices = () => {
    const selectedService = config.services.find(s => s.id === formData.serviceId);
    if (!selectedService) {
      return { original: 0, final: 0, discount: 0 };
    }
    
    let originalPrice = selectedService.basePrice;
    
    // Apply area-based pricing
    if (formData.area) {
      originalPrice *= (formData.area / 100); // Price per 100 sqm
    }
    
    // Add selected add-ons
    if (formData.addOns?.length) {
      const addOnTotal = formData.addOns.reduce((sum, addOnId) => {
        const addOn = selectedService.addOns?.find(a => a.id === addOnId);
        return sum + (addOn?.price || 0);
      }, 0);
      originalPrice += addOnTotal;
    }
    
    // Apply frequency discount
    if (formData.frequency && selectedService.frequencyDiscounts) {
      const discount = selectedService.frequencyDiscounts[formData.frequency] || 0;
      originalPrice *= (1 - discount);
    }
    
    // Calculate RUT discount
    let finalPrice = originalPrice;
    let rutDiscount = 0;
    if (formData.useRut && config.rutEnabled) {
      rutDiscount = originalPrice * (config.rutPercentage || 0.3);
      finalPrice -= rutDiscount;
    }
    
    return {
      original: Math.round(originalPrice),
      final: Math.round(finalPrice),
      discount: Math.round(rutDiscount)
    };
  };
  
  const { original, final, discount } = calculatePrices();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Prisuppgift</h3>
      
      {/* Selected service */}
      {formData.serviceId && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Vald tjänst</p>
          <p className="font-medium">
            {config.services.find(s => s.id === formData.serviceId)?.name}
          </p>
        </div>
      )}
      
      {/* Price breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Ordinarie pris</span>
          <span className="font-medium">{original} kr</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span>RUT-avdrag</span>
            <span>-{discount} kr</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
          <span>Totalt att betala</span>
          <span>{final} kr</span>
        </div>
      </div>
      
      {/* Selected options */}
      {formData.addOns?.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Valda tillägg</p>
          <ul className="space-y-1">
            {formData.addOns.map(addOnId => {
              const service = config.services.find(s => s.id === formData.serviceId);
              const addOn = service?.addOns?.find(a => a.id === addOnId);
              return (
                <li key={addOnId} className="flex items-center text-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span>{addOn?.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* RUT info */}
      {config.rutEnabled && (
        <div className="mt-6 text-sm text-gray-600">
          <p>
            {formData.useRut
              ? 'RUT-avdrag är applicerat på priset'
              : 'Du kan få upp till 30% i RUT-avdrag'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceCard;
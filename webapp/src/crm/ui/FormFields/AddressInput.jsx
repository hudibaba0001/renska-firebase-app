import React, { useState } from 'react';
import { Trash } from 'lucide-react';

const AddressInput = ({ 
  primaryAddress,
  multipleAddresses = [],
  onPrimaryAddressChange,
  onMultipleAddressesChange,
  isCompany = false,
  className = ""
}) => {
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      onMultipleAddressesChange([...multipleAddresses, newAddress.trim()]);
      setNewAddress('');
    }
  };

  const handleRemoveAddress = (index) => {
    onMultipleAddressesChange(multipleAddresses.filter((_, i) => i !== index));
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Adressinformation</h3>
      
      {/* Primary Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Huvudadress *
        </label>
        <input
          type="text"
          value={primaryAddress}
          onChange={(e) => onPrimaryAddressChange(e.target.value)}
          placeholder="Storgatan 12, 111 52 Stockholm"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Multiple Addresses */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isCompany ? 'Filialadresser' : 'Flera adresser'} (valfritt)
        </label>
        <div className="space-y-2">
          {multipleAddresses.map((address, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={address}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                type="button"
                onClick={() => handleRemoveAddress(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder={isCompany ? "Kungsgatan 5, 111 43 Stockholm" : "Sommarstuga: Långgatan 8, 123 45 Mariefred"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddAddress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lägg till
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
import React from 'react';

const ConsentCheckbox = ({ 
  checked, 
  onChange, 
  consentDetails,
  onConsentDetailsChange,
  required = false,
  className = ""
}) => {
  return (
    <div className={`bg-blue-50 p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-blue-900 mb-3">GDPR Samtycke</h3>
      
      <div className="space-y-3">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="mr-2 mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required={required}
          />
          <div>
            <span className="text-sm font-medium text-blue-900">
              Jag samtycker till att mina personuppgifter behandlas
            </span>
            <p className="text-xs text-blue-700 mt-1">
              Vi behandlar dina uppgifter enligt GDPR för att kunna leverera våra tjänster och kommunicera med dig.
            </p>
          </div>
        </label>

        {checked && (
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Samtyckesdetaljer *
            </label>
            <textarea
              value={consentDetails}
              onChange={(e) => onConsentDetailsChange(e.target.value)}
              placeholder="Beskriv vad kunden samtycker till, t.ex. 'Samtycker till marknadsföring via e-post och SMS'"
              rows="3"
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-blue-600 mt-1">
              Detaljerad beskrivning av vad kunden samtycker till
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentCheckbox;
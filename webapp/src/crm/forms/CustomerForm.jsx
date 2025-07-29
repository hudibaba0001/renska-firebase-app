import React, { useState } from 'react';
import RUTToggle from '../ui/FormFields/RUTToggle';
import PersonnummerInput from '../ui/FormFields/PersonnummerInput';
import AddressInput from '../ui/FormFields/AddressInput';
import ConsentCheckbox from '../ui/FormFields/ConsentCheckbox';

const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    multiple_addresses: customer?.multiple_addresses || [],
    rut_rot_eligible: customer?.rut_rot_eligible || false,
    property_details: customer?.property_details || '',
    internal_notes: customer?.internal_notes || '',
    lead_source: customer?.lead_source || '',
    preferred_contact_method: customer?.preferred_contact_method || '',
    customer_tags: customer?.customer_tags || [],
    booking_frequency: customer?.booking_frequency || '',
    feedback_rating: customer?.feedback_rating || null,
    // Additional fields for company support
    is_company: customer?.is_company || false,
    contact_person: customer?.contact_person || '',
    secondary_phone: customer?.secondary_phone || '',
    secondary_email: customer?.secondary_email || '',
    company_size: customer?.company_size || '',
    branch_count: customer?.branch_count || '',
    // GDPR and Swedish compliance
    consent_given: customer?.consent_given || false,
    consent_details: customer?.consent_details || '',
    personnummer: customer?.personnummer || '',
    area_tag: customer?.area_tag || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {customer ? 'Redigera Kund' : 'Lägg till Ny Kund'}
        </h2>
        <p className="text-gray-600">
          Fyll i kunduppgifter för SwedPrime CRM-systemet
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Type Selection */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Kundtyp</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="is_company"
                value="false"
                checked={!formData.is_company}
                onChange={() => setFormData(prev => ({ ...prev, is_company: false }))}
                className="mr-2"
              />
              <span className="text-sm font-medium">Privatperson</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="is_company"
                value="true"
                checked={formData.is_company}
                onChange={() => setFormData(prev => ({ ...prev, is_company: true }))}
                className="mr-2"
              />
              <span className="text-sm font-medium">Företag</span>
            </label>
          </div>
        </div>

        {/* Core Customer Management Fields */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunduppgifter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.is_company ? 'Företagsnamn' : 'Namn'} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={formData.is_company ? "Stockholm Office Solutions" : "Anna Johansson"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Contact Person (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktperson (valfritt)
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Lars Nilsson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-post *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="anna.johansson@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Secondary Email (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sekundär e-post (valfritt)
                </label>
                <input
                  type="email"
                  name="secondary_email"
                  value={formData.secondary_email}
                  onChange={handleChange}
                  placeholder="accounts@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="070-123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Secondary Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sekundär telefon (valfritt)
              </label>
              <input
                type="tel"
                name="secondary_phone"
                value={formData.secondary_phone}
                onChange={handleChange}
                placeholder="076-987 65 43"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Personnummer (for individuals) */}
            {!formData.is_company && (
              <PersonnummerInput
                value={formData.personnummer}
                onChange={(value) => setFormData(prev => ({ ...prev, personnummer: value }))}
                required
              />
            )}
          </div>
        </div>

        {/* Address Information */}
        <AddressInput
          primaryAddress={formData.address}
          multipleAddresses={formData.multiple_addresses}
          onPrimaryAddressChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
          onMultipleAddressesChange={(value) => setFormData(prev => ({ ...prev, multiple_addresses: value }))}
          isCompany={formData.is_company}
        />

        {/* Property and Service Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fastighets- och tjänstedetaljer</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RUT/ROT Eligibility */}
            <RUTToggle
              checked={formData.rut_rot_eligible}
              onChange={(e) => setFormData(prev => ({ ...prev, rut_rot_eligible: e.target.checked }))}
              isCompany={formData.is_company}
            />

            {/* Property Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.is_company ? 'Antal enheter/Total yta' : 'Fastighetsdetaljer'} (valfritt)
              </label>
              <input
                type="text"
                name="property_details"
                value={formData.property_details}
                onChange={handleChange}
                placeholder={formData.is_company ? "500 m² eller 10 kontor" : "80 m², 3 rum"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Company Size (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Företagsstorlek (valfritt)
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Välj storlek</option>
                  <option value="1-10">1-10 anställda</option>
                  <option value="11-50">11-50 anställda</option>
                  <option value="51-200">51-200 anställda</option>
                  <option value="200+">200+ anställda</option>
                </select>
              </div>
            )}

            {/* Branch Count (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Antal filialer (valfritt)
                </label>
                <input
                  type="number"
                  name="branch_count"
                  value={formData.branch_count}
                  onChange={handleChange}
                  placeholder="3"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lead and Acquisition Fields */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead- och förvärvsinformation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leadkälla (valfritt)
              </label>
              <select
                name="lead_source"
                value={formData.lead_source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj källa</option>
                <option value="referral">Rekommendation</option>
                <option value="website">Webbplats</option>
                <option value="trade_show">Mässa</option>
                <option value="tender">Upphandling</option>
                <option value="almega">Almega</option>
                <option value="social_media">Sociala medier</option>
                <option value="google">Google</option>
                <option value="other">Annan</option>
              </select>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Föredragen kontaktmetod (valfritt)
              </label>
              <select
                name="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj metod</option>
                <option value="email">E-post</option>
                <option value="phone">Telefon</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Retention and Insights Fields */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kundretention och insikter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kundtaggar (valfritt)
              </label>
              <div className="space-y-2">
                {[
                  'VIP', 'Ny kund', 'Kommersiell', 'Flerårig kontrakt', 
                  'RUT-berättigad', 'ROT-berättigad', 'Återkommande', 'Stor kund'
                ].map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.customer_tags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            customer_tags: [...prev.customer_tags, tag]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            customer_tags: prev.customer_tags.filter(t => t !== tag)
                          }));
                        }
                      }}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Booking Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bokningsfrekvens (valfritt)
              </label>
              <select
                name="booking_frequency"
                value={formData.booking_frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj frekvens</option>
                <option value="one_time">Engångs</option>
                <option value="weekly">Veckovis</option>
                <option value="bi_weekly">Varannan vecka</option>
                <option value="monthly">Månadsvis</option>
                <option value="quarterly">Kvartalsvis</option>
                <option value="custom">Anpassad</option>
              </select>
            </div>

            {/* Feedback Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kundbetyg (valfritt)
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, feedback_rating: star }))}
                    className={`text-2xl ${formData.feedback_rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.feedback_rating ? `${formData.feedback_rating}/5` : 'Inget betyg'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Consent */}
        <ConsentCheckbox
          checked={formData.consent_given}
          onChange={(e) => setFormData(prev => ({ ...prev, consent_given: e.target.checked }))}
          consentDetails={formData.consent_details}
          onConsentDetailsChange={(value) => setFormData(prev => ({ ...prev, consent_details: value }))}
          required
        />

        {/* Internal Notes */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interna anteckningar</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interna anteckningar (valfritt)
            </label>
            <textarea
              name="internal_notes"
              value={formData.internal_notes}
              onChange={handleChange}
              placeholder={formData.is_company ? "Åtkomst via reception, kod: 1234" : "Nyckel under mattan, husdjur: katt"}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Specialinstruktioner för städteamet
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {customer ? 'Uppdatera Kund' : 'Lägg till Kund'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
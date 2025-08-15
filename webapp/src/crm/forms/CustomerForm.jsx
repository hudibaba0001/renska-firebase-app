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
    // Removed feedback_rating - replaced with flexible tags
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {customer ? 'Redigera Kund' : 'Lägg till Ny Kund'}
                </h1>
                <p className="mt-2 text-gray-600 text-lg">
                  Fyll i kunduppgifter för SwedPrime CRM-systemet
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Type Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Kundtyp</h2>
              <p className="text-blue-100 text-sm mt-1">Välj om detta är en privatperson eller företag</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="is_company"
                    value="false"
                    checked={!formData.is_company}
                    onChange={() => setFormData(prev => ({ ...prev, is_company: false }))}
                    className="sr-only"
                  />
                  <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    !formData.is_company 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !formData.is_company ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {!formData.is_company && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Privatperson</h3>
                        <p className="text-gray-600 text-sm">Individuell kund</p>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="is_company"
                    value="true"
                    checked={formData.is_company}
                    onChange={() => setFormData(prev => ({ ...prev, is_company: true }))}
                    className="sr-only"
                  />
                  <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    formData.is_company 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.is_company ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {formData.is_company && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Företag</h3>
                        <p className="text-gray-600 text-sm">Organisation eller företag</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Core Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Kunduppgifter</h2>
              <p className="text-gray-300 text-sm mt-1">Grundläggande kontaktinformation</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {formData.is_company ? 'Företagsnamn' : 'Namn'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={formData.is_company ? "Stockholm Office Solutions" : "Anna Johansson"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    required
                  />
                </div>

                {/* Contact Person (for companies) */}
                {formData.is_company && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Kontaktperson
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      placeholder="Lars Nilsson"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    E-post *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="anna.johansson@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    required
                  />
                </div>

                {/* Secondary Email (for companies) */}
                {formData.is_company && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Sekundär e-post
                    </label>
                    <input
                      type="email"
                      name="secondary_email"
                      value={formData.secondary_email}
                      onChange={handleChange}
                      placeholder="accounts@company.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                )}

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="070-123 45 67"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    required
                  />
                </div>

                {/* Secondary Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Sekundär telefon
                  </label>
                  <input
                    type="tel"
                    name="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={handleChange}
                    placeholder="076-987 65 43"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                {/* Personnummer (for individuals) */}
                {!formData.is_company && (
                  <div className="md:col-span-2">
                    <PersonnummerInput
                      value={formData.personnummer}
                      onChange={(value) => setFormData(prev => ({ ...prev, personnummer: value }))}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Adressinformation</h2>
              <p className="text-green-100 text-sm mt-1">Kundens adress och platsinformation</p>
            </div>
            <div className="p-6">
              <AddressInput
                primaryAddress={formData.address}
                multipleAddresses={formData.multiple_addresses}
                onPrimaryAddressChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                onMultipleAddressesChange={(value) => setFormData(prev => ({ ...prev, multiple_addresses: value }))}
                isCompany={formData.is_company}
              />
            </div>
          </div>

          {/* Property and Service Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Fastighets- och tjänstedetaljer</h2>
              <p className="text-purple-100 text-sm mt-1">Information om fastighet och tjänster</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* RUT/ROT Eligibility */}
                <div className="md:col-span-2">
                  <RUTToggle
                    checked={formData.rut_rot_eligible}
                    onChange={(e) => setFormData(prev => ({ ...prev, rut_rot_eligible: e.target.checked }))}
                    isCompany={formData.is_company}
                  />
                </div>

                {/* Property Details */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {formData.is_company ? 'Antal enheter/Total yta' : 'Fastighetsdetaljer'}
                  </label>
                  <input
                    type="text"
                    name="property_details"
                    value={formData.property_details}
                    onChange={handleChange}
                    placeholder={formData.is_company ? "500 m² eller 10 kontor" : "80 m², 3 rum"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                {/* Company Size (for companies) */}
                {formData.is_company && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Företagsstorlek
                    </label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Antal filialer
                    </label>
                    <input
                      type="number"
                      name="branch_count"
                      value={formData.branch_count}
                      onChange={handleChange}
                      placeholder="3"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lead and Acquisition Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Lead- och förvärvsinformation</h2>
              <p className="text-orange-100 text-sm mt-1">Information om hur kunden hittades</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lead Source */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Leadkälla
                  </label>
                  <select
                    name="lead_source"
                    value={formData.lead_source}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Föredragen kontaktmetod
                  </label>
                  <select
                    name="preferred_contact_method"
                    value={formData.preferred_contact_method}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
          </div>

          {/* Flexible Tags and Booking Frequency */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Kundtaggar och Bokningsfrekvens</h2>
              <p className="text-indigo-100 text-sm mt-1">Kategorisera kunden och ange bokningsfrekvens</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Flexible Customer Tags */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kundtaggar
                  </label>
                  
                  {/* Predefined Tags */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fördefinierade taggar</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'VIP', 'Ny kund', 'Kommersiell', 'Flerårig kontrakt', 
                        'RUT-berättigad', 'ROT-berättigad', 'Återkommande', 'Stor kund'
                      ].map(tag => (
                        <label key={tag} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
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
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Tags Input */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lägg till anpassade taggar</p>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Skriv en ny tagg..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const newTag = e.target.value.trim();
                            if (newTag && !formData.customer_tags.includes(newTag)) {
                              setFormData(prev => ({
                                ...prev,
                                customer_tags: [...prev.customer_tags, newTag]
                              }));
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          const newTag = input.value.trim();
                          if (newTag && !formData.customer_tags.includes(newTag)) {
                            setFormData(prev => ({
                              ...prev,
                              customer_tags: [...prev.customer_tags, newTag]
                            }));
                            input.value = '';
                          }
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                      >
                        Lägg till
                      </button>
                    </div>
                  </div>
                  
                  {/* Display Current Tags */}
                  {formData.customer_tags.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aktuella taggar</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.customer_tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                customer_tags: prev.customer_tags.filter(t => t !== tag)
                              }))}
                              className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Frequency */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bokningsfrekvens
                  </label>
                  <select
                    name="booking_frequency"
                    value={formData.booking_frequency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Välj frekvens</option>
                    <option value="one_time">Engångs</option>
                    <option value="weekly">Veckovis</option>
                    <option value="bi_weekly">Varannan vecka</option>
                    <option value="monthly">Månadsvis</option>
                    <option value="quarterly">Kvartalsvis</option>
                    <option value="custom">Anpassad</option>
                  </select>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Fördelar med taggar</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Enkel kategorisering av kunder</li>
                      <li>• Förbättrad sökning och filtrering</li>
                      <li>• Bättre kundanalys och rapportering</li>
                      <li>• Anpassad kommunikation per kategori</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GDPR Consent */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">GDPR Samtycke</h2>
              <p className="text-yellow-100 text-sm mt-1">Hantering av personuppgifter enligt GDPR</p>
            </div>
            <div className="p-6">
              <ConsentCheckbox
                checked={formData.consent_given}
                onChange={(e) => setFormData(prev => ({ ...prev, consent_given: e.target.checked }))}
                consentDetails={formData.consent_details}
                onConsentDetailsChange={(value) => setFormData(prev => ({ ...prev, consent_details: value }))}
                required
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Interna anteckningar</h2>
              <p className="text-gray-300 text-sm mt-1">Specialinstruktioner för städteamet</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Interna anteckningar
                </label>
                <textarea
                  name="internal_notes"
                  value={formData.internal_notes}
                  onChange={handleChange}
                  placeholder={formData.is_company ? "Åtkomst via reception, kod: 1234" : "Nyckel under mattan, husdjur: katt"}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                />
                <p className="text-xs text-gray-500">
                  Denna information är endast synlig för ditt team
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
              >
                {customer ? 'Uppdatera Kund' : 'Lägg till Kund'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
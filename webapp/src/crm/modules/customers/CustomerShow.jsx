import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Building, User, MapPin, Phone, Mail, Star } from 'lucide-react';
import { getCustomer, deleteCustomer } from '../../services/customerService';
import toast from 'react-hot-toast';

const CustomerShow = () => {
  const { companyId, customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [companyId, customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const customerData = await getCustomer(companyId, customerId);
      setCustomer(customerData);
    } catch (error) {
      console.error('Error loading customer:', error);
      toast.error('Kunde inte ladda kund');
      navigate(`/admin/${companyId}/crm-data/customers`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Är du säker på att du vill ta bort denna kund?')) {
      try {
        await deleteCustomer(companyId, customerId);
        navigate(`/admin/${companyId}/crm-data/customers`);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Aktiv' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inaktiv' },
      deleted: { color: 'bg-red-100 text-red-800', text: 'Borttagen' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Kund hittades inte
          </h2>
          <p className="text-gray-600 mb-4">
            Den begärda kunden kunde inte hittas.
          </p>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/customers`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tillbaka till kunder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/admin/${companyId}/crm-data/customers`)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka till kunder
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/admin/${companyId}/crm-data/customers/${customerId}/edit`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Redigera
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash className="w-4 h-4 mr-2" />
                Ta bort
              </button>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16">
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  {customer.is_company ? (
                    <Building className="h-8 w-8 text-white" />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                <p className="text-blue-100 text-lg">
                  {customer.is_company ? 'Företag' : 'Privatperson'}
                  {customer.contact_person && ` • ${customer.contact_person}`}
                </p>
                <div className="mt-2">
                  {getStatusBadge(customer.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Kontaktinformation</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">E-post</p>
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                  
                  {customer.secondary_email && (
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Sekundär e-post</p>
                        <p className="text-gray-900">{customer.secondary_email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="text-gray-900">{customer.phone}</p>
                    </div>
                  </div>

                  {customer.secondary_phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Sekundär telefon</p>
                        <p className="text-gray-900">{customer.secondary_phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Adress</p>
                      <p className="text-gray-900">{customer.address}</p>
                    </div>
                  </div>

                  {customer.personnummer && (
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Personnummer</p>
                        <p className="text-gray-900">{customer.personnummer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ytterligare information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">RUT/ROT-berättigad</p>
                    <p className="text-gray-900">
                      {customer.rut_rot_eligible ? (
                        <span className="text-green-600 font-medium">Ja</span>
                      ) : (
                        <span className="text-gray-600">Nej</span>
                      )}
                    </p>
                  </div>

                  {customer.property_details && (
                    <div>
                      <p className="text-sm text-gray-500">Fastighetsdetaljer</p>
                      <p className="text-gray-900">{customer.property_details}</p>
                    </div>
                  )}

                  {customer.lead_source && (
                    <div>
                      <p className="text-sm text-gray-500">Leadkälla</p>
                      <p className="text-gray-900">{customer.lead_source}</p>
                    </div>
                  )}

                  {customer.preferred_contact_method && (
                    <div>
                      <p className="text-sm text-gray-500">Föredragen kontaktmetod</p>
                      <p className="text-gray-900">{customer.preferred_contact_method}</p>
                    </div>
                  )}

                  {customer.booking_frequency && (
                    <div>
                      <p className="text-sm text-gray-500">Bokningsfrekvens</p>
                      <p className="text-gray-900">{customer.booking_frequency}</p>
                    </div>
                  )}

                  {/* Rating section removed - replaced with flexible tags */}

                  {customer.customer_tags && customer.customer_tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Kundtaggar</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.customer_tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Multiple Addresses */}
            {customer.multiple_addresses && customer.multiple_addresses.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Flera adresser</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.multiple_addresses.map((address, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Adress {index + 1}</p>
                      <p className="text-gray-900">{address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company-specific information */}
            {customer.is_company && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Företagsinformation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.company_size && (
                    <div>
                      <p className="text-sm text-gray-500">Företagsstorlek</p>
                      <p className="text-gray-900">{customer.company_size}</p>
                    </div>
                  )}
                  {customer.branch_count && (
                    <div>
                      <p className="text-sm text-gray-500">Antal filialer</p>
                      <p className="text-gray-900">{customer.branch_count}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GDPR Consent */}
            {customer.consent_given && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">GDPR Samtycke</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Samtyckesdetaljer</p>
                  <p className="text-gray-900">{customer.consent_details}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Samtycke givet: {formatDate(customer.consent_timestamp)}
                  </p>
                </div>
              </div>
            )}

            {/* Internal Notes */}
            {customer.internal_notes && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Interna anteckningar</h2>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{customer.internal_notes}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div>
                  <p>Skapad: {formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p>Senast uppdaterad: {formatDate(customer.updatedAt)}</p>
                </div>
                <div>
                  <p>Status: {customer.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerShow;
import React from 'react';
import { Button, Card, Badge } from 'flowbite-react';
import {
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const CustomersTable = ({ 
  customers, 
  onViewCustomer, 
  onDeleteCustomer,
  formatCurrency,
  formatDate 
}) => {
  
  const getCustomerStatusBadge = (status) => {
    const statusConfig = {
      lead: { color: 'warning', text: 'Lead' },
      prospect: { color: 'info', text: 'Prospekt' },
      active: { color: 'success', text: 'Aktiv' },
      inactive: { color: 'failure', text: 'Inaktiv' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <Badge color={config.color} size="sm">{config.text}</Badge>;
  };

  const getCustomerTypeBadge = (type) => {
    const typeConfig = {
      private: { color: 'blue', text: 'Privat', icon: UserIcon },
      business: { color: 'purple', text: 'Företag', icon: BuildingOfficeIcon }
    };
    
    const config = typeConfig[type] || typeConfig.private;
    const Icon = config.icon;
    
    return (
      <Badge color={config.color} size="sm" className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getPrimaryAddress = (customer) => {
    if (!customer.addresses || customer.addresses.length === 0) {
      return null;
    }
    
    const primaryAddress = customer.addresses.find(addr => addr.isDefault) || customer.addresses[0];
    return primaryAddress;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [
      address.street,
      address.postalCode,
      address.city
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Kund</th>
            <th className="px-6 py-3">Kontakt</th>
            <th className="px-6 py-3">Adress</th>
            <th className="px-6 py-3">Typ & Status</th>
            <th className="px-6 py-3">Bokningar</th>
            <th className="px-6 py-3">Totalt spenderat</th>
            <th className="px-6 py-3">Senaste bokning</th>
            <th className="px-6 py-3">Taggar</th>
            <th className="px-6 py-3">Åtgärder</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const primaryAddress = getPrimaryAddress(customer);
            
            return (
              <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-gray-500 text-sm">
                        {customer.source === 'manual' ? 'Manuell' : 
                         customer.source === 'booking' ? 'Bokning' :
                         customer.source === 'website' ? 'Webbplats' :
                         customer.source === 'referral' ? 'Rekommendation' :
                         customer.source === 'social' ? 'Sociala medier' :
                         customer.source === 'advertisement' ? 'Annons' : customer.source}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-xs">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {primaryAddress ? (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-xs">{formatAddress(primaryAddress)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Ingen adress</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {getCustomerTypeBadge(customer.customerType)}
                    {getCustomerStatusBadge(customer.status)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{customer.totalBookings || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CurrencyEuroIcon className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{formatCurrency(customer.totalSpent || 0)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{formatDate(customer.lastBooking)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {customer.tags && customer.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} color="info" size="xs">
                          {tag}
                        </Badge>
                      ))}
                      {customer.tags.length > 2 && (
                        <Badge color="gray" size="xs">
                          +{customer.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Inga taggar</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => onViewCustomer(customer)}
                      className="flex items-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Visa
                    </Button>
                    <Button
                      size="sm"
                      color="failure"
                      onClick={() => onDeleteCustomer(customer.id)}
                      className="flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Ta bort
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {customers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Inga kunder hittades</h3>
            <p className="text-sm">
              Du har inga kunder ännu. Lägg till din första kund eller vänta på bokningar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTable;

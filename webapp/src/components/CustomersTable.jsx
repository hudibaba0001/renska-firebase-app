import React from 'react';
import { Button, Card } from 'flowbite-react';
import {
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon
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
      active: { color: 'bg-green-100 text-green-800', text: 'Aktiv' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inaktiv' },
      blocked: { color: 'bg-red-100 text-red-800', text: 'Blockerad' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getCustomerTypeBadge = (type) => {
    const typeConfig = {
      private: { color: 'bg-blue-100 text-blue-800', text: 'Privat', icon: UserIcon },
      business: { color: 'bg-purple-100 text-purple-800', text: 'Företag', icon: BuildingOfficeIcon }
    };
    
    const config = typeConfig[type] || typeConfig.private;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Kund</th>
              <th className="px-6 py-3">Kontakt</th>
              <th className="px-6 py-3">Typ</th>
              <th className="px-6 py-3">Bokningar</th>
              <th className="px-6 py-3">Totalt spenderat</th>
              <th className="px-6 py-3">Senaste bokning</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-gray-500 text-sm truncate max-w-xs">{customer.address}</div>
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
                  {getCustomerTypeBadge(customer.customerType)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{customer.totalBookings}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CurrencyEuroIcon className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    {formatDate(customer.lastBooking)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getCustomerStatusBadge(customer.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => onViewCustomer(customer)}
                      title="Visa detaljer"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => window.open(`tel:${customer.phone}`)}
                      disabled={!customer.phone}
                      title="Ring kund"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => window.open(`mailto:${customer.email}`)}
                      title="Skicka e-post"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                    </Button>
                    {customer.source === 'manual' && (
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => onDeleteCustomer(customer.id)}
                        title="Ta bort kund"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {customers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga kunder hittades</h3>
            <p className="text-gray-600">Lägg till din första kund eller justera sökfiltren.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CustomersTable;

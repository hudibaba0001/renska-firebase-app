import React from 'react';
import { Button, Card, TextInput, Select, Textarea, Modal } from 'flowbite-react';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export const AddCustomerModal = ({ 
  show, 
  onClose, 
  newCustomer, 
  setNewCustomer, 
  onAddCustomer 
}) => {
  return (
    <Modal show={show} onClose={onClose} size="2xl">
      <Modal.Header>Lägg till ny kund</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Namn *
              </label>
              <TextInput
                value={newCustomer.name}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Kundens namn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-post *
              </label>
              <TextInput
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                placeholder="kund@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <TextInput
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="070-123 45 67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kundtyp
              </label>
              <Select
                value={newCustomer.customerType}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, customerType: e.target.value }))}
              >
                <option value="private">Privat</option>
                <option value="business">Företag</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adress
            </label>
            <TextInput
              value={newCustomer.address}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Gatuadress"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stad
              </label>
              <TextInput
                value={newCustomer.city}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Stockholm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postnummer
              </label>
              <TextInput
                value={newCustomer.postalCode}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="123 45"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anteckningar
            </label>
            <Textarea
              value={newCustomer.notes}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Eventuella anteckningar om kunden..."
              rows={3}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onAddCustomer}>
          Lägg till kund
        </Button>
        <Button color="gray" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const ViewCustomerModal = ({ 
  show, 
  onClose, 
  customer, 
  bookings, 
  formatCurrency, 
  formatDate 
}) => {
  if (!customer) return null;

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

  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Väntande' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Bekräftad' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Slutförd' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Avbokad' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <Modal.Header>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{customer.name}</h3>
            <p className="text-gray-600">{customer.email}</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Kontaktinformation</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Statistik</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Totala bokningar:</span>
                  <span className="text-sm font-medium">{customer.totalBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Totalt spenderat:</span>
                  <span className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Senaste bokning:</span>
                  <span className="text-sm font-medium">{formatDate(customer.lastBooking)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kundtyp:</span>
                  {getCustomerTypeBadge(customer.customerType)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Källa:</span>
                  <span className="text-sm font-medium capitalize">
                    {customer.source === 'online' ? 'Online bokning' : 
                     customer.source === 'manual' ? 'Manuell' : customer.source}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes */}
          {customer.notes && (
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Anteckningar</h4>
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </Card>
          )}

          {/* Booking History */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Bokningshistorik ({bookings.length})</h4>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 10).map((booking) => (
                  <Card key={booking.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {formatDate(booking.createdAt)}
                          </span>
                          {getBookingStatusBadge(booking.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.serviceName || booking.service || 'Städtjänst'}
                        </div>
                        {booking.address && (
                          <div className="flex items-center gap-2 mt-1">
                            <MapPinIcon className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{booking.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <CurrencyEuroIcon className="w-4 h-4 text-green-500" />
                          {formatCurrency(booking.totalPrice || booking.totalAmount || booking.amount || 0)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {booking.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {bookings.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Visar 10 av {bookings.length} bokningar
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Inga bokningar</h3>
                <p className="text-gray-600">Denna kund har inga bokningar ännu.</p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex items-center gap-3">
          <Button
            color="light"
            onClick={() => window.open(`tel:${customer.phone}`)}
            disabled={!customer.phone}
          >
            <PhoneIcon className="w-4 h-4 mr-2" />
            Ring
          </Button>
          <Button
            color="light"
            onClick={() => window.open(`mailto:${customer.email}`)}
          >
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            E-post
          </Button>
          <Button color="gray" onClick={onClose}>
            Stäng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Button, Card, TextInput, Select, Textarea, Modal, Badge, Tabs, Tab } from 'flowbite-react';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';

export const AddCustomerModal = ({ 
  show, 
  onClose, 
  newCustomer, 
  setNewCustomer, 
  onAddCustomer 
}) => {
  const [newTag, setNewTag] = useState('');
  const [newAddress, setNewAddress] = useState({
    type: 'primary',
    street: '',
    city: '',
    postalCode: '',
    country: 'Sweden',
    isDefault: true
  });

  const resetForm = () => {
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      customerType: 'private',
      status: 'lead',
      source: 'manual',
      addresses: [],
      preferences: {
        preferredContactMethod: 'email',
        preferredTime: 'morning',
        specialInstructions: '',
        allergies: '',
        pets: false,
        accessInstructions: ''
      },
      tags: [],
      notes: []
    });
    setNewTag('');
    setNewAddress({
      type: 'primary',
      street: '',
      city: '',
      postalCode: '',
      country: 'Sweden',
      isDefault: true
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !newCustomer.tags.includes(newTag.trim())) {
      setNewCustomer(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewCustomer(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAddress = () => {
    if (newAddress.street || newAddress.city) {
      const addressToAdd = {
        ...newAddress,
        id: `addr_${Date.now()}`
      };
      
      setNewCustomer(prev => ({
        ...prev,
        addresses: [...prev.addresses, addressToAdd]
      }));
      
      setNewAddress({
        type: 'primary',
        street: '',
        city: '',
        postalCode: '',
        country: 'Sweden',
        isDefault: true
      });
    }
  };

  const removeAddress = (addressId) => {
    setNewCustomer(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== addressId)
    }));
  };

  return (
    <Modal show={show} onClose={handleClose} size="4xl">
      <Modal.Header>Lägg till ny kund</Modal.Header>
      <Modal.Body>
        <Tabs.Group style="underline">
          <Tabs.Item active title="Grundläggande" icon={UserIcon}>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospekt</option>
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Källa
                </label>
                <Select
                  value={newCustomer.source}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option value="manual">Manuell</option>
                  <option value="booking">Bokning</option>
                  <option value="website">Webbplats</option>
                  <option value="referral">Rekommendation</option>
                  <option value="social">Sociala medier</option>
                  <option value="advertisement">Annons</option>
                </Select>
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Adresser" icon={MapPinIcon}>
            <div className="space-y-4">
              {/* Existing Addresses */}
              {newCustomer.addresses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Befintliga adresser</h4>
                  <div className="space-y-2">
                    {newCustomer.addresses.map((address) => (
                      <div key={address.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge color="info" size="sm">{address.type}</Badge>
                            {address.isDefault && <Badge color="success" size="sm">Standard</Badge>}
                          </div>
                          <p className="text-sm">
                            {address.street && `${address.street}, `}
                            {address.postalCode && `${address.postalCode} `}
                            {address.city}
                            {address.country && `, ${address.country}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          color="failure"
                          onClick={() => removeAddress(address.id)}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Address */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Lägg till adress</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ
                    </label>
                    <Select
                      value={newAddress.type}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="primary">Primär</option>
                      <option value="billing">Fakturering</option>
                      <option value="service">Service</option>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Standardadress</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gatuadress
                    </label>
                    <TextInput
                      value={newAddress.street}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="Storgatan 123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stad
                    </label>
                    <TextInput
                      value={newAddress.city}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Stockholm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postnummer
                    </label>
                    <TextInput
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="123 45"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Land
                    </label>
                    <TextInput
                      value={newAddress.country}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Sweden"
                    />
                  </div>
                </div>

                <Button
                  onClick={addAddress}
                  disabled={!newAddress.street && !newAddress.city}
                  className="mt-4"
                  size="sm"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Lägg till adress
                </Button>
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Preferenser" icon={StarIcon}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Föredragen kontaktmetod
                  </label>
                  <Select
                    value={newCustomer.preferences.preferredContactMethod}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, preferredContactMethod: e.target.value }
                    }))}
                  >
                    <option value="email">E-post</option>
                    <option value="phone">Telefon</option>
                    <option value="sms">SMS</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Föredragen tid
                  </label>
                  <Select
                    value={newCustomer.preferences.preferredTime}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, preferredTime: e.target.value }
                    }))}
                  >
                    <option value="morning">Morgon</option>
                    <option value="afternoon">Eftermiddag</option>
                    <option value="evening">Kväll</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Särskilda instruktioner
                </label>
                <Textarea
                  value={newCustomer.preferences.specialInstructions}
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, specialInstructions: e.target.value }
                  }))}
                  placeholder="Särskilda instruktioner för städning..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergier
                  </label>
                  <TextInput
                    value={newCustomer.preferences.allergies}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, allergies: e.target.value }
                    }))}
                    placeholder="Allergier att tänka på..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tillträdesinstruktioner
                  </label>
                  <TextInput
                    value={newCustomer.preferences.accessInstructions}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, accessInstructions: e.target.value }
                    }))}
                    placeholder="Kod, nyckel, etc..."
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newCustomer.preferences.pets}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, pets: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Husdjur i hemmet</span>
                </label>
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Taggar" icon={TagIcon}>
            <div className="space-y-4">
              {/* Existing Tags */}
              {newCustomer.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Befintliga taggar</h4>
                  <div className="flex flex-wrap gap-2">
                    {newCustomer.tags.map((tag, index) => (
                      <Badge key={index} color="info" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Tag */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Lägg till tagg</h4>
                <div className="flex gap-2">
                  <TextInput
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ny tagg..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1"
                  />
                  <Button onClick={addTag} disabled={!newTag.trim()} size="sm">
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tryck Enter eller klicka på + för att lägga till taggen
                </p>
              </div>
            </div>
          </Tabs.Item>
        </Tabs.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} color="gray">
          Avbryt
        </Button>
        <Button 
          onClick={() => {
            onAddCustomer();
            handleClose();
          }}
          disabled={!newCustomer.name || !newCustomer.email}
        >
          Skapa kund
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
  formatDate,
  onAddNote,
  onUpdateStatus,
  onAddTag,
  onRemoveTag
}) => {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [newTag, setNewTag] = useState('');

  const getCustomerTypeBadge = (type) => {
    switch (type) {
      case 'business': return <Badge color="purple">Företag</Badge>;
      case 'private': return <Badge color="blue">Privat</Badge>;
      default: return <Badge color="gray">Okänd</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      lead: 'warning',
      prospect: 'info',
      active: 'success',
      inactive: 'failure'
    };
    return <Badge color={colors[status] || 'gray'}>{status}</Badge>;
  };

  const getBookingStatusBadge = (status) => {
    const colors = {
      confirmed: 'success',
      pending: 'warning',
      completed: 'info',
      cancelled: 'failure'
    };
    return <Badge color={colors[status] || 'gray'}>{status}</Badge>;
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(customer.id, { content: newNote.trim(), type: noteType });
      setNewNote('');
      setNoteType('general');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(customer.id, newTag.trim());
      setNewTag('');
    }
  };

  if (!customer) return null;

  return (
    <Modal show={show} onClose={onClose} size="6xl">
      <Modal.Header>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getCustomerTypeBadge(customer.customerType)}
            {getStatusBadge(customer.status)}
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Tabs.Group style="underline">
          <Tabs.Item active title="Översikt" icon={UserIcon}>
            <div className="space-y-6">
              {/* Customer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{customer.totalBookings || 0}</div>
                    <div className="text-sm text-gray-600">Totalt bokningar</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent || 0)}</div>
                    <div className="text-sm text-gray-600">Totalt spenderat</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {customer.totalBookings > 0 ? formatCurrency((customer.totalSpent || 0) / customer.totalBookings) : '0 kr'}
                    </div>
                    <div className="text-sm text-gray-600">Genomsnittlig order</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {customer.lastBooking ? formatDate(customer.lastBooking) : 'Aldrig'}
                    </div>
                    <div className="text-sm text-gray-600">Senaste bokning</div>
                  </div>
                </Card>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h4 className="text-lg font-semibold mb-4">Kundinformation</h4>
                  <div className="space-y-3">
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
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm capitalize">{customer.customerType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm capitalize">{customer.source}</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h4 className="text-lg font-semibold mb-4">Adresser</h4>
                  {customer.addresses && customer.addresses.length > 0 ? (
                    <div className="space-y-2">
                      {customer.addresses.map((address, index) => (
                        <div key={address.id || index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge color="info" size="sm">{address.type}</Badge>
                            {address.isDefault && <Badge color="success" size="sm">Standard</Badge>}
                          </div>
                          <p className="text-sm">
                            {address.street && `${address.street}, `}
                            {address.postalCode && `${address.postalCode} `}
                            {address.city}
                            {address.country && `, ${address.country}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Inga adresser registrerade</p>
                  )}
                </Card>
              </div>

              {/* Preferences */}
              {customer.preferences && (
                <Card>
                  <h4 className="text-lg font-semibold mb-4">Preferenser</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Föredragen kontaktmetod</label>
                      <p className="text-sm text-gray-600 capitalize">{customer.preferences.preferredContactMethod || 'Ej angivet'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Föredragen tid</label>
                      <p className="text-sm text-gray-600 capitalize">{customer.preferences.preferredTime || 'Ej angivet'}</p>
                    </div>
                    {customer.preferences.specialInstructions && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Särskilda instruktioner</label>
                        <p className="text-sm text-gray-600">{customer.preferences.specialInstructions}</p>
                      </div>
                    )}
                    {customer.preferences.allergies && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Allergier</label>
                        <p className="text-sm text-gray-600">{customer.preferences.allergies}</p>
                      </div>
                    )}
                    {customer.preferences.accessInstructions && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tillträdesinstruktioner</label>
                        <p className="text-sm text-gray-600">{customer.preferences.accessInstructions}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Husdjur</label>
                      <p className="text-sm text-gray-600">{customer.preferences.pets ? 'Ja' : 'Nej'}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </Tabs.Item>

          <Tabs.Item title="Bokningar" icon={CalendarDaysIcon}>
            <div className="space-y-4">
              {bookings && bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-medium">ID</th>
                        <th className="px-4 py-3 font-medium">Tjänst</th>
                        <th className="px-4 py-3 font-medium">Datum</th>
                        <th className="px-4 py-3 font-medium">Belopp</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{booking.id}</td>
                          <td className="px-4 py-3">{booking.serviceName || 'Okänd tjänst'}</td>
                          <td className="px-4 py-3">{formatDate(booking.date)}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(booking.totalAmount || 0)}</td>
                          <td className="px-4 py-3">{getBookingStatusBadge(booking.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Inga bokningar hittades för denna kund</p>
                </div>
              )}
            </div>
          </Tabs.Item>

          <Tabs.Item title="Anteckningar" icon={ChatBubbleLeftIcon}>
            <div className="space-y-4">
              {/* Add New Note */}
              <Card>
                <h4 className="text-lg font-semibold mb-4">Lägg till anteckning</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typ
                      </label>
                      <Select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                      >
                        <option value="general">Allmänt</option>
                        <option value="communication">Kommunikation</option>
                        <option value="issue">Problem</option>
                        <option value="preference">Preferens</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Innehåll
                    </label>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Skriv din anteckning här..."
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    size="sm"
                  >
                    Lägg till anteckning
                  </Button>
                </div>
              </Card>

              {/* Existing Notes */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Befintliga anteckningar</h4>
                {customer.notes && customer.notes.length > 0 ? (
                  <div className="space-y-3">
                    {customer.notes.map((note, index) => (
                      <Card key={note.id || index} className="bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge color="info" size="sm">{note.type}</Badge>
                              <span className="text-xs text-gray-500">
                                {note.createdAt ? formatDate(note.createdAt) : 'Okänt datum'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{note.content}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Inga anteckningar hittades</p>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Taggar" icon={TagIcon}>
            <div className="space-y-4">
              {/* Add New Tag */}
              <Card>
                <h4 className="text-lg font-semibold mb-4">Lägg till tagg</h4>
                <div className="flex gap-2">
                  <TextInput
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ny tagg..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddTag} disabled={!newTag.trim()} size="sm">
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Existing Tags */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Befintliga taggar</h4>
                {customer.tags && customer.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} color="info" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => onRemoveTag(customer.id, tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Inga taggar hittades</p>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Item>
        </Tabs.Group>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Select
              value={customer.status}
              onChange={(e) => onUpdateStatus(customer.id, e.target.value)}
              size="sm"
            >
              <option value="lead">Lead</option>
              <option value="prospect">Prospekt</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} color="gray">
              Stäng
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

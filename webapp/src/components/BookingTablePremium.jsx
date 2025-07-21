import React, { useState } from 'react';
import { Badge, Button } from 'flowbite-react';
import { 
  EyeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  UserIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Get service name from booking data
const getServiceName = (booking) => {
  // Try to get service name from various possible fields
  const serviceName = booking.serviceName || 
                     booking.serviceType || 
                     booking.title || 
                     booking.name || 
                     booking.service || 
                     'Okänd tjänst';
  
  // If it's a service ID, try to resolve it
  if (serviceName && serviceName.length > 10 && !serviceName.includes(' ')) {
    // This looks like a service ID, return a generic name
    return 'Städtjänst';
  }
  
  return serviceName;
};

// Get service type from booking data
const getServiceType = (booking) => {
  const serviceName = getServiceName(booking).toLowerCase();
  
  // First check if there are window fields in the booking data
  const hasWindowFields = Object.keys(booking).some(key => key.startsWith('window_') && booking[key] > 0);
  if (hasWindowFields) {
    return 'windows';
  }
  
  // Then check service name
  if (serviceName.includes('fönster') || serviceName.includes('window')) return 'windows';
  if (serviceName.includes('flyttstäd') || serviceName.includes('move')) return 'moveout';
  if (serviceName.includes('städ') || serviceName.includes('clean')) return 'cleaning';
  return 'generic';
};

// Enhanced utility functions with better field detection
const getDateTimeValue = (booking) => {
  // Check multiple possible field names for date/time
  const possibleFields = [
    'bookingDate', 'date', 'appointmentDate', 'scheduledDate',
    'serviceDate', 'selectedDate', 'datetime', 'timestamp',
    'createdAt', 'updatedAt'
  ];
  
  console.log('🕐 Checking date fields in booking:', Object.keys(booking));
  
  for (const field of possibleFields) {
    if (booking[field]) {
      console.log(`✅ Found date in field '${field}':`, booking[field]);
      return booking[field];
    }
  }
  
  // Check nested objects
  if (booking.serviceData?.date) return booking.serviceData.date;
  if (booking.formData?.date) return booking.formData.date;
  if (booking.selections?.date) return booking.selections.date;
  
  console.log('❌ No date field found in booking');
  return null;
};

const getAmountValue = (booking) => {
  // Try multiple possible amount fields
  const amount = 
    booking.totalPrice ||
    booking.totalAmount ||
    booking.amount ||
    booking.price ||
    booking.cost ||
    booking.fee ||
    booking.total ||
    0;
    
  console.log('🔍 Amount value found:', amount, 'from booking:', booking);
  return formatCurrency(amount);
};

// Render service-specific details based on service type
const renderServiceDetails = (booking) => {
  const serviceType = getServiceType(booking);
  const serviceData = booking.serviceData || booking.formData || booking.selections || booking;
  
  console.log('🔍 Service type:', serviceType, 'Service data:', serviceData);
  
  if (serviceType === 'windows') {
    return renderWindowsService(booking);
  } else if (serviceType === 'moveout') {
    return renderMoveOutService(serviceData);
  } else if (serviceType === 'cleaning') {
    return renderCleaningService(serviceData);
  } else {
    return renderGenericService(serviceData);
  }
};

// Windows service details
const renderWindowsService = (booking) => {
  // Extract window data from booking object
  const windowFields = Object.keys(booking).filter(key => key.startsWith('window_'));
  const windowData = windowFields.map(key => ({
    index: key.replace('window_', ''),
    quantity: booking[key]
  })).filter(item => item.quantity > 0);

  // Window type names based on index
  const windowTypeNames = {
    '0': 'Utan ramar - två sidor',
    '1': 'Utan ramar - fyra sidor', 
    '2': 'Med ramar - två sidor',
    '3': 'Med ramar - fyra sidor',
    '4': 'Balkongfönster - två sidor',
    '5': 'Balkongfönster - fyra sidor',
    '6': 'Terrassdörrar - två sidor',
    '7': 'Terrassdörrar - fyra sidor'
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h5 className="text-sm font-medium text-gray-900 mb-4">Fönsterputsning Detaljer</h5>
      
      {windowData.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {windowData.map((item) => (
              <div key={item.index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm text-gray-700">
                  {windowTypeNames[item.index] || `Fönster typ ${item.index}`}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {item.quantity} st
                </span>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Totalt antal fönster:</span>
              <span className="text-lg font-bold text-blue-600">
                {windowData.reduce((sum, item) => sum + item.quantity, 0)} st
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Inga fönster valda</p>
        </div>
      )}
      
      {renderAddons(booking)}
    </div>
  );
};

// Move out service details
const renderMoveOutService = (serviceData) => (
  <div className="bg-gray-50 rounded-xl p-6">
    <h5 className="text-sm font-medium text-gray-900 mb-4">Flyttstädning Detaljer</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Bostadstyp:</span>
          <span className="text-sm font-medium">{serviceData.propertyType || serviceData.type || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Storlek (kvm):</span>
          <span className="text-sm font-medium">{serviceData.squareMeters || serviceData.size || serviceData.sqm || '—'} kvm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Antal rum:</span>
          <span className="text-sm font-medium">{serviceData.rooms || serviceData.roomCount || '—'}</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Badrum:</span>
          <span className="text-sm font-medium">{serviceData.bathrooms || serviceData.bathroomCount || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Kök:</span>
          <span className="text-sm font-medium">{serviceData.kitchen ? 'Ja' : 'Nej'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Balkong/Terrass:</span>
          <span className="text-sm font-medium">{serviceData.balcony ? 'Ja' : 'Nej'}</span>
        </div>
      </div>
    </div>
    {renderAddons(serviceData)}
  </div>
);

// Regular cleaning service details
const renderCleaningService = (serviceData) => (
  <div className="bg-gray-50 rounded-xl p-6">
    <h5 className="text-sm font-medium text-gray-900 mb-4">Städning Detaljer</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Typ av städning:</span>
          <span className="text-sm font-medium">{serviceData.cleaningType || serviceData.type || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Storlek (kvm):</span>
          <span className="text-sm font-medium">{serviceData.squareMeters || serviceData.size || serviceData.sqm || '—'} kvm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Antal rum:</span>
          <span className="text-sm font-medium">{serviceData.rooms || serviceData.roomCount || '—'}</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Badrum:</span>
          <span className="text-sm font-medium">{serviceData.bathrooms || serviceData.bathroomCount || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Kök:</span>
          <span className="text-sm font-medium">{serviceData.kitchen ? 'Ja' : 'Nej'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Frekvens:</span>
          <span className="text-sm font-medium">{serviceData.frequency || 'En gång'}</span>
        </div>
      </div>
    </div>
    {renderAddons(serviceData)}
  </div>
);

// Generic service details
const renderGenericService = (serviceData) => (
  <div className="bg-gray-50 rounded-xl p-6">
    <h5 className="text-sm font-medium text-gray-900 mb-4">Tjänstdetaljer</h5>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Tjänst:</span>
        <span className="text-sm font-medium">{serviceData.service || serviceData.type || '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Beskrivning:</span>
        <span className="text-sm font-medium">{serviceData.description || '—'}</span>
      </div>
    </div>
    {renderAddons(serviceData)}
  </div>
);

// Render add-ons section
const renderAddons = (serviceData) => {
  const addons = Object.entries(serviceData).filter(([key]) => 
    key.startsWith('addon_') && serviceData[key] === true
  );
  
  if (addons.length === 0) return null;
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h6 className="text-sm font-medium text-gray-900 mb-3">Tillägg</h6>
      <div className="space-y-2">
        {addons.map(([key]) => (
          <div key={key} className="flex justify-between">
            <span className="text-sm text-gray-600">{key.replace('addon_', '').replace(/_/g, ' ')}</span>
            <span className="text-sm font-medium text-green-600">✓</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Render detailed price breakdown like in calculator
const renderPriceBreakdown = (booking) => {
  // Extract window data and calculate window pricing
  const windowFields = Object.keys(booking).filter(key => key.startsWith('window_'));
  const windowData = windowFields.map(key => ({
    index: key.replace('window_', ''),
    quantity: booking[key]
  })).filter(item => item.quantity > 0);

  // Window type names and prices (matching the calculator)
  const windowTypeNames = {
    '0': 'Utan ramar - två sidor',
    '1': 'Utan ramar - fyra sidor', 
    '2': 'Med ramar - två sidor',
    '3': 'Med ramar - fyra sidor',
    '4': 'Balkongfönster - två sidor',
    '5': 'Balkongfönster - fyra sidor',
    '6': 'Terrassdörrar - två sidor',
    '7': 'Terrassdörrar - fyra sidor'
  };

  // Window prices (matching the calculator pricing)
  const windowPrices = {
    '0': 90,  // Utan ramar - två sidor
    '1': 90,  // Utan ramar - fyra sidor
    '2': 120, // Med ramar - två sidor
    '3': 120, // Med ramar - fyra sidor
    '4': 150, // Balkongfönster - två sidor
    '5': 150, // Balkongfönster - fyra sidor
    '6': 200, // Terrassdörrar - två sidor
    '7': 250  // Terrassdörrar - fyra sidor
  };

  // Calculate window pricing
  let windowSubtotal = 0;
  let regularWindowCount = 0;
  windowData.forEach(item => {
    const price = windowPrices[item.index] || 0;
    const itemTotal = price * item.quantity;
    windowSubtotal += itemTotal;
    
    // Count regular windows (types 0-5) for minimum price calculation
    if (parseInt(item.index) < 6) {
      regularWindowCount += item.quantity;
    }
  });

  // Apply minimum price if needed (900 kr for regular windows)
  const minimumPrice = 900;
  const finalWindowPrice = (regularWindowCount > 0 && windowSubtotal < minimumPrice) ? minimumPrice : windowSubtotal;

  // Extract add-ons
  const addonFields = Object.keys(booking).filter(key => key.startsWith('addon_'));
  const addons = addonFields.map(key => {
    const addonName = key.replace('addon_', '').replace(/_/g, ' ');
    return {
      name: addonName,
      price: 500, // Standard add-on price
      key: key // Store the original key for filtering
    };
  }).filter(addon => booking[addon.key] === true);

  const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);

  // Calculate base service price (total - addons - window price)
  const totalPrice = booking.totalPrice || 0;
  const baseServicePrice = totalPrice - addonsTotal - finalWindowPrice;

  // Check if RUT was applied
  const rutApplied = booking.rutApplied === true;
  const rutDiscount = rutApplied ? Math.round(totalPrice * 0.3) : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CurrencyEuroIcon className="w-5 h-5 text-blue-600" />
        Detaljerad Prisuppdelning
      </h5>
      
      <div className="space-y-4">
        {/* Base Service */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h6 className="text-sm font-medium text-gray-900 mb-3">Bastjänst</h6>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fönsterputsning</span>
            <span className="text-sm font-medium">{formatCurrency(baseServicePrice)}</span>
          </div>
        </div>

        {/* Window Details */}
        {windowData.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h6 className="text-sm font-medium text-gray-900 mb-3">Fönster Detaljer</h6>
            <div className="space-y-2">
              {windowData.map((item) => {
                const price = windowPrices[item.index] || 0;
                const itemTotal = price * item.quantity;
                return (
                  <div key={item.index} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span className="text-gray-700">{windowTypeNames[item.index]}</span>
                      <span className="text-gray-500 ml-2">({item.quantity} × {formatCurrency(price)})</span>
                    </div>
                    <span className="font-medium">{formatCurrency(itemTotal)}</span>
                  </div>
                );
              })}
              
              {regularWindowCount > 0 && windowSubtotal < minimumPrice && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                  <span className="text-amber-600 font-medium">Minimumpris tillämpat</span>
                  <span className="text-amber-600 font-medium">{formatCurrency(minimumPrice)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-medium">
                <span>Fönster Subtotal</span>
                <span>{formatCurrency(finalWindowPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Add-ons */}
        {addons.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h6 className="text-sm font-medium text-gray-900 mb-3">Tilläggstjänster</h6>
            <div className="space-y-2">
              {addons.map((addon, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 capitalize">{addon.name}</span>
                  <span className="font-medium">+{formatCurrency(addon.price)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-medium">
                <span>Tillägg Subtotal</span>
                <span>+{formatCurrency(addonsTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* RUT Discount */}
        {rutApplied && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h6 className="text-sm font-medium text-green-800 mb-2">RUT Avdrag</h6>
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700">RUT-avdrag (30%)</span>
              <span className="text-green-700 font-medium">-{formatCurrency(rutDiscount)}</span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Totalt att betala</span>
            <span className="text-xl font-bold">{formatCurrency(totalPrice)}</span>
          </div>
          {rutApplied && (
            <div className="text-blue-100 text-sm mt-1">
              Sparat: {formatCurrency(rutDiscount)} med RUT-avdrag
            </div>
          )}
        </div>

        {/* Payment Status */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Betalningsstatus</span>
            <span className={`font-medium ${
              booking.paymentStatus === 'paid' ? 'text-green-600' : 
              booking.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {booking.paymentStatus === 'paid' ? 'Betald' : 
               booking.paymentStatus === 'pending' ? 'Väntande' : 'Obetald'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Inget datum';
  try {
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('sv-SE');
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('sv-SE');
    }
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('sv-SE');
      }
    }
  } catch (error) {
    console.error('Error formatting date:', error, dateValue);
  }
  return 'Inget datum';
};

const formatTime = (dateValue) => {
  if (!dateValue) return 'Ingen tid';
  try {
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch (error) {
    console.error('Error formatting time:', error, dateValue);
  }
  return 'Ingen tid';
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 kr';
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!isNaN(num)) {
      return `${num.toLocaleString('sv-SE')} kr`;
    }
  } catch (error) {
    console.warn('Currency formatting error:', error);
  }
  return '0 kr';
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
      case 'väntande':
        return { 
          color: 'bg-amber-100 text-amber-800 border-amber-200', 
          text: 'Väntande',
          icon: '⏳'
        };
      case 'confirmed':
      case 'bekräftad':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          text: 'Bekräftad',
          icon: '✅'
        };
      case 'completed':
      case 'slutförd':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          text: 'Slutförd',
          icon: '🎉'
        };
      case 'cancelled':
      case 'avbokad':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          text: 'Avbokad',
          icon: '❌'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          text: status || 'Okänd',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};

const BookingTablePremium = ({ bookings = [], loading = false, onBookingUpdate }) => {
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  console.log('📋 BookingTablePremium rendering with', bookings.length, 'bookings');
  
  // Debug: Show actual booking data structure
  if (bookings.length > 0) {
    console.log('🔍 First booking structure:', bookings[0]);
  }
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'bookingDate') {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const handleViewBooking = (booking) => {
    console.log('🔍 === FULL BOOKING DEBUG ===');
    console.log('🔍 Complete booking object:', JSON.stringify(booking, null, 2));
    console.log('🔍 Available fields:', Object.keys(booking));
    console.log('🔍 Field values:');
    Object.keys(booking).forEach(key => {
      console.log(`  ${key}:`, booking[key]);
    });
    
    console.log('🔍 === DATE/TIME FIELDS ===');
    console.log('🔍 bookingDate:', booking.bookingDate);
    console.log('🔍 date:', booking.date);
    console.log('🔍 scheduledDate:', booking.scheduledDate);
    console.log('🔍 time:', booking.time);
    console.log('🔍 createdAt:', booking.createdAt);
    console.log('🔍 updatedAt:', booking.updatedAt);
    
    console.log('🔍 === SERVICE FIELDS ===');
    console.log('🔍 serviceName:', booking.serviceName);
    console.log('🔍 service:', booking.service);
    console.log('🔍 serviceType:', booking.serviceType);
    console.log('🔍 title:', booking.title);
    console.log('🔍 name:', booking.name);
    
    console.log('🔍 === AMOUNT FIELDS ===');
    console.log('🔍 totalAmount:', booking.totalAmount);
    console.log('🔍 amount:', booking.amount);
    console.log('🔍 price:', booking.price);
    console.log('🔍 cost:', booking.cost);
    
    console.log('🔍 === ADDRESS FIELDS ===');
    console.log('🔍 address:', booking.address);
    console.log('🔍 customerAddress:', booking.customerAddress);
    console.log('🔍 location:', booking.location);
    console.log('🔍 serviceAddress:', booking.serviceAddress);
    
    setSelectedBooking(booking);
    setPendingStatus(null);
    setHasUnsavedChanges(false);
    setShowModal(true);
  };
  
  // Handle status selection (first step)
  const handleStatusSelect = (newStatus) => {
    console.log('🔄 Status selected:', newStatus);
    setPendingStatus(newStatus);
    setHasUnsavedChanges(true);
  };
  
  // Handle status save (second step)
  const handleStatusSave = async () => {
    if (!pendingStatus || !selectedBooking) return;
    
    console.log('🔄 Saving status:', selectedBooking.id, pendingStatus);
    
    try {
      // Update the selected booking in modal
      setSelectedBooking(prev => ({ ...prev, status: pendingStatus }));
      
      // Call parent component's update function if available
      if (onBookingUpdate) {
        await onBookingUpdate(selectedBooking.id, { status: pendingStatus });
        console.log('✅ Status updated successfully');
      }
      
      // Reset pending status
      setPendingStatus(null);
      setHasUnsavedChanges(false);
      
      // Success message is now handled by BookingService toast
      
    } catch (error) {
      console.error('❌ Status update failed:', error);
      // Error message is now handled by BookingService toast
    }
  };
  
  // Handle cancel changes
  const handleStatusCancel = () => {
    setPendingStatus(null);
    setHasUnsavedChanges(false);
  };
  
  const handleContactCustomer = (booking, method) => {
    if (method === 'phone' && booking.customerPhone) {
      window.open(`tel:${booking.customerPhone}`);
    } else if (method === 'email' && booking.customerEmail) {
      const subject = encodeURIComponent(`Angående din bokning - ${booking.id}`);
      const body = encodeURIComponent(`Hej ${booking.customerName || 'kund'},\n\nAngående din bokning.\n\nMed vänliga hälsningar,\nDitt städteam`);
      window.open(`mailto:${booking.customerEmail}?subject=${subject}&body=${body}`);
    } else {
      alert(`Ingen ${method === 'phone' ? 'telefonnummer' : 'e-postadress'} tillgänglig för denna kund.`);
    }
  };
  
  const SortableHeader = ({ column, children, icon: Icon }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <span>{children}</span>
        {sortBy === column && (
          sortDirection === 'asc' ? 
            <ChevronUpIcon className="w-4 h-4 text-blue-600" /> : 
            <ChevronDownIcon className="w-4 h-4 text-blue-600" />
        )}
      </div>
    </th>
  );
  
  if (loading) {
    return (
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-300 animate-ping"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Laddar bokningar...</p>
          <p className="text-sm text-gray-500">Hämtar senaste data från systemet</p>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga bokningar hittades</h3>
          <p className="text-gray-500">Det finns inga bokningar att visa för tillfället.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Bokningshantering</h3>
              <p className="text-blue-100 text-sm">{bookings.length} aktiva bokningar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-white font-medium">{sortedBookings.length}</span>
              <span className="text-blue-100 text-sm ml-1">totalt</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortableHeader column="customerName" icon={UserIcon}>
                Kund
              </SortableHeader>
              <SortableHeader column="bookingDate" icon={CalendarDaysIcon}>
                Datum & Tid
              </SortableHeader>
              <SortableHeader column="serviceType" icon={BuildingOfficeIcon}>
                Tjänst
              </SortableHeader>
              <SortableHeader column="status">
                Status
              </SortableHeader>
              <SortableHeader column="totalAmount" icon={CurrencyEuroIcon}>
                Belopp
              </SortableHeader>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Åtgärder
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedBookings.map((booking, index) => (
              <tr key={booking.id || index} className="hover:bg-blue-50/50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {(booking.customerName || 'OK').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.customerName || 'Okänd kund'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3" />
                        {booking.customerEmail || 'Ingen e-post'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                      {formatDate(booking.bookingDate)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      {formatTime(booking.bookingDate)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {getServiceName(booking)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <CurrencyEuroIcon className="w-4 h-4 text-green-500" />
                    {getAmountValue(booking)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Visa
                    </button>
                    <button
                      onClick={() => handleContactCustomer(booking, 'phone')}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      title="Ring kund"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContactCustomer(booking, 'email')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                      title="Skicka e-post"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedBooking && showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header - Scandinavian Elegant */}
            <div className="bg-white border-b border-gray-100 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-light text-gray-900 tracking-wide">Bokningsdetaljer</h3>
                    <p className="text-gray-500 text-sm font-light mt-1">#{selectedBooking.id?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-8">
              {/* Customer Information */}
              <div className="">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h4 className="text-lg font-light text-gray-900 tracking-wide">Kundinformation</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Namn</p>
                    <p className="text-base font-light text-gray-900">{selectedBooking.customerName || selectedBooking.name || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">E-post</p>
                    <p className="text-base font-light text-gray-900">{selectedBooking.customerEmail || selectedBooking.email || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</p>
                    <p className="text-base font-light text-gray-900">{selectedBooking.customerPhone || selectedBooking.phone || selectedBooking.phoneNumber || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Adress</p>
                    <p className="text-base font-light text-gray-900">{selectedBooking.address || selectedBooking.customerAddress || selectedBooking.location || selectedBooking.serviceAddress || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Service Details - Dynamic based on service type */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  <h4 className="text-lg font-light text-gray-900 tracking-wide">Tjänstdetaljer</h4>
                </div>
                {renderServiceDetails(selectedBooking)}
              </div>

              {/* Booking Information */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                  <h4 className="text-lg font-light text-gray-900 tracking-wide">Bokningsinformation</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</p>
                    <p className="text-base font-light text-gray-900">{formatDate(getDateTimeValue(selectedBooking))}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tid</p>
                    <p className="text-base font-light text-gray-900">{formatTime(getDateTimeValue(selectedBooking))}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Boknings-ID</p>
                    <p className="text-base font-light text-gray-900">#{selectedBooking.id?.slice(-8) || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Skapad</p>
                    <p className="text-base font-light text-gray-900">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-yellow-600 rounded-full"></div>
                  <h4 className="text-lg font-light text-gray-900 tracking-wide">Prisuppdelning</h4>
                </div>
                {renderPriceBreakdown(selectedBooking)}
              </div>

              {/* Status Management */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
                  <h4 className="text-lg font-light text-gray-900 tracking-wide">Statushantering</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nuvarande Status</p>
                        <StatusBadge status={selectedBooking.status} />
                      </div>
                      {pendingStatus && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-orange-500 uppercase tracking-wider">Ny Status (Osparad)</p>
                          <StatusBadge status={pendingStatus} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Selection Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStatusSelect('confirmed')}
                      className={`px-4 py-2 text-sm font-light border rounded-lg transition-all duration-200 ${
                        pendingStatus === 'confirmed'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      Bekräfta
                    </button>
                    <button
                      onClick={() => handleStatusSelect('completed')}
                      className={`px-4 py-2 text-sm font-light border rounded-lg transition-all duration-200 ${
                        pendingStatus === 'completed'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      Slutför
                    </button>
                    <button
                      onClick={() => handleStatusSelect('cancelled')}
                      className={`px-4 py-2 text-sm font-light border rounded-lg transition-all duration-200 ${
                        pendingStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      Avboka
                    </button>
                  </div>
                  
                  {/* Save/Cancel Buttons */}
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={handleStatusSave}
                        className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                      >
                        Spara
                      </button>
                      <button
                        onClick={handleStatusCancel}
                        className="px-4 py-2 text-sm font-light text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Ångra
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="border-t border-gray-100 pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-gray-600 rounded-full"></div>
                    <h4 className="text-lg font-light text-gray-900 tracking-wide">Anteckningar</h4>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                    <p className="text-gray-700">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-6 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleContactCustomer(selectedBooking, 'phone')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-light bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    Ring
                  </button>
                  <button
                    onClick={() => handleContactCustomer(selectedBooking, 'email')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-light bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    E-post
                  </button>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-sm font-light text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Stäng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTablePremium;

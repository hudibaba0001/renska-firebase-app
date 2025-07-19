// webapp/src/components/BookingStatusManager.jsx
import React, { useState } from 'react';
import { Badge, Button, Select, TextInput, Modal } from 'flowbite-react';
import { HiCheck, HiX, HiClock, HiExclamation } from 'react-icons/hi';
import BookingService from '../services/bookingService';

const BookingStatusManager = ({ booking, onStatusUpdate, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(booking.status);
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Väntande', icon: HiClock, color: 'yellow' },
    { value: 'confirmed', label: 'Bekräftad', icon: HiCheck, color: 'blue' },
    { value: 'completed', label: 'Slutförd', icon: HiCheck, color: 'green' },
    { value: 'cancelled', label: 'Avbokad', icon: HiX, color: 'red' }
  ];

  const getCurrentStatus = () => {
    return statusOptions.find(option => option.value === booking.status) || statusOptions[0];
  };

  const getSelectedStatus = () => {
    return statusOptions.find(option => option.value === selectedStatus) || statusOptions[0];
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === booking.status) {
      setIsModalOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const success = await BookingService.updateBookingStatus(
        booking.id, 
        selectedStatus, 
        adminNote
      );

      if (success) {
        onStatusUpdate && onStatusUpdate(booking.id, selectedStatus);
        setIsModalOpen(false);
        setAdminNote('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusBadge = ({ status, size = 'sm' }) => {
    const statusConfig = statusOptions.find(option => option.value === status);
    const Icon = statusConfig?.icon || HiClock;
    
    return (
      <Badge 
        color={statusConfig?.color || 'gray'} 
        size={size}
        className="flex items-center gap-1"
      >
        <Icon className="w-3 h-3" />
        {statusConfig?.label || status}
      </Badge>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Status Badge */}
      <StatusBadge status={booking.status} />

      {/* Change Status Button */}
      <Button
        size="xs"
        color="gray"
        onClick={() => setIsModalOpen(true)}
        className="text-xs"
      >
        Ändra
      </Button>

      {/* Status Update Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <Modal.Header>
          Uppdatera bokningsstatus
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {/* Booking Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Bokningsdetaljer</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Kund:</span> {booking.customerName}</p>
                <p><span className="font-medium">Tjänst:</span> {booking.serviceName}</p>
                <p><span className="font-medium">Datum:</span> {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('sv-SE') : 'Ej angivet'}</p>
                <p><span className="font-medium">Nuvarande status:</span> <StatusBadge status={booking.status} /></p>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ny status
              </label>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Change Preview */}
            {selectedStatus !== booking.status && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800">
                  <HiExclamation className="w-4 h-4" />
                  <span className="text-sm font-medium">Statusändring</span>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  <StatusBadge status={booking.status} /> → <StatusBadge status={selectedStatus} />
                </div>
              </div>
            )}

            {/* Admin Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anteckning (valfritt)
              </label>
              <TextInput
                placeholder="Lägg till en anteckning om statusändringen..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>

            {/* Status History */}
            {booking.statusHistory && booking.statusHistory.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Statushistorik</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {booking.statusHistory.map((entry, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={entry.status} />
                        <span>{entry.timestamp ? new Date(entry.timestamp.toDate()).toLocaleDateString('sv-SE') : 'Okänt datum'}</span>
                      </div>
                      {entry.note && (
                        <p className="mt-1 text-gray-500">{entry.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleStatusUpdate}
            disabled={isUpdating || selectedStatus === booking.status}
            isProcessing={isUpdating}
          >
            {isUpdating ? 'Uppdaterar...' : 'Uppdatera status'}
          </Button>
          <Button
            color="gray"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedStatus(booking.status);
              setAdminNote('');
            }}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingStatusManager;

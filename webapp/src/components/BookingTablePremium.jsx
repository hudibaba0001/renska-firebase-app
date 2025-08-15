import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Badge,
  Dropdown,
  TextInput,
  Select,
  Spinner
} from 'flowbite-react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getBookings, updateBooking, deleteBooking, getBookingStatuses } from '../services/bookingService';
import toast from 'react-hot-toast';

const BookingTablePremium = ({ companyId }) => {
  // State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize] = useState(20);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    searchTerm: ''
  });
  
  // Fetch bookings
  const fetchBookings = async (reset = false) => {
    try {
      setLoading(true);
      
      const result = await getBookings(companyId, {
        ...filters,
        pageSize,
        lastDoc: reset ? null : lastDoc
      });
      
      setBookings(reset ? result.bookings : [...bookings, ...result.bookings]);
      setLastDoc(result.lastDoc);
      setHasMore(result.bookings.length === pageSize);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    fetchBookings(true);
  }, [companyId, filters]);
  
  // Handle status change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBooking(companyId, bookingId, { status: newStatus });
      // Refresh bookings
      fetchBookings(true);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };
  
  // Handle booking deletion
  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(companyId, bookingId);
        // Refresh bookings
        fetchBookings(true);
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'warning', icon: ClockIcon },
      confirmed: { color: 'info', icon: CheckCircleIcon },
      completed: { color: 'success', icon: CheckCircleIcon },
      cancelled: { color: 'failure', icon: XCircleIcon }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge color={config.color} className="flex items-center gap-1">
        <Icon className="w-4 h-4" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          type="text"
          placeholder="Search bookings..."
          value={filters.searchTerm}
          onChange={(e) => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
        />
        
        <Select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {getBookingStatuses().map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        
        <input
          type="date"
          className="rounded-lg border-gray-300"
          value={filters.date}
          onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))}
        />
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.HeadCell>Date & Time</Table.HeadCell>
            <Table.HeadCell>Customer</Table.HeadCell>
            <Table.HeadCell>Service</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          
          <Table.Body>
            {bookings.map(booking => (
              <Table.Row key={booking.id} className="bg-white">
                <Table.Cell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4" />
                      {booking.time}
                    </div>
                  </div>
                </Table.Cell>
                
                <Table.Cell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      {booking.customerName}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <PhoneIcon className="w-4 h-4" />
                      {booking.customerPhone}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <EnvelopeIcon className="w-4 h-4" />
                      {booking.customerEmail}
                    </div>
                  </div>
                </Table.Cell>
                
                <Table.Cell>
                  <div className="flex flex-col">
                    <div>{booking.serviceName}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4" />
                      {booking.area} m² {booking.rooms && `(${booking.rooms} rooms)`}
                    </div>
                    {booking.frequency !== 'one-time' && (
                      <Badge color="purple" className="mt-1">
                        {booking.frequency}
                      </Badge>
                    )}
                  </div>
                </Table.Cell>
                
                <Table.Cell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                      {booking.finalPrice} kr
                    </div>
                    {booking.rutDiscount > 0 && (
                      <div className="text-sm text-green-600">
                        RUT: -{booking.rutDiscount} kr
                      </div>
                    )}
                  </div>
                </Table.Cell>
                
                <Table.Cell>
                  <Dropdown
                    label={<StatusBadge status={booking.status} />}
                    size="sm"
                  >
                    {getBookingStatuses().map(status => (
                      <Dropdown.Item
                        key={status.value}
                        onClick={() => handleStatusChange(booking.id, status.value)}
                      >
                        {status.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </Table.Cell>
                
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <Button size="xs" color="light">
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button size="xs" color="light">
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleDelete(booking.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      
      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => fetchBookings()}
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingTablePremium;
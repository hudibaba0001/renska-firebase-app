<<<<<<< HEAD
// webapp/src/pages/BookingPage.jsx
=======
// src/pages/BookingPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db }                           from '../firebase/init'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import BookingCalculator from '../components/BookingCalculator'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/init'
>>>>>>> parent of 214ec97 (new)

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookingCalculator from '../components/BookingCalculator';
import BookingForm from '../components/BookingForm';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/init';
// Import the necessary service functions.
import { getTenant, getAllServicesForCompany, getAllBookingsForCompany } from '../services/firestore';
import { Spinner, Alert, Table, Modal, Button } from 'flowbite-react';

/**
 * Public-facing page for a customer to make a booking.
 * It fetches the necessary configuration for a specific company and form.
 */
export default function BookingPage() {
<<<<<<< HEAD
  const { companyId, formId } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
=======
  const { companyId } = useParams()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  console.log('🔧 BookingPage rendered with companyId:', companyId)

  useEffect(() => {
    console.log('🔧 useEffect triggered for companyId:', companyId)
>>>>>>> parent of 214ec97 (new)
    async function loadConfig() {
      setLoading(true);
      setError('');
      try {
<<<<<<< HEAD
        if (!companyId) {
          setError("No company specified.");
          return;
        }

        // Fetch the main company configuration using the service layer.
        const companyData = await getTenant(companyId);
        if (!companyData) {
          setError(`No company found for "${companyId}".`);
          return;
        }

        // Fetch all services for this company.
        const allServices = await getAllServicesForCompany(companyId);

        // If a specific formId is provided, filter services based on the form's configuration.
        // NOTE: This assumes the form configuration is stored within the company document.
        // If forms are in a subcollection, this would need another service function.
        if (formId && companyData.forms && companyData.forms[formId]) {
            const formConfig = companyData.forms[formId];
            const selectedServiceIds = new Set(formConfig.selectedServices || []);
            const availableServices = allServices.filter(service => selectedServiceIds.has(service.id));
            
            const mergedConfig = { ...companyData, ...formConfig, services: availableServices, formMode: true };
            setConfig(mergedConfig);
        } else {
            // If no formId or form not found, use all company services.
            setConfig({ ...companyData, services: allServices, formMode: false });
        }

=======
        console.log('🔧 Loading config for companyId:', companyId)
        const ref  = doc(db, 'companies', companyId)
        const snap = await getDoc(ref)
        console.log('🔧 Firestore response:', snap.exists() ? 'exists' : 'not found')
        if (!snap.exists()) {
          setError(`No config found for "${companyId}".`)
        } else {
          setConfig(snap.data())
        }
>>>>>>> parent of 214ec97 (new)
      } catch (e) {
        console.error('Error loading configuration:', e);
        setError('Failed to load booking configuration.');
      } finally {
        setLoading(false);
      }
    }
<<<<<<< HEAD
    loadConfig();
  }, [companyId, formId]);
=======
    loadConfig()
  }, [companyId])
>>>>>>> parent of 214ec97 (new)

  if (loading) return <div className="p-6 text-center"><Spinner /></div>;
  if (error) return <div className="p-6"><Alert color="failure">{error}</Alert></div>;

  return (
<<<<<<< HEAD
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {config?.formMode ? (config.name || 'Booking Calculator') : `New Booking for ${config?.name}`}
      </h1>
      {/* The BookingForm will handle the actual creation of the booking */}
      <BookingForm config={config} companyId={companyId} />
=======
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Booking for: <span className="capitalize">{companyId}</span>
        </h1>
        <BookingCalculator />
      </div>
>>>>>>> parent of 214ec97 (new)
    </div>
  );
}

/**
 * Admin dashboard to view bookings for a specific company.
 */
export function AdminDashboard() {
  const { companyId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!companyId) return;
    async function fetchBookings() {
      setLoading(true);
      setError('');
      try {
        // Use the correct service function to fetch bookings from the subcollection.
        const companyBookings = await getAllBookingsForCompany(companyId);
        setBookings(companyBookings);
      } catch (e) {
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [companyId]);

  const handleSignOut = () => signOut(auth).catch(e => console.error('Sign out failed', e));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard: {companyId}</h1>
        <div>
          <Link to={`/admin/${companyId}/config`} className="text-blue-600 hover:underline mr-4">Calculator Config</Link>
          <Button onClick={handleSignOut} color="light">Sign Out</Button>
        </div>
      </div>
      {loading && <div className="text-center"><Spinner /></div>}
      {error && <Alert color="failure">{error}</Alert>}
      <Card>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Customer</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Total</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {bookings.map(b => (
              <Table.Row key={b.id} onClick={() => setSelectedBooking(b)} className="cursor-pointer">
                <Table.Cell>{b.createdAt?.toDate?.().toLocaleString() || 'N/A'}</Table.Cell>
                <Table.Cell>{b.customerName || 'N/A'}</Table.Cell>
                <Table.Cell><Badge color={b.status === 'confirmed' ? 'success' : 'warning'}>{b.status}</Badge></Table.Cell>
                <Table.Cell>{b.totalPrice} kr</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {bookings.length === 0 && !loading && <div className="text-center p-4">No bookings found.</div>}
      </Card>

      <Modal show={!!selectedBooking} onClose={() => setSelectedBooking(null)}>
        <Modal.Header>Booking Details</Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="space-y-2">
              <p><strong>Date:</strong> {selectedBooking.createdAt?.toDate?.().toLocaleString()}</p>
              <p><strong>Customer:</strong> {selectedBooking.customerName}</p>
              <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              <p><strong>Total Price:</strong> {selectedBooking.totalPrice} kr</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookingCalculator from '../components/BookingCalculator';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/init';
// Import the necessary service functions.
import { getTenant, getAllServicesForCompany, getAllBookingsForCompany } from '../services/firestore';
import { Spinner, Alert, Table, Modal, Button } from 'flowbite-react';
import { db } from '../firebase/init';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Public-facing page for a customer to make a booking.
 * It fetches the necessary configuration for a specific company and form.
 */
export default function BookingPage() {
  const { companyId, formSlug } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      setError('');
      try {
        if (!companyId) {
          setError("No company specified.");
          return;
        }

        console.log('🔍 Loading config for company:', companyId, 'formSlug:', formSlug);

        // Fetch the main company configuration using the service layer.
        const companyData = await getTenant(companyId);
        console.log('🏢 Fetched company data:', companyData);
        
        if (!companyData) {
          setError(`No company found for "${companyId}".`);
          return;
        }

        // Fetch all services for this company.
        const allServices = await getAllServicesForCompany(companyId);
        console.log('🔧 Fetched services:', allServices);

        // If a specific formSlug is provided, load the form configuration from calculators collection
        if (formSlug) {
          console.log('🔍 Loading form configuration for slug:', formSlug);
          
          // First try to find the calculator by slug
          const calculatorsRef = collection(db, 'companies', companyId, 'calculators');
          const slugQuery = query(calculatorsRef, where('slug', '==', formSlug));
          const slugSnapshot = await getDocs(slugQuery);
          
          let formConfig = null;
          if (!slugSnapshot.empty) {
            // Found by slug
            const formDoc = slugSnapshot.docs[0];
            formConfig = { id: formDoc.id, ...formDoc.data() };
            console.log('🔍 Found form by slug:', formConfig);
          } else {
            // Try to find by ID (in case formSlug is actually an ID)
            try {
              const formDoc = await getDoc(doc(db, 'companies', companyId, 'calculators', formSlug));
              if (formDoc.exists()) {
                formConfig = { id: formDoc.id, ...formDoc.data() };
                console.log('🔍 Found form by ID:', formConfig);
              }
            } catch {
              console.log('🔍 Form not found by ID either');
            }
          }
          
          if (formConfig) {
            // Filter services based on the form's selectedServiceIds
            let filteredServices = allServices;
            if (formConfig.selectedServiceIds && Array.isArray(formConfig.selectedServiceIds)) {
              filteredServices = allServices.filter(service => 
                formConfig.selectedServiceIds.includes(service.id)
              );
              console.log('🔍 Filtered services based on selectedServiceIds:', filteredServices);
            }
            
            // Merge company config with form config
            const mergedConfig = { 
              ...companyData, 
              ...formConfig, 
              services: filteredServices,
              formMode: true 
            };
            console.log('📋 Merged config with form:', mergedConfig);
            setConfig(mergedConfig);
          } else {
            setError(`Form "${formSlug}" not found.`);
            return;
          }
        } else {
          // If no formSlug, use all company services.
          const fullConfig = { ...companyData, services: allServices, formMode: false };
          console.log('📋 Full config without form:', fullConfig);
          setConfig(fullConfig);
        }

      } catch (e) {
        console.error('Error loading configuration:', e);
        setError('Failed to load booking configuration.');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [companyId, formSlug]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner />
        <p className="mt-4">Laddar...</p>
      </div>
    );
  }
  
  if (error) return <div className="p-6"><Alert color="failure">{error}</Alert></div>;

  // Get company name for display
  const companyName = config?.name || config?.companyName || 'Company';

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {config?.formMode ? (companyName || 'Booking Calculator') : `New Booking for ${companyName}`}
      </h1>
      {/* The BookingForm will handle the actual creation of the booking */}
      <BookingCalculator config={config} companyId={companyId} />
    </div>
  );
}

/**
 * Admin dashboard to view bookings for a specific company.
 */
export function AdminDashboard() {
  const { companyId } = useParams();
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
        await getAllBookingsForCompany(companyId);
        // setBookings(companyBookings); // This line was removed as per the edit hint.
      } catch (error) {
        console.error('Error loading bookings:', error);
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [companyId]);

  const handleSignOut = () => signOut(auth).catch(error => console.error('Sign out failed', error));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard: {companyId}</h1>
        <div>
          <Link to={`/admin/${companyId}/config`} className="text-text-main hover:underline mr-4">Calculator Config</Link>
          <Button onClick={handleSignOut} color="light">Sign Out</Button>
        </div>
      </div>
      {loading && <div className="text-center"><Spinner /></div>}
      {error && <Alert color="failure">{error}</Alert>}
      {/* The Card and Table components are not imported, so this section will not render as intended */}
      {/* Assuming Card and Badge are available from flowbite-react or similar */}
      {/* <Card>
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
      </Card> */}

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

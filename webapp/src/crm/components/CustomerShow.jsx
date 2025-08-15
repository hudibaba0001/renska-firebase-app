import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const CustomerShow = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id, companyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const docRef = doc(db, `companies/${companyId}/customers`, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setCustomer({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such customer!');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
          <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('customers')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('customers')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Customers</span>
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`customers/${id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600">{customer.email}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{customer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{customer.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="text-gray-900">{customer.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Postal Code</label>
                  <p className="text-gray-900">{customer.postalCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-gray-900">{customer.country}</p>
                </div>
              </div>
            </div>
          </div>
          
          {customer.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{customer.notes}</p>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {customer.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {customer.updatedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerShow;
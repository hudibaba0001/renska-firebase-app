import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from 'flowbite-react';
import { db } from '../firebase/init';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

export default function AdminCouponsPage() {
  const { companyId } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'amount', // 'amount' or 'percentage'
    discountAmount: '',
    appliesTo: 'all', // 'all' or 'specific'
    selectedServices: [],
    expiresAt: '',
    doesntExpire: false,
    restrictToExpirationDate: false,
    usageLimit: '',
    limitUsage: false,
    canCombineWithRecurring: false,
    applyToRecurring: 'all' // 'all' or 'first'
  });

  useEffect(() => {
    loadCoupons();
    loadServices();
  }, [companyId]);

  const checkPermissions = async () => {
    try {
      console.log('=== PERMISSION CHECK ===');
      console.log('Company ID:', companyId);
      console.log('Current User UID:', currentUser?.uid);
      console.log('User Email:', currentUser?.email);
      console.log('Custom Claims:', currentUser?.customClaims);

      // Try to get the company document to check adminUid
      const companyRef = doc(db, 'companies', companyId);
      const companyDoc = await getDocs(collection(db, 'companies'));
      console.log('Company documents accessible:', companyDoc.docs.length);

      // Try to get specific company
      const specificCompany = await getDoc(companyRef);
      if (specificCompany.exists()) {
        console.log('Company data:', specificCompany.data());
        console.log('Company adminUid:', specificCompany.data().adminUid);
        console.log('User is admin?', specificCompany.data().adminUid === currentUser?.uid);
      } else {
        console.log('Company document does not exist or no access');
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const loadCoupons = async () => {
    try {
      console.log('Loading coupons for company:', companyId);
      console.log('Current user:', currentUser);

      // Check permissions first
      await checkPermissions();

      const couponsRef = collection(db, 'companies', companyId, 'coupons');
      const snapshot = await getDocs(couponsRef);
      const couponsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoupons(couponsData);
      console.log('Loaded coupons:', couponsData);
    } catch (error) {
      console.error('Error loading coupons:', error);
      console.error('Error details:', error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const servicesRef = collection(db, 'companies', companyId, 'services');
      const snapshot = await getDocs(servicesRef);
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('Attempting to save coupon...');
      console.log('Company ID:', companyId);
      console.log('Current User:', currentUser);
      console.log('Form Data:', formData);

      const couponData = {
        ...formData,
        discountAmount: parseFloat(formData.discountAmount),
        usageLimit: formData.limitUsage ? parseInt(formData.usageLimit) : null,
        expiresAt: formData.doesntExpire ? null : formData.expiresAt,
        restrictToExpirationDate: formData.restrictToExpirationDate,
        canCombineWithRecurring: formData.canCombineWithRecurring,
        applyToRecurring: formData.applyToRecurring,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Coupon Data to save:', couponData);

      if (editingCoupon) {
        console.log('Updating existing coupon:', editingCoupon.id);
        await updateDoc(doc(db, 'companies', companyId, 'coupons', editingCoupon.id), couponData);
      } else {
        console.log('Creating new coupon...');
        const docRef = await addDoc(collection(db, 'companies', companyId, 'coupons'), couponData);
        console.log('Coupon created with ID:', docRef.id);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingCoupon(null);
      resetForm();
      loadCoupons();
      console.log('Coupon saved successfully!');
    } catch (error) {
      console.error('Error saving coupon:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      alert(`Error saving coupon: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount.toString(),
      appliesTo: coupon.appliesTo,
      selectedServices: coupon.selectedServices || [],
      expiresAt: coupon.expiresAt || '',
      doesntExpire: !coupon.expiresAt,
      restrictToExpirationDate: coupon.restrictToExpirationDate || false,
      usageLimit: coupon.usageLimit?.toString() || '',
      limitUsage: !!coupon.usageLimit,
      canCombineWithRecurring: coupon.canCombineWithRecurring || false,
      applyToRecurring: coupon.applyToRecurring || 'all'
    });
    setShowEditModal(true);
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteDoc(doc(db, 'companies', companyId, 'coupons', couponId));
        loadCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'amount',
      discountAmount: '',
      appliesTo: 'all',
      selectedServices: [],
      expiresAt: '',
      doesntExpire: false,
      restrictToExpirationDate: false,
      usageLimit: '',
      limitUsage: false,
      canCombineWithRecurring: false,
      applyToRecurring: 'all'
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountAmount}%`;
    }
    return `$${coupon.discountAmount}`;
  };

  const formatExpiration = (coupon) => {
    if (!coupon.expiresAt) return 'Never expires';
    return new Date(coupon.expiresAt).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600">Manage promotional coupons and discounts</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons List */}
      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <TagIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{coupon.code}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {formatDiscount(coupon)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Expires: {formatExpiration(coupon)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    <span>Applies to: {coupon.appliesTo === 'all' ? 'All services' : `${coupon.selectedServices?.length || 0} services`}</span>
                  </div>
                  {coupon.usageLimit && (
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>Usage limit: {coupon.usageLimit}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="light"
                  onClick={() => handleEdit(coupon)}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => handleDelete(coupon.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
            <p className="text-gray-600 mb-4">Create your first coupon to start offering discounts to customers.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </div>
        )}
      </div>

      {/* Create Coupon Modal - Zenbooker Style */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Coupon</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.code || !formData.discountAmount || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Coupon Code Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Coupon code</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Enter coupon code"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateCouponCode}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Autogenerate code
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Customers will enter this code when booking online</p>
                </div>
              </div>

              {/* Discount Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Discount</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="amount">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.discountAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value }))}
                        placeholder="25"
                        required
                        className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute left-3 top-2 text-gray-500">
                        {formData.discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applies to Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Applies to</h3>
                <p className="text-sm text-gray-600 mb-4">Select the services that this coupon can be applied to</p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="all-services"
                      name="appliesTo"
                      value="all"
                      checked={formData.appliesTo === 'all'}
                      onChange={(e) => setFormData(prev => ({ ...prev, appliesTo: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="all-services" className="ml-3 text-sm font-medium text-gray-700">
                      All services
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="specific-services"
                      name="appliesTo"
                      value="specific"
                      checked={formData.appliesTo === 'specific'}
                      onChange={(e) => setFormData(prev => ({ ...prev, appliesTo: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="specific-services" className="ml-3 text-sm font-medium text-gray-700">
                      Specific services
                    </label>
                  </div>

                  {formData.appliesTo === 'specific' && (
                    <div className="ml-7 space-y-3">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={formData.selectedServices.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedServices: [...prev.selectedServices, service.id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedServices: prev.selectedServices.filter(id => id !== service.id)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`service-${service.id}`} className="ml-3 text-sm text-gray-700">
                            {service.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Expiration Date Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expiration date</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="doesnt-expire"
                      checked={formData.doesntExpire}
                      onChange={(e) => setFormData(prev => ({ ...prev, doesntExpire: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="doesnt-expire" className="ml-3 text-sm font-medium text-gray-700">
                      Doesn't expire
                    </label>
                  </div>

                  {!formData.doesntExpire && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Use by</label>
                      <input
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                        required={!formData.doesntExpire}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="restrict-expiration"
                      checked={formData.restrictToExpirationDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, restrictToExpirationDate: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="restrict-expiration" className="ml-3 text-sm text-gray-700">
                      Restrict coupon to appointments on or before expiration date
                    </label>
                  </div>
                </div>
              </div>

              {/* Usage Limits Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usage limits</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="limit-usage"
                      checked={formData.limitUsage}
                      onChange={(e) => setFormData(prev => ({ ...prev, limitUsage: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="limit-usage" className="ml-3 text-sm font-medium text-gray-700">
                      Limit the total number of times this coupon can be redeemed
                    </label>
                  </div>

                  {formData.limitUsage && (
                    <div className="ml-7">
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                        placeholder="100"
                        required={formData.limitUsage}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="combine-recurring"
                      checked={formData.canCombineWithRecurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, canCombineWithRecurring: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="combine-recurring" className="ml-3 text-sm font-medium text-gray-700">
                      This coupon can be combined with recurring booking discounts
                    </label>
                    <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 ml-2" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">For recurring bookings, apply coupon to...</label>
                    <select
                      value={formData.applyToRecurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, applyToRecurring: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All jobs in recurring series</option>
                      <option value="first">First job only</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Coupon</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.code || !formData.discountAmount || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Same form content as create modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Same form sections as above */}
              {/* ... (form content would be identical to create modal) ... */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon
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
  query,
  where 
} from 'firebase/firestore';

export default function AdminCouponsPage() {
  const { companyId } = useParams();
  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const loadCoupons = async () => {
    try {
      const couponsRef = collection(db, 'companies', companyId, 'coupons');
      const snapshot = await getDocs(couponsRef);
      const couponsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error loading coupons:', error);
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
    
    try {
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

      if (editingCoupon) {
        await updateDoc(doc(db, 'companies', companyId, 'coupons', editingCoupon.id), couponData);
      } else {
        await addDoc(collection(db, 'companies', companyId, 'coupons'), couponData);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingCoupon(null);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
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

      {/* Create Coupon Modal - Simplified */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Coupon</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter coupon code"
                    required
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button 
                    type="button" 
                    onClick={generateCouponCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    required
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="amount">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <input
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value }))}
                    placeholder="25"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.code || !formData.discountAmount}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
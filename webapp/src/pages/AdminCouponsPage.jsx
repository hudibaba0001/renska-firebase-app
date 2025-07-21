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
import { Button, Modal, TextInput, Select, Checkbox, Label } from 'flowbite-react';
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

      {/* Create Coupon Modal */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} size="2xl">
        <Modal.Header>Create Coupon</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Code */}
            <div>
              <Label htmlFor="code">Coupon code</Label>
              <div className="flex gap-2">
                <TextInput
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter coupon code"
                  required
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  color="light"
                  onClick={generateCouponCode}
                >
                  Autogenerate code
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Customers will enter this code when booking online</p>
            </div>

            {/* Discount */}
            <div>
              <Label>Discount</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    required
                  >
                    <option value="amount">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </Select>
                </div>
                <div>
                  <TextInput
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value }))}
                    placeholder={formData.discountType === 'percentage' ? '25' : '25'}
                    required
                    addon={formData.discountType === 'percentage' ? '%' : '$'}
                  />
                </div>
              </div>
            </div>

            {/* Applies to */}
            <div>
              <Label>Applies to</Label>
              <p className="text-sm text-gray-500 mb-3">Select the services that this coupon can be applied to</p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-services"
                    name="appliesTo"
                    value="all"
                    checked={formData.appliesTo === 'all'}
                    onChange={(e) => setFormData(prev => ({ ...prev, appliesTo: e.target.value }))}
                    className="mr-2"
                  />
                  <Label htmlFor="all-services">All services</Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="specific-services"
                    name="appliesTo"
                    value="specific"
                    checked={formData.appliesTo === 'specific'}
                    onChange={(e) => setFormData(prev => ({ ...prev, appliesTo: e.target.value }))}
                    className="mr-2"
                  />
                  <Label htmlFor="specific-services">Specific services</Label>
                </div>
                
                {formData.appliesTo === 'specific' && (
                  <div className="ml-6 space-y-2">
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
                          className="mr-2"
                        />
                        <Label htmlFor={`service-${service.id}`}>{service.name}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <Label>Expiration date</Label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="doesnt-expire"
                    checked={formData.doesntExpire}
                    onChange={(e) => setFormData(prev => ({ ...prev, doesntExpire: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="doesnt-expire">Doesn't expire</Label>
                </div>
                
                {!formData.doesntExpire && (
                  <div>
                    <TextInput
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                      required={!formData.doesntExpire}
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="restrict-expiration"
                    checked={formData.restrictToExpirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, restrictToExpirationDate: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="restrict-expiration">Restrict coupon to appointments on or before expiration date</Label>
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div>
              <Label>Usage limits</Label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="limit-usage"
                    checked={formData.limitUsage}
                    onChange={(e) => setFormData(prev => ({ ...prev, limitUsage: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="limit-usage">Limit the total number of times this coupon can be redeemed</Label>
                </div>
                
                {formData.limitUsage && (
                  <div>
                    <TextInput
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                      placeholder="100"
                      required={formData.limitUsage}
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="combine-recurring"
                    checked={formData.canCombineWithRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, canCombineWithRecurring: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="combine-recurring">This coupon can be combined with recurring booking discounts</Label>
                </div>
                
                <div>
                  <Label>For recurring bookings, apply coupon to...</Label>
                  <Select
                    value={formData.applyToRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, applyToRecurring: e.target.value }))}
                  >
                    <option value="all">All jobs in recurring series</option>
                    <option value="first">First job only</option>
                  </Select>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button color="light" onClick={() => setShowCreateModal(false)}>
            Discard
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.code || !formData.discountAmount}>
            Create Coupon
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Coupon Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} size="2xl">
        <Modal.Header>Edit Coupon</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Same form fields as create modal */}
            {/* Coupon Code */}
            <div>
              <Label htmlFor="edit-code">Coupon code</Label>
              <div className="flex gap-2">
                <TextInput
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter coupon code"
                  required
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  color="light"
                  onClick={generateCouponCode}
                >
                  Autogenerate code
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Customers will enter this code when booking online</p>
            </div>

            {/* Discount */}
            <div>
              <Label>Discount</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    required
                  >
                    <option value="amount">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </Select>
                </div>
                <div>
                  <TextInput
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value }))}
                    placeholder={formData.discountType === 'percentage' ? '25' : '25'}
                    required
                    addon={formData.discountType === 'percentage' ? '%' : '$'}
                  />
                </div>
              </div>
            </div>

            {/* Applies to */}
            <div>
              <Label>Applies to</Label>
              <p className="text-sm text-gray-500 mb-3">Select the services that this coupon can be applied to</p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="edit-all-services"
                    name="edit-appliesTo"
                    value="all"
                    checked={formData.appliesTo === 'all'}
                    onChange={(e) => setFormData(prev => ({ ...prev, appliesTo: e.target.value }))}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-all-services">All services</Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="edit-specific-services"
                    name="edit-appliesTo"
                    value="specific"
                    checked={formData.appliesTo === 'specific'}
                    onChange={(e) => setFormData(prev => ({ ...prev, appliesTo: e.target.value }))}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-specific-services">Specific services</Label>
                </div>
                
                {formData.appliesTo === 'specific' && (
                  <div className="ml-6 space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-service-${service.id}`}
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
                          className="mr-2"
                        />
                        <Label htmlFor={`edit-service-${service.id}`}>{service.name}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <Label>Expiration date</Label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-doesnt-expire"
                    checked={formData.doesntExpire}
                    onChange={(e) => setFormData(prev => ({ ...prev, doesntExpire: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-doesnt-expire">Doesn't expire</Label>
                </div>
                
                {!formData.doesntExpire && (
                  <div>
                    <TextInput
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                      required={!formData.doesntExpire}
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-restrict-expiration"
                    checked={formData.restrictToExpirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, restrictToExpirationDate: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-restrict-expiration">Restrict coupon to appointments on or before expiration date</Label>
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div>
              <Label>Usage limits</Label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-limit-usage"
                    checked={formData.limitUsage}
                    onChange={(e) => setFormData(prev => ({ ...prev, limitUsage: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-limit-usage">Limit the total number of times this coupon can be redeemed</Label>
                </div>
                
                {formData.limitUsage && (
                  <div>
                    <TextInput
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                      placeholder="100"
                      required={formData.limitUsage}
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-combine-recurring"
                    checked={formData.canCombineWithRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, canCombineWithRecurring: e.target.checked }))}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-combine-recurring">This coupon can be combined with recurring booking discounts</Label>
                </div>
                
                <div>
                  <Label>For recurring bookings, apply coupon to...</Label>
                  <Select
                    value={formData.applyToRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, applyToRecurring: e.target.value }))}
                  >
                    <option value="all">All jobs in recurring series</option>
                    <option value="first">First job only</option>
                  </Select>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button color="light" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.code || !formData.discountAmount}>
            Update Coupon
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 
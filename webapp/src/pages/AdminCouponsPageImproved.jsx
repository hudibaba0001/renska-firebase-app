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
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Badge, Modal, TextInput, Select, Tooltip } from 'flowbite-react';
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
import toast from 'react-hot-toast';

export default function AdminCouponsPageImproved() {
  const { companyId } = useParams();
  const { user: currentUser } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [services, setServices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '',
    appliesTo: 'all',
    selectedServices: [],
    expiresAt: '',
    doesntExpire: false,
    usageLimit: '',
    limitUsage: false,
    description: ''
  });

  // Load data
  useEffect(() => {
    if (companyId) {
      loadCoupons();
      loadServices();
    }
  }, [companyId]);

  // Filter and search coupons
  useEffect(() => {
    let filtered = [...coupons];

    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(coupon => {
        switch (filterStatus) {
          case 'active':
            return coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > now);
          case 'expired':
            return coupon.expiresAt && new Date(coupon.expiresAt) <= now;
          case 'inactive':
            return !coupon.isActive;
          default:
            return true;
        }
      });
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(coupon => coupon.discountType === filterType);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'code':
          return a.code.localeCompare(b.code);
        case 'discount':
          return b.discountAmount - a.discountAmount;
        case 'expiry':
          if (!a.expiresAt && !b.expiresAt) return 0;
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return new Date(a.expiresAt) - new Date(b.expiresAt);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, filterStatus, filterType, sortBy]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const couponsRef = collection(db, 'companies', companyId, 'coupons');
      const snapshot = await getDocs(couponsRef);
      const couponsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        setServices(companyData.services || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return { status: 'inactive', color: 'gray', text: 'Inactive' };
    
    if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
      return { status: 'expired', color: 'red', text: 'Expired' };
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { status: 'used_up', color: 'yellow', text: 'Used Up' };
    }
    
    return { status: 'active', color: 'green', text: 'Active' };
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountAmount}%`;
    }
    return `${coupon.discountAmount} SEK`;
  };

  const formatExpiration = (coupon) => {
    if (!coupon.expiresAt) return 'Never expires';
    const date = new Date(coupon.expiresAt);
    return date.toLocaleDateString('sv-SE');
  };

  const getUsageText = (coupon) => {
    if (!coupon.usageLimit) return `${coupon.usageCount || 0} uses`;
    return `${coupon.usageCount || 0}/${coupon.usageLimit} uses`;
  };

  // Statistics
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => getCouponStatus(c).status === 'active').length,
    expired: coupons.filter(c => getCouponStatus(c).status === 'expired').length,
    inactive: coupons.filter(c => getCouponStatus(c).status === 'inactive').length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Kuponghantering</h1>
          <p className="text-gray-600 mt-1">Skapa och hantera rabattkuponger för dina tjänster</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Skapa kupong
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totala kuponger</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TagIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktiva</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utgångna</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inaktiva</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <TextInput
              type="text"
              placeholder="Sök kuponger..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Alla statusar</option>
            <option value="active">Aktiva</option>
            <option value="expired">Utgångna</option>
            <option value="inactive">Inaktiva</option>
          </Select>

          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Alla typer</option>
            <option value="percentage">Procent</option>
            <option value="amount">Fast belopp</option>
          </Select>

          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created">Senast skapad</option>
            <option value="code">Kupongkod</option>
            <option value="discount">Rabattbelopp</option>
            <option value="expiry">Utgångsdatum</option>
          </Select>
        </div>
      </Card>

      {/* Coupons List */}
      {filteredCoupons.length === 0 ? (
        <Card className="p-12 text-center">
          <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {coupons.length === 0 ? 'Inga kuponger än' : 'Inga kuponger matchar dina filter'}
          </h3>
          <p className="text-gray-600 mb-6">
            {coupons.length === 0 
              ? 'Kom igång genom att skapa din första rabattkupong'
              : 'Prova att ändra dina sökfilter'
            }
          </p>
          {coupons.length === 0 && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Skapa första kupongen
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCoupons.map((coupon) => {
            const status = getCouponStatus(coupon);
            return (
              <Card key={coupon.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-1 rounded-md font-mono text-lg font-semibold text-gray-900">
                          {coupon.code}
                        </code>
                        <Badge color={status.color} size="sm">
                          {status.text}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatDiscount(coupon)}
                      </div>
                    </div>

                    {coupon.description && (
                      <p className="text-gray-600 mb-3">{coupon.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatExpiration(coupon)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        <span>{getUsageText(coupon)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4" />
                        <span>
                          {coupon.appliesTo === 'all' 
                            ? 'Alla tjänster' 
                            : `${coupon.selectedServices?.length || 0} tjänster`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Tooltip content="Redigera">
                      <Button size="sm" color="blue">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Ta bort">
                      <Button size="sm" color="red">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

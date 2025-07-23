import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  SparklesIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  SparklesIcon as SparklesSolid,
  GiftIcon as GiftSolid,
  TrophyIcon as TrophySolid,
  FireIcon as FireSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function ModernCouponsPage() {
  const { companyId } = useParams();
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for demonstration
  const mockCoupons = [
    {
      id: '1',
      code: 'SUMMER25',
      type: 'percentage',
      value: 25,
      description: 'Sommarrabatt på alla städtjänster',
      status: 'active',
      usageCount: 47,
      usageLimit: 100,
      expiresAt: '2024-08-31',
      createdAt: '2024-06-01',
      appliesTo: 'all',
      category: 'seasonal'
    },
    {
      id: '2', 
      code: 'NEWCUSTOMER',
      type: 'amount',
      value: 500,
      description: 'Välkomstrabatt för nya kunder',
      status: 'active',
      usageCount: 23,
      usageLimit: 50,
      expiresAt: null,
      createdAt: '2024-05-15',
      appliesTo: 'specific',
      category: 'welcome'
    },
    {
      id: '3',
      code: 'PREMIUM50',
      type: 'percentage',
      value: 50,
      description: 'Premium medlemsrabatt',
      status: 'active',
      usageCount: 12,
      usageLimit: null,
      expiresAt: '2024-12-31',
      createdAt: '2024-04-20',
      appliesTo: 'specific',
      category: 'premium'
    },
    {
      id: '4',
      code: 'EXPIRED10',
      type: 'percentage',
      value: 10,
      description: 'Utgången kampanj',
      status: 'expired',
      usageCount: 156,
      usageLimit: 200,
      expiresAt: '2024-05-31',
      createdAt: '2024-03-01',
      appliesTo: 'all',
      category: 'general'
    }
  ];

  useEffect(() => {
    setCoupons(mockCoupons);
  }, []);

  const getCouponIcon = (category, status) => {
    const iconClass = "w-6 h-6";
    const isActive = status === 'active';
    
    switch (category) {
      case 'seasonal':
        return isActive ? 
          <SparklesSolid className={`${iconClass} text-yellow-500`} /> :
          <SparklesIcon className={`${iconClass} text-gray-400`} />;
      case 'welcome':
        return isActive ?
          <GiftSolid className={`${iconClass} text-green-500`} /> :
          <GiftIcon className={`${iconClass} text-gray-400`} />;
      case 'premium':
        return isActive ?
          <TrophySolid className={`${iconClass} text-purple-500`} /> :
          <TrophyIcon className={`${iconClass} text-gray-400`} />;
      default:
        return isActive ?
          <FireSolid className={`${iconClass} text-red-500`} /> :
          <FireIcon className={`${iconClass} text-gray-400`} />;
    }
  };

  const getCouponGradient = (category, status) => {
    if (status !== 'active') return 'bg-gradient-to-br from-gray-100 to-gray-200';
    
    switch (category) {
      case 'seasonal':
        return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400';
      case 'welcome':
        return 'bg-gradient-to-br from-green-400 via-blue-400 to-purple-400';
      case 'premium':
        return 'bg-gradient-to-br from-purple-400 via-pink-400 to-red-400';
      default:
        return 'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Aktiv
          </div>
        );
      case 'expired':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
            Utgången
          </div>
        );
      case 'inactive':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            Inaktiv
          </div>
        );
      default:
        return null;
    }
  };

  const formatValue = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    }
    return `${coupon.value} SEK`;
  };

  const getUsagePercentage = (coupon) => {
    if (!coupon.usageLimit) return 0;
    return (coupon.usageCount / coupon.usageLimit) * 100;
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && coupon.status === selectedFilter;
  });

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usageCount, 0),
    totalSavings: coupons.reduce((sum, c) => {
      if (c.type === 'amount') return sum + (c.usageCount * c.value);
      return sum + (c.usageCount * 100); // Estimate for percentage
    }, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Header */}
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
            <SparklesSolid className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Kuponghantering
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Skapa magiska rabatter som får dina kunder att återkomma
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totala kuponger</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GiftSolid className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktiva kuponger</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BoltIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totala användningar</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUsage}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totala besparingar</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalSavings.toLocaleString()} SEK</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrophySolid className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök kuponger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-white/50 rounded-2xl p-1 border border-gray-200">
                {['all', 'active', 'expired', 'inactive'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedFilter === filter
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter === 'all' ? 'Alla' : filter === 'active' ? 'Aktiva' : filter === 'expired' ? 'Utgångna' : 'Inaktiva'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Skapa kupong
              </button>
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 ${getCouponGradient(coupon.category, coupon.status)} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getCouponIcon(coupon.category, coupon.status)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{coupon.code}</h3>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(coupon.status)}
                </div>

                {/* Value Display */}
                <div className="text-center py-4">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatValue(coupon)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">rabatt</p>
                </div>

                {/* Usage Progress */}
                {coupon.usageLimit && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Användning</span>
                      <span>{coupon.usageCount}/{coupon.usageLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(coupon)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Expiry */}
                <div className="text-center text-sm text-gray-500">
                  {coupon.expiresAt ? (
                    <>Utgår: {new Date(coupon.expiresAt).toLocaleDateString('sv-SE')}</>
                  ) : (
                    <>Utgår aldrig</>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-center space-x-2 pt-4 border-t border-gray-200/50">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors duration-200">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors duration-200">
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-out"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCoupons.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <GiftIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Inga kuponger hittades</h3>
            <p className="text-gray-600 mb-8">Prova att ändra dina sökfilter eller skapa en ny kupong</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <PlusIcon className="w-6 h-6 mr-3" />
              Skapa din första kupong
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

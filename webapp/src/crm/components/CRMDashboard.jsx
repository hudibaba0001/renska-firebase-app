import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { DashboardCard } from '../../components/ui/DashboardCard';
import toast from 'react-hot-toast';

export default function CRMDashboard() {
  const { companyId } = useParams();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDeals: 0,
    avgDealValue: 0,
    totalCustomers: 0,
    openTasks: 0,
    activeLeads: 0,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;

    // Subscribe to real-time stats updates
    const unsubscribe = onSnapshot(
      doc(db, `companies/${companyId}/stats/summary`),
      (doc) => {
        if (doc.exists()) {
          setStats(doc.data());
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading stats:', error);
        toast.error('Failed to load dashboard statistics');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Revenue"
          value={new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK'
          }).format(stats.totalRevenue)}
          trend={stats.totalDeals > 0 ? 'up' : 'neutral'}
        />
        <DashboardCard
          title="Total Deals"
          value={stats.totalDeals}
          trend={stats.totalDeals > 0 ? 'up' : 'neutral'}
        />
        <DashboardCard
          title="Average Deal Value"
          value={new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK'
          }).format(stats.avgDealValue)}
          trend={stats.avgDealValue > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Customer & Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Customers"
          value={stats.totalCustomers}
          trend={stats.totalCustomers > 0 ? 'up' : 'neutral'}
        />
        <DashboardCard
          title="Open Tasks"
          value={stats.openTasks}
          trend={stats.openTasks > 0 ? 'attention' : 'good'}
        />
        <DashboardCard
          title="Active Leads"
          value={stats.activeLeads}
          trend={stats.activeLeads > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-right">
        Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated.toDate()).toLocaleString('sv-SE') : 'Never'}
      </div>
    </div>
  );
};
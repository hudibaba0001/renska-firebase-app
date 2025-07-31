import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import JobsDashboard from './pages/JobsDashboard';
import JobDetail from './pages/JobDetail';
import CrewsDashboard from './pages/CrewsDashboard';
import ScheduleCalendar from './pages/ScheduleCalendar';
import { useAuth } from '../hooks/useAuth';

export default function FMSApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={<Navigate to="jobs" replace />} />
        <Route path="/jobs" element={<JobsDashboard />} />
        <Route path="/jobs/:jobId" element={<JobDetail />} />
        <Route path="/crews" element={<CrewsDashboard />} />
        <Route path="/schedule" element={<ScheduleCalendar />} />
      </Routes>
    </div>
  );
}
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CRMApp from './CRMApp';

const CRMWrapper = () => {
  const { companyId } = useParams();
  const { user, loading } = useAuth();

  console.log('CRMWrapper: user =', user, 'companyId =', companyId, 'loading =', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.error('CRMWrapper: No user found');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Authentication required</p>
        </div>
      </div>
    );
  }

  if (!companyId) {
    console.error('CRMWrapper: No companyId found');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Company ID required</p>
        </div>
      </div>
    );
  }

  return <CRMApp />;
};

export default CRMWrapper;
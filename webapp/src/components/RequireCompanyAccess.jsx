import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/init';
import { Spinner, Alert } from 'flowbite-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function RequireCompanyAccess({ children }) {
  const { companyId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validateCompanyAccess = async () => {
      if (!user || !companyId) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔒 Validating company access:', { userId: user.uid, companyId });
        
        // Get user's profile to check their company
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          console.error('❌ User document not found');
          setError('User profile not found');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const userCompanyId = userData.companyId;
        
        console.log('🔒 User company validation:', { 
          userCompanyId, 
          requestedCompanyId: companyId,
          isSuperAdmin: userData.isSuperAdmin 
        });

        // Super admins can access any company
        if (userData.isSuperAdmin) {
          console.log('✅ Super admin access granted');
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Regular users must belong to the requested company
        if (userCompanyId !== companyId) {
          console.error('❌ Unauthorized company access attempt:', {
            userCompanyId,
            requestedCompanyId: companyId,
            userId: user.uid
          });
          
          // Log security incident
          await logSecurityIncident({
            type: 'UNAUTHORIZED_COMPANY_ACCESS',
            userId: user.uid,
            userEmail: user.email,
            userCompanyId,
            requestedCompanyId: companyId,
            timestamp: new Date().toISOString()
          });
          
          setError('Unauthorized access to company data');
          setLoading(false);
          return;
        }

        console.log('✅ Company access validated successfully');
        setAuthorized(true);
        
      } catch (error) {
        console.error('❌ Error validating company access:', error);
        setError('Error validating access permissions');
      } finally {
        setLoading(false);
      }
    };

    validateCompanyAccess();
  }, [user, companyId]);

  // Log security incidents securely
  const logSecurityIncident = async (incident) => {
    try {
      // Use Firebase Functions for secure server-side logging
      const { httpsCallable } = await import('firebase/functions');
      const { getFunctions } = await import('firebase/firestore');
      const functions = getFunctions();
      
      const logSecurityEvent = httpsCallable(functions, 'logSecurityEvent');
      await logSecurityEvent({
        type: incident.type,
        userId: incident.userId,
        userEmail: incident.userEmail,
        userCompanyId: incident.userCompanyId,
        requestedCompanyId: incident.requestedCompanyId,
        timestamp: incident.timestamp,
        userAgent: navigator.userAgent,
        ipAddress: 'client-side' // Will be resolved server-side
      });
    } catch (error) {
      // Fallback to console for development, but don't expose sensitive data
      console.error('Security incident logging failed:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600">Validating access permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert color="failure" icon={ExclamationTriangleIcon}>
          <div className="font-medium">Security Alert: Unauthorized Access</div>
          <div className="mt-2">
            {error}. You do not have permission to access this company's data.
          </div>
          <div className="mt-4">
            <button 
              onClick={() => window.history.back()} 
              className="text-red-600 hover:text-red-800 underline"
            >
              Go Back
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
} 
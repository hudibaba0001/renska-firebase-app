import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button } from 'flowbite-react';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-6">
            You do not have permission to access this resource. This incident has been logged for security review.
          </p>
          
          <Alert color="failure" icon={ExclamationTriangleIcon} className="mb-6">
            <div className="font-medium">Security Alert</div>
            <div className="mt-2 text-sm">
              Unauthorized access attempt detected. If you believe this is an error, please contact your administrator.
            </div>
          </Alert>
          
          <div className="space-y-3">
            <Button as={Link} to="/" color="gray" className="w-full">
              Return to Home
            </Button>
            
            <Button as={Link} to="/login" color="blue" className="w-full">
              Login Again
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            Incident ID: {Date.now()}-{Math.random().toString(36).substr(2, 9)}
          </div>
        </div>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { setupInitialData, testMultiTenantSecurity } from '../utils/setupFirestore';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSetupData = async () => {
    setIsLoading(true);
    setStatus('Setting up Firestore data...');
    
    try {
      const success = await setupInitialData();
      setStatus(success ? '✅ Setup completed successfully!' : '❌ Setup failed');
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSecurity = async () => {
    setIsLoading(true);
    setStatus('Testing security rules...');
    
    try {
      const success = await testMultiTenantSecurity();
      setStatus(success ? '✅ Security test completed!' : '❌ Security test failed');
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-text-heading dark:text-white">🔧 Stage 2: Firestore Setup</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-heading mb-4">Firestore Schema & Security</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-text-heading mb-2">✅ Security Rules Deployed</h3>
                  <p className="text-sm text-text-main dark:text-white">Multi-tenant security rules are now active in Firebase</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-text-heading mb-2">📋 Data Structure</h3>
                  <div className="bg-gray-50 rounded p-4 text-sm font-mono">
                    <div>/companies/&#123;companyId&#125;</div>
                    <div className="ml-4">├── name: string</div>
                    <div className="ml-4">├── services: array</div>
                    <div className="ml-4">├── featureFlags: object</div>
                    <div className="ml-4">└── /bookings/&#123;bookingId&#125; (subcollection)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSetupData}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Setup Initial Data'}
              </button>
              
              <button
                onClick={handleTestSecurity}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Security'}
              </button>
            </div>

            {status && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-text-heading mb-2">Status</h3>
                <p className="text-sm text-text-main">{status}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-medium text-yellow-900 mb-2">🔒 Security Rules Summary</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>Public Read:</strong> Anyone can read company configurations</li>
                <li>• <strong>Admin Write:</strong> Only authenticated users with adminOf claim can modify</li>
                <li>• <strong>Booking Create:</strong> Anyone can create bookings (public forms)</li>
                <li>• <strong>Booking Management:</strong> Only company admins can read/delete bookings</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-medium text-green-900 mb-2">🧪 Test URLs</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Booking Page:</strong> 
                  <a href="/booking/swedprime" className="text-blue-600 hover:underline ml-2">
                    /booking/swedprime
                  </a>
                </div>
                <div>
                  <strong>Admin Dashboard:</strong> 
                  <a href="/admin/demo-company" className="text-blue-600 hover:underline ml-2">
                    /admin/demo-company
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
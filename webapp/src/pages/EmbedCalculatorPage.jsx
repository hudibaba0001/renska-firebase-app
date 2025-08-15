import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookingCalculator from '../components/BookingCalculator';
import { db } from '../firebase/init';
import { doc, getDoc } from 'firebase/firestore';

export default function EmbedCalculatorPage() {
  const [searchParams] = useSearchParams();
  const [companyId, setCompanyId] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        // Get companyId from URL params
        const companyIdParam = searchParams.get('companyId');
        if (!companyIdParam) {
          setError('Company ID is required');
          setLoading(false);
          return;
        }

        setCompanyId(companyIdParam);

        // Fetch company data
        const companyDoc = await getDoc(doc(db, 'companies', companyIdParam));
        if (!companyDoc.exists()) {
          setError('Company not found');
          setLoading(false);
          return;
        }

        const companyData = companyDoc.data();
        
        // Check if company is public
        if (!companyData.isPublic) {
          setError('This company calculator is not publicly available');
          setLoading(false);
          return;
        }

        // Get the default form config
        const formSlug = searchParams.get('form') || 'default';
        const formDoc = await getDoc(doc(db, `companies/${companyIdParam}/forms`, formSlug));
        
        if (!formDoc.exists()) {
          setError('Calculator form not found');
          setLoading(false);
          return;
        }

        const formData = formDoc.data();
        setConfig({
          ...formData,
          companyName: companyData.name,
          companyLogo: companyData.logo,
          companyColors: companyData.colors,
          rutEnabled: companyData.rutEnabled,
          rutPercentage: companyData.rutPercentage || 0.5,
          zipAreas: companyData.zipAreas || [],
          isPublic: true
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading embed calculator:', err);
        setError('Failed to load calculator');
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [searchParams]);

  // Handle iframe communication
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from parent window
      if (event.source !== window.parent) return;

      const { type, data } = event.data;

      switch (type) {
        case 'GET_HEIGHT': {
          // Send current height to parent
          const height = document.documentElement.scrollHeight;
          window.parent.postMessage({ type: 'HEIGHT_UPDATE', height }, '*');
          break;
        }
        
        case 'RESIZE':
          // Handle resize requests
          if (data && data.height) {
            document.body.style.height = `${data.height}px`;
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Send initial height
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'HEIGHT_UPDATE', height }, '*');
    };

    // Send height on load and resize
    sendHeight();
    window.addEventListener('resize', sendHeight);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('resize', sendHeight);
    };
  }, []);

  // Set embed attributes for CSS overrides
  useEffect(() => {
    // Set data-embed attribute on html, body, and root elements
    document.documentElement.setAttribute('data-embed', 'true');
    document.body.setAttribute('data-embed', 'true');
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.setAttribute('data-embed', 'true');
    }

    // Cleanup function
    return () => {
      document.documentElement.removeAttribute('data-embed');
      document.body.removeAttribute('data-embed');
      if (rootElement) {
        rootElement.removeAttribute('data-embed');
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Calculator Unavailable</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-calculator-container">
      <BookingCalculator 
        config={config} 
        companyId={companyId}
        isEmbedded={true}
      />
      
      <style jsx>{`
        .embed-calculator-container {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          background: white;
        }
        
        /* Ensure the page itself takes full viewport */
        html, body, #root {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
} 
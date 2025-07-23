import React from 'react';

const TestCRM = () => {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <h1>CRM Test Component</h1>
      <p>If you can see this, the CRM is working!</p>
      <div style={{ marginTop: 20 }}>
        <button 
          onClick={() => alert('CRM is working!')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestCRM; 
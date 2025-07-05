import React, { useState } from 'react';

export default function PreviewTestStep({ config, updateConfig, onPrev, companyId, isLastStep }) {
  const [activeTab, setActiveTab] = useState('preview');

  const tabs = [
    { id: 'preview', label: 'Live Preview', icon: '👁️' },
    { id: 'test', label: 'Test Calculator', icon: '🧪' },
    { id: 'embed', label: 'Embed & Share', icon: '🔗' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'preview' && (
            <LivePreviewTab config={config} companyId={companyId} />
          )}
          {activeTab === 'test' && (
            <TestCalculatorTab config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'embed' && (
            <EmbedShareTab config={config} companyId={companyId} />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          ← Previous
        </button>
        
        {isLastStep && (
          <div className="flex gap-4">
            <button
              onClick={() => updateConfig({ status: 'draft' })}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => updateConfig({ status: 'published' })}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              🚀 Publish Calculator
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Live Preview Tab
function LivePreviewTab({ config, companyId }) {
  const [deviceView, setDeviceView] = useState('desktop');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Live Preview</h3>
          <p className="text-gray-600">See how your calculator will look to customers</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`px-3 py-1 text-sm rounded ${
              deviceView === 'desktop' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            🖥️ Desktop
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`px-3 py-1 text-sm rounded ${
              deviceView === 'mobile' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            📱 Mobile
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-sm text-gray-600 ml-4">
            https://app.swedprime.com/booking/{companyId}/{config.slug}
          </div>
        </div>
        
        <div className={`bg-white ${deviceView === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
          <div className="p-6">
            <CalculatorPreview config={config} deviceView={deviceView} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Test Calculator Tab
function TestCalculatorTab({ config }) {
  const [testData, setTestData] = useState({
    zip: '41107',
    service: config.services?.[0]?.key || '',
    area: 75,
    frequency: config.frequencyMultipliers?.[0]?.key || '',
    addOns: {},
    windowCleaning: false
  });

  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const runTest = () => {
    // Simplified price calculation for demo
    const service = config.services?.find(s => s.key === testData.service);
    let price = 0;

    if (service?.pricingModel === 'per_sqm_tiered') {
      const tiers = service.pricingConfig?.tiers || [];
      const tier = tiers.find(t => testData.area >= t.minArea && testData.area <= t.maxArea);
      price = tier?.price || 0;
    } else if (service?.pricingModel === 'flat_range') {
      const ranges = service.pricingConfig?.ranges || [];
      const range = ranges.find(r => testData.area >= r.minArea && testData.area <= r.maxArea);
      price = range?.price || 0;
    }

    // Apply frequency multiplier
    const frequency = config.frequencyMultipliers?.find(f => f.key === testData.frequency);
    if (frequency) {
      price = Math.round(price * frequency.multiplier);
    }

    setCalculatedPrice(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Test Your Calculator</h3>
        <p className="text-gray-600 mb-6">
          Try different inputs to make sure your pricing logic works correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Inputs */}
        <div className="space-y-4">
          <h4 className="font-medium">Test Inputs</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={testData.zip}
              onChange={(e) => setTestData(prev => ({ ...prev, zip: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              value={testData.service}
              onChange={(e) => setTestData(prev => ({ ...prev, service: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select Service --</option>
              {(config.services || []).map(service => (
                <option key={service.id} value={service.key}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (m²)
            </label>
            <input
              type="number"
              value={testData.area}
              onChange={(e) => setTestData(prev => ({ ...prev, area: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={testData.frequency}
              onChange={(e) => setTestData(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select Frequency --</option>
              {(config.frequencyMultipliers || []).map(freq => (
                <option key={freq.key} value={freq.key}>
                  {freq.label} (×{freq.multiplier})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runTest}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Calculate Test Price
          </button>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          <h4 className="font-medium">Test Results</h4>
          
          {calculatedPrice !== null ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {calculatedPrice} kr
                </div>
                <p className="text-green-700">Calculated successfully!</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-green-200">
                <h5 className="font-medium text-green-800 mb-2">Calculation Breakdown:</h5>
                <div className="text-sm text-green-700 space-y-1">
                  <div>Service: {config.services?.find(s => s.key === testData.service)?.name}</div>
                  <div>Area: {testData.area} m²</div>
                  <div>Frequency: {config.frequencyMultipliers?.find(f => f.key === testData.frequency)?.label}</div>
                  <div className="font-medium">Total: {calculatedPrice} kr</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">🧪</div>
                <p>Enter test data and click "Calculate Test Price" to see results</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">Testing Tips:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Try edge cases (very small/large areas)</li>
              <li>• Test all frequency multipliers</li>
              <li>• Verify add-on pricing</li>
              <li>• Check minimum price limits</li>
              <li>• Test with invalid ZIP codes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Embed & Share Tab
function EmbedShareTab({ config, companyId }) {
  const [embedType, setEmbedType] = useState('iframe');
  
  const baseUrl = `https://app.swedprime.com/booking/${companyId}/${config.slug}`;
  
  const iframeCode = `<iframe 
  src="${baseUrl}"
  width="100%" 
  height="700" 
  frameborder="0">
</iframe>`;

  const npmCode = `import { BookingWidget } from 'swedprime-widget';

<BookingWidget 
  company="${companyId}" 
  form="${config.slug}" 
/>`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Embed & Share Your Calculator</h3>
        <p className="text-gray-600 mb-6">
          Multiple ways to integrate your calculator into your website or share with customers.
        </p>
      </div>

      {/* Direct Link */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">📌 Direct Link</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={baseUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
          />
          <button
            onClick={() => copyToClipboard(baseUrl)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Share this link directly with customers or use it to test your calculator.
        </p>
      </div>

      {/* Embed Options */}
      <div>
        <h4 className="font-medium mb-4">🔗 Embed Options</h4>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setEmbedType('iframe')}
            className={`px-4 py-2 rounded-md ${
              embedType === 'iframe'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            HTML iframe
          </button>
          <button
            onClick={() => setEmbedType('npm')}
            className={`px-4 py-2 rounded-md ${
              embedType === 'npm'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            NPM Widget
          </button>
        </div>

        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              {embedType === 'iframe' ? 'HTML' : 'JavaScript'}
            </span>
            <button
              onClick={() => copyToClipboard(embedType === 'iframe' ? iframeCode : npmCode)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Copy Code
            </button>
          </div>
          <pre className="text-sm overflow-x-auto">
            <code>{embedType === 'iframe' ? iframeCode : npmCode}</code>
          </pre>
        </div>

        {embedType === 'iframe' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-blue-800 mb-2">iframe Setup Tips:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Adjust height based on your form complexity</li>
              <li>• Consider responsive width (100% works well)</li>
              <li>• Test on mobile devices</li>
              <li>• Ensure your site allows iframes</li>
            </ul>
          </div>
        )}

        {embedType === 'npm' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-green-800 mb-2">NPM Widget Setup:</h5>
            <div className="text-sm text-green-700 space-y-2">
              <p>1. Install the widget: <code className="bg-green-100 px-1 rounded">npm install swedprime-widget</code></p>
              <p>2. Import and use the component as shown above</p>
              <p>3. Customize styling with CSS or props</p>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">📊 Analytics (Coming Soon)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">---</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">---</div>
            <div className="text-sm text-gray-600">Calculations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">---</div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Calculator Preview Component
function CalculatorPreview({ config, deviceView }) {
  return (
    <div className={`space-y-4 ${deviceView === 'mobile' ? 'text-sm' : ''}`}>
      <div className="text-center pb-4 border-b">
        <h2 className="text-xl font-bold text-blue-700">
          {config.name || 'Your Calculator'}
        </h2>
        {config.description && (
          <p className="text-gray-600 mt-1">{config.description}</p>
        )}
      </div>

      <div className="space-y-3">
        {/* Preview form fields based on config */}
        {(config.fieldOrder || []).slice(0, 4).map((fieldKey, index) => (
          <div key={fieldKey} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {config.fieldLabels?.[fieldKey] || fieldKey}
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-500">Sample input</span>
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800">
              {config.services?.[0]?.pricingConfig?.tiers?.[0]?.price || '---'} kr
            </div>
            <p className="text-blue-700">Estimated Price</p>
          </div>
        </div>

        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">
          Book Now
        </button>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { 
  Button, 
  Modal, 
  Card,
  Label,
  Select,
  TextInput,
  Checkbox,
  Badge,
  Spinner,
  Alert
} from 'flowbite-react';
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { exportRevenueData, getCompanyMetrics, getSuperadminMetrics } from '../services/analytics';

export default function ReportExporter({ companyId, type = 'company' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [reportConfig, setReportConfig] = useState({
    reportType: 'revenue',
    format: 'csv',
    dateRange: 'last30days',
    customStartDate: '',
    customEndDate: '',
    includeMetrics: {
      revenue: true,
      bookings: true,
      customers: true,
      formAnalytics: true,
      topServices: true
    }
  });

  const reportTypes = {
    company: [
      { value: 'revenue', label: 'Revenue Report', description: 'Detailed revenue breakdown by service and time period' },
      { value: 'bookings', label: 'Bookings Report', description: 'Customer bookings with status and details' },
      { value: 'customers', label: 'Customer Report', description: 'Customer activity and engagement metrics' },
      { value: 'analytics', label: 'Analytics Report', description: 'Form performance and conversion metrics' },
      { value: 'comprehensive', label: 'Comprehensive Report', description: 'All metrics combined in one report' }
    ],
    superadmin: [
      { value: 'platform', label: 'Platform Overview', description: 'Overall platform metrics and KPIs' },
      { value: 'companies', label: 'Companies Report', description: 'All companies with subscription details' },
      { value: 'revenue', label: 'Platform Revenue', description: 'MRR, ARR, and subscription analytics' },
      { value: 'usage', label: 'Usage Analytics', description: 'Platform usage and performance metrics' }
    ]
  };

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last90days', label: 'Last 90 days' },
    { value: 'thisMonth', label: 'This month' },
    { value: 'lastMonth', label: 'Last month' },
    { value: 'thisYear', label: 'This year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values (Excel compatible)' },
    { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
    { value: 'pdf', label: 'PDF', description: 'Formatted PDF report' },
    { value: 'json', label: 'JSON', description: 'Raw data in JSON format' }
  ];

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (reportConfig.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'last90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      case 'custom':
        startDate = new Date(reportConfig.customStartDate);
        endDate = new Date(reportConfig.customEndDate);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    return { startDate, endDate };
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { startDate, endDate } = getDateRange();
      let reportData;

      if (type === 'company') {
        switch (reportConfig.reportType) {
          case 'revenue':
            reportData = await exportRevenueData(companyId, startDate, endDate);
            break;
          case 'comprehensive':
            const metrics = await getCompanyMetrics(companyId);
            const revenueData = await exportRevenueData(companyId, startDate, endDate);
            reportData = {
              metrics,
              revenueData,
              generatedAt: new Date().toISOString(),
              dateRange: { startDate, endDate }
            };
            break;
          default:
            reportData = await getCompanyMetrics(companyId);
        }
      } else {
        reportData = await getSuperadminMetrics();
      }

      // Format and download the report
      await downloadReport(reportData, reportConfig.format);
      
      setSuccess('Report generated and downloaded successfully!');
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (data, format) => {
    const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;
    
    switch (format) {
      case 'csv':
        downloadCSV(data, filename);
        break;
      case 'json':
        downloadJSON(data, filename);
        break;
      case 'xlsx':
        // Would need to implement Excel export with a library like xlsx
        downloadCSV(data, filename.replace('.xlsx', '.csv'));
        break;
      case 'pdf':
        // Would need to implement PDF generation with a library like jsPDF
        downloadJSON(data, filename.replace('.pdf', '.json'));
        break;
      default:
        downloadJSON(data, filename);
    }
  };

  const downloadCSV = (data, filename) => {
    let csvContent = '';
    
    if (Array.isArray(data)) {
      // Convert array of objects to CSV
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value}"` : value;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    } else {
      // Convert object to CSV
      csvContent = 'Metric,Value\n';
      Object.entries(data).forEach(([key, value]) => {
        csvContent += `"${key}","${value}"\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const downloadJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const currentReportTypes = reportTypes[type] || reportTypes.company;

  return (
    <>
      <Button
        color="gray"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        Export Report
      </Button>

      <Modal show={isOpen} onClose={() => setIsOpen(false)} size="2xl">
        <Modal.Header>
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Export {type === 'company' ? 'Company' : 'Platform'} Report
          </div>
        </Modal.Header>
        
        <Modal.Body>
          <div className="space-y-6">
            {error && (
              <Alert color="failure">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert color="success">
                {success}
              </Alert>
            )}

            {/* Report Type Selection */}
            <div>
              <Label htmlFor="reportType" value="Report Type" className="mb-2 block" />
              <Select
                id="reportType"
                value={reportConfig.reportType}
                onChange={(e) => setReportConfig({...reportConfig, reportType: e.target.value})}
              >
                {currentReportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {currentReportTypes.find(t => t.value === reportConfig.reportType)?.description}
              </p>
            </div>

            {/* Date Range Selection */}
            <div>
              <Label htmlFor="dateRange" value="Date Range" className="mb-2 block" />
              <Select
                id="dateRange"
                value={reportConfig.dateRange}
                onChange={(e) => setReportConfig({...reportConfig, dateRange: e.target.value})}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Custom Date Range */}
            {reportConfig.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" value="Start Date" className="mb-2 block" />
                  <TextInput
                    id="startDate"
                    type="date"
                    value={reportConfig.customStartDate}
                    onChange={(e) => setReportConfig({...reportConfig, customStartDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" value="End Date" className="mb-2 block" />
                  <TextInput
                    id="endDate"
                    type="date"
                    value={reportConfig.customEndDate}
                    onChange={(e) => setReportConfig({...reportConfig, customEndDate: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div>
              <Label value="Export Format" className="mb-2 block" />
              <div className="grid grid-cols-2 gap-3">
                {formats.map(format => (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      reportConfig.format === format.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setReportConfig({...reportConfig, format: format.value})}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={reportConfig.format === format.value}
                        onChange={() => setReportConfig({...reportConfig, format: format.value})}
                        className="text-blue-600"
                      />
                      <div>
                        <h4 className="font-medium">{format.label}</h4>
                        <p className="text-sm text-gray-500">{format.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Metrics Selection for Comprehensive Reports */}
            {reportConfig.reportType === 'comprehensive' && type === 'company' && (
              <div>
                <Label value="Include Metrics" className="mb-2 block" />
                <div className="space-y-2">
                  {Object.entries(reportConfig.includeMetrics).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <Checkbox
                        id={key}
                        checked={value}
                        onChange={(e) => setReportConfig({
                          ...reportConfig,
                          includeMetrics: {
                            ...reportConfig.includeMetrics,
                            [key]: e.target.checked
                          }
                        })}
                      />
                      <Label htmlFor={key} className="ml-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <div className="flex justify-between w-full">
            <Button color="gray" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="blue" 
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

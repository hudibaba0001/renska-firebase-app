import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Progress, 
  Avatar, 
  Dropdown,
  Alert,
  Spinner,
  Table
} from 'flowbite-react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalendarIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, getFirestore, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useRealtimeSuperadminMetrics } from '../hooks/useRealtimeMetrics';
import { SystemAlertsCenter } from '../components/NotificationCenter';
import ReportExporter from '../components/ReportExporter';

// Import a chart library - We'll use Chart.js via react-chartjs-2
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for superadmin metrics
  const [metrics, setMetrics] = useState({
    activeCompanies: 0,
    suspendedCompanies: 0,
    mrr: 0,
    arr: 0,
    churnRate: 0,
    cac: 0,
    ltv: 0,
    totalActiveUsers: 0
  });
  
  // State for companies data
  const [companies, setCompanies] = useState([]);
  
  // Historical MRR data for chart
  const [mrrData, setMrrData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'MRR (SEK)',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });
  
  // Churn rate data for chart
  const [churnData, setChurnData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Churn Rate (%)',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });
  
  // Company status distribution data for pie chart
  const [companyStatusData, setCompanyStatusData] = useState({
    labels: ['Active', 'Suspended', 'Trial', 'Churned'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  });
  
  // LTV:CAC ratio data for bar chart
  const [ltvCacData, setLtvCacData] = useState({
    labels: ['2024', '2025'],
    datasets: [
      {
        label: 'LTV (SEK)',
        data: [0, 0],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'CAC (SEK)',
        data: [0, 0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });

  useEffect(() => {
    async function fetchSuperadminData() {
      setLoading(true);
      setError(null);
      
      try {
        const db = getFirestore();
        
        // Get all companies
        const companiesRef = collection(db, 'companies');
        const companiesSnapshot = await getDocs(companiesRef);
        const companiesData = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCompanies(companiesData);
        
        // Count active companies (those with active subscription)
        const activeCompanies = companiesData.filter(
          company => company.subscriptionStatus === 'active'
        ).length;
        
        // Count suspended companies
        const suspendedCompanies = companiesData.filter(
          company => company.subscriptionStatus === 'suspended'
        ).length;
        
        // Calculate MRR (Monthly Recurring Revenue)
        const mrr = companiesData.reduce((total, company) => {
          if (company.subscriptionStatus === 'active') {
            return total + (company.subscriptionAmount || 0);
          }
          return total;
        }, 0);
        
        // ARR is simply MRR * 12
        const arr = mrr * 12;
        
        // For demonstration, we'll set placeholder values for metrics
        // that would typically require more complex calculations or
        // data from multiple sources
        
        // In a real implementation, you would:
        // 1. Calculate churn based on companies that canceled in the last month
        // 2. Pull CAC from your financial records
        // 3. Calculate LTV based on customer lifetime and revenue
        // 4. Count active users across all companies
        
        setMetrics({
          activeCompanies,
          suspendedCompanies,
          mrr,
          arr,
          churnRate: 3.5, // Placeholder: 3.5%
          cac: 5000, // Placeholder: 5000 SEK
          ltv: 25000, // Placeholder: 25000 SEK
          totalActiveUsers: activeCompanies * 10, // Assuming ~10 users per company
        });
        
        // Generate mock historical data for charts
        // In a real implementation, you would pull this data from your database
        
        // Mock MRR growth data
        setMrrData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'MRR (SEK)',
              data: [mrr * 0.7, mrr * 0.75, mrr * 0.8, mrr * 0.85, mrr * 0.9, mrr * 0.95, mrr],
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
          ],
        });
        
        // Mock churn rate data
        setChurnData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Churn Rate (%)',
              data: [5.2, 4.8, 4.5, 4.2, 3.9, 3.7, 3.5],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        });
        
        // Mock company status distribution
        setCompanyStatusData({
          labels: ['Active', 'Suspended', 'Trial', 'Churned'],
          datasets: [
            {
              data: [activeCompanies, suspendedCompanies, 3, 5],
              backgroundColor: [
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 99, 132, 0.5)',
              ],
              borderColor: [
                'rgb(75, 192, 192)',
                'rgb(255, 159, 64)',
                'rgb(54, 162, 235)',
                'rgb(255, 99, 132)',
              ],
              borderWidth: 1,
            },
          ],
        });
        
        // Mock LTV:CAC ratio data
        setLtvCacData({
          labels: ['2024', '2025'],
          datasets: [
            {
              label: 'LTV (SEK)',
              data: [20000, 25000],
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
              label: 'CAC (SEK)',
              data: [6000, 5000],
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        });
        
      } catch (err) {
        console.error("Error fetching superadmin data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSuperadminData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure">
        <span className="font-medium">Error!</span> {error}
      </Alert>
    );
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate trend indicators
  const getTrend = (value, target, isHigherBetter = true) => {
    if (value === target) return "neutral";
    return (value > target) === isHigherBetter ? "positive" : "negative";
  };

  // Key metrics for the stats grid
  const stats = [
    {
      name: 'Active Companies',
      value: metrics.activeCompanies,
      target: 10,
      trend: getTrend(metrics.activeCompanies, 10),
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      name: 'Suspended Companies',
      value: metrics.suspendedCompanies,
      target: 2,
      trend: getTrend(metrics.suspendedCompanies, 2, false),
      icon: XCircleIcon,
      color: 'yellow'
    },
    {
      name: 'Monthly Recurring Revenue',
      value: formatCurrency(metrics.mrr),
      target: 50000,
      trend: getTrend(metrics.mrr, 50000),
      icon: BanknotesIcon,
      color: 'green'
    },
    {
      name: 'Annual Recurring Revenue',
      value: formatCurrency(metrics.arr),
      target: 600000,
      trend: getTrend(metrics.arr, 600000),
      icon: CreditCardIcon,
      color: 'purple'
    },
    {
      name: 'Churn Rate',
      value: formatPercentage(metrics.churnRate),
      target: 5,
      trend: getTrend(metrics.churnRate, 5, false),
      icon: ArrowTrendingUpIcon,
      color: 'red'
    },
    {
      name: 'Customer Acquisition Cost',
      value: formatCurrency(metrics.cac),
      target: 6000,
      trend: getTrend(metrics.cac, 6000, false),
      icon: BanknotesIcon,
      color: 'indigo'
    },
    {
      name: 'Lifetime Value',
      value: formatCurrency(metrics.ltv),
      target: 20000,
      trend: getTrend(metrics.ltv, 20000),
      icon: CreditCardIcon,
      color: 'green'
    },
    {
      name: 'Total Active Users',
      value: metrics.totalActiveUsers,
      target: 100,
      trend: getTrend(metrics.totalActiveUsers, 100),
      icon: UserGroupIcon,
      color: 'blue'
    }
  ];

  return (
    <div className="space-y-6 overflow-x-hidden w-full box-border">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">SwedPrime Superadmin Dashboard</h1>
            <p className="text-base text-purple-100">
              Platform overview and performance metrics
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-base text-purple-100">Today's Date</p>
              <p className="text-xl font-bold text-white">July 18, 2025</p>
            </div>
            <div className="w-px h-12 bg-purple-400"></div>
            <div className="text-right">
              <p className="text-base text-purple-100">Fiscal Quarter</p>
              <p className="text-xl font-bold text-white">Q3 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.trend === "positive" && (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              )}
              {stat.trend === "negative" && (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${
                stat.trend === "positive" ? "text-green-500" : 
                stat.trend === "negative" ? "text-red-500" : "text-gray-500"
              }`}>
                {stat.trend === "positive" ? "On target" : 
                 stat.trend === "negative" ? "Below target" : "Neutral"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">Monthly Recurring Revenue (MRR)</h5>
          <div className="h-80">
            <Line options={chartOptions} data={mrrData} />
          </div>
        </Card>

        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">Churn Rate Trend</h5>
          <div className="h-80">
            <Line options={chartOptions} data={churnData} />
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">Company Status Distribution</h5>
          <div className="h-80 flex justify-center items-center">
            <div style={{ width: '80%', height: '80%' }}>
              <Pie options={chartOptions} data={companyStatusData} />
            </div>
          </div>
        </Card>

        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">LTV vs CAC</h5>
          <div className="h-80">
            <Bar options={chartOptions} data={ltvCacData} />
          </div>
        </Card>
      </div>

      {/* Recent Companies */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">Recent Companies</h5>
          <Button size="sm" color="purple" as={Link} to="/superadmin/companies">
            View All
          </Button>
        </div>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Company Name</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Subscription</Table.HeadCell>
            <Table.HeadCell>MRR</Table.HeadCell>
            <Table.HeadCell>Users</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {companies.slice(0, 5).map((company) => (
              <Table.Row key={company.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  {company.companyName || "Unnamed Company"}
                </Table.Cell>
                <Table.Cell>
                  <Badge color={company.subscriptionStatus === 'active' ? 'success' : 'warning'}>
                    {company.subscriptionStatus || "Unknown"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {company.subscriptionPlan || "No Plan"}
                </Table.Cell>
                <Table.Cell>
                  {formatCurrency(company.subscriptionAmount || 0)}
                </Table.Cell>
                <Table.Cell>
                  {company.userCount || 0}
                </Table.Cell>
                <Table.Cell>
                  <Button size="xs" as={Link} to={`/superadmin/companies/${company.id}`}>
                    View
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Alerts and Notifications */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">System Alerts</h5>
          <Badge color="gray">{3} New</Badge>
        </div>
        <div className="space-y-4">
          <Alert color="warning">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">
                3 companies have overdue payments
              </span>
            </div>
          </Alert>
          <Alert color="info">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">
                System maintenance scheduled for July 25, 2025
              </span>
            </div>
          </Alert>
          <Alert color="success">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">
                Stripe payment integration update completed successfully
              </span>
            </div>
          </Alert>
        </div>
      </Card>
    </div>
  );
}

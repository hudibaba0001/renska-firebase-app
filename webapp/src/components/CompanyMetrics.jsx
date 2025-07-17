import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Progress, 
  Table,
  Spinner
} from 'flowbite-react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  DocumentCheckIcon,
  XMarkIcon,
  ChartBarIcon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, orderBy, limit, getFirestore } from 'firebase/firestore';

// Import chart components
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

export default function CompanyMetrics({ companyId }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    formInteractions: 0,
    completedForms: 0,
    abandonedForms: 0,
    abandonmentRate: 0,
    averageOrderPrice: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeCustomers: 0,
    inactiveCustomers: 0
  });
  
  const [topServices, setTopServices] = useState([]);
  const [salesTrends, setSalesTrends] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue (SEK)',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Bookings',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }
    ]
  });
  
  const [customerActivity, setCustomerActivity] = useState({
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)'
        ],
        borderWidth: 1
      }
    ]
  });

  useEffect(() => {
    async function fetchCompanyMetrics() {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const db = getFirestore();
        
        // Fetch form interactions (form events)
        const formEventsRef = collection(db, 'companies', companyId, 'formEvents');
        const formEventsSnapshot = await getDocs(formEventsRef);
        const formEvents = formEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch bookings
        const bookingsRef = collection(db, 'companies', companyId, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsRef);
        const bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch customers
        const customersRef = collection(db, 'companies', companyId, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        const customers = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate metrics
        const formInteractions = formEvents.length;
        const completedForms = bookings.filter(booking => booking.status === 'completed').length;
        const abandonedForms = formInteractions - completedForms;
        const abandonmentRate = formInteractions > 0 ? (abandonedForms / formInteractions) * 100 : 0;
        
        // Calculate revenue metrics
        const totalRevenue = bookings.reduce((sum, booking) => {
          return sum + (booking.totalPrice || 0);
        }, 0);
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = bookings
          .filter(booking => {
            const bookingDate = booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          })
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        
        const averageOrderPrice = bookings.length > 0 ? totalRevenue / bookings.length : 0;
        
        // Calculate customer activity (active = booked within last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const activeCustomers = customers.filter(customer => {
          const lastBooking = customer.lastBooking?.toDate ? customer.lastBooking.toDate() : new Date(customer.lastBooking);
          return lastBooking && lastBooking > ninetyDaysAgo;
        }).length;
        
        const inactiveCustomers = customers.length - activeCustomers;
        
        // Calculate top services
        const serviceRevenue = {};
        const serviceBookings = {};
        
        bookings.forEach(booking => {
          const serviceName = booking.serviceName || 'Unknown Service';
          serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + (booking.totalPrice || 0);
          serviceBookings[serviceName] = (serviceBookings[serviceName] || 0) + 1;
        });
        
        const topServicesData = Object.entries(serviceRevenue)
          .map(([name, revenue]) => ({
            name,
            revenue,
            bookings: serviceBookings[name] || 0
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        // Generate mock monthly sales trends (in real app, you'd calculate from actual data)
        const monthlyData = Array.from({ length: 7 }, (_, i) => {
          const month = new Date();
          month.setMonth(month.getMonth() - (6 - i));
          
          const monthBookings = bookings.filter(booking => {
            const bookingDate = booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
            return bookingDate.getMonth() === month.getMonth() && bookingDate.getFullYear() === month.getFullYear();
          });
          
          return {
            revenue: monthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
            bookings: monthBookings.length
          };
        });
        
        // Update state
        setMetrics({
          formInteractions,
          completedForms,
          abandonedForms,
          abandonmentRate,
          averageOrderPrice,
          totalRevenue,
          monthlyRevenue,
          activeCustomers,
          inactiveCustomers
        });
        
        setTopServices(topServicesData);
        
        setSalesTrends({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Revenue (SEK)',
              data: monthlyData.map(d => d.revenue),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1
            },
            {
              label: 'Bookings',
              data: monthlyData.map(d => d.bookings),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.1
            }
          ]
        });
        
        setCustomerActivity({
          labels: ['Active', 'Inactive'],
          datasets: [
            {
              data: [activeCustomers, inactiveCustomers],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)'
              ],
              borderColor: [
                'rgb(75, 192, 192)',
                'rgb(255, 99, 132)'
              ],
              borderWidth: 1
            }
          ]
        });
        
      } catch (error) {
        console.error("Error fetching company metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompanyMetrics();
  }, [companyId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

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

  // Key metrics for company dashboard
  const companyStats = [
    {
      name: 'Form Interactions',
      value: metrics.formInteractions,
      change: '+12%',
      changeType: 'positive',
      icon: CursorArrowRaysIcon,
      color: 'blue',
      description: 'total clicks'
    },
    {
      name: 'Completed Forms',
      value: metrics.completedForms,
      change: '+8%',
      changeType: 'positive',
      icon: DocumentCheckIcon,
      color: 'green',
      description: 'successful bookings'
    },
    {
      name: 'Abandonment Rate',
      value: formatPercentage(metrics.abandonmentRate),
      change: '-5%',
      changeType: 'positive',
      icon: XMarkIcon,
      color: 'red',
      description: 'forms abandoned'
    },
    {
      name: 'Average Order Price',
      value: formatCurrency(metrics.averageOrderPrice),
      change: '+15%',
      changeType: 'positive',
      icon: BanknotesIcon,
      color: 'purple',
      description: 'per booking'
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(metrics.monthlyRevenue),
      change: '+22%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'green',
      description: 'this month'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      change: '+18%',
      changeType: 'positive',
      icon: BanknotesIcon,
      color: 'blue',
      description: 'all time'
    },
    {
      name: 'Active Customers',
      value: metrics.activeCustomers,
      change: '+10%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'green',
      description: 'last 90 days'
    },
    {
      name: 'Customer Activity',
      value: formatPercentage(metrics.activeCustomers / (metrics.activeCustomers + metrics.inactiveCustomers) * 100),
      change: '+5%',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'yellow',
      description: 'engagement rate'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Company Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {companyStats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.changeType === "positive" && (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              )}
              {stat.changeType === "negative" && (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${
                stat.changeType === "positive" ? "text-green-500" : 
                stat.changeType === "negative" ? "text-red-500" : "text-gray-500"
              }`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full h-96">
          <h5 className="text-lg font-bold mb-4">Monthly Sales Trends</h5>
          <div className="h-80">
            <Line options={chartOptions} data={salesTrends} />
          </div>
        </Card>

        <Card className="w-full h-96">
          <h5 className="text-lg font-bold mb-4">Customer Activity</h5>
          <div className="h-80 flex justify-center items-center">
            <div style={{ width: '80%', height: '80%' }}>
              <Pie options={chartOptions} data={customerActivity} />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Services Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">Top-Selling Services</h5>
          <Badge color="gray">{topServices.length} Services</Badge>
        </div>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Service Name</Table.HeadCell>
            <Table.HeadCell>Total Revenue</Table.HeadCell>
            <Table.HeadCell>Bookings</Table.HeadCell>
            <Table.HeadCell>Avg. Price</Table.HeadCell>
            <Table.HeadCell>Performance</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {topServices.map((service, index) => (
              <Table.Row key={service.name} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <Badge color="info" className="mr-2">#{index + 1}</Badge>
                    {service.name}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {formatCurrency(service.revenue)}
                </Table.Cell>
                <Table.Cell>
                  {service.bookings}
                </Table.Cell>
                <Table.Cell>
                  {formatCurrency(service.revenue / service.bookings)}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center">
                    <Progress 
                      progress={Math.min((service.revenue / Math.max(...topServices.map(s => s.revenue))) * 100, 100)} 
                      size="sm" 
                      className="w-20 mr-2"
                    />
                    <span className="text-sm text-gray-500">
                      {((service.revenue / metrics.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}

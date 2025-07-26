import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  Briefcase, 
  CheckSquare, 
  DollarSign
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { useParams, useNavigate } from 'react-router-dom';
import AddSampleData from './AddSampleData';

const CRMDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeLeads: 0,
    totalRevenue: 0,
    openTasks: 0,
    recentCustomers: [],
    recentLeads: [],
    upcomingTasks: []
  });
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);
  const { companyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load customers
      const customersSnapshot = await getDocs(collection(db, `companies/${companyId}/customers`));
      const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load leads
      const leadsSnapshot = await getDocs(collection(db, `companies/${companyId}/leads`));
      const leads = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load deals
      const dealsSnapshot = await getDocs(collection(db, `companies/${companyId}/deals`));
      const deals = dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load tasks
      const tasksSnapshot = await getDocs(collection(db, `companies/${companyId}/tasks`));
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const totalRevenue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const openTasks = tasks.filter(task => task.status !== 'completed').length;
      const activeLeads = leads.filter(lead => lead.status !== 'lost').length;

      setStats({
        totalCustomers: customers.length,
        activeLeads: activeLeads,
        totalRevenue: totalRevenue,
        openTasks: openTasks,
        recentCustomers: customers.slice(0, 3),
        recentLeads: leads.slice(0, 3),
        upcomingTasks: tasks.filter(task => task.status !== 'completed').slice(0, 3)
      });

      setHasData(customers.length > 0 || leads.length > 0 || deals.length > 0 || tasks.length > 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActivityCard = ({ title, items, emptyMessage }) => (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name || item.title}</p>
                  <p className="text-sm text-gray-600">
                    {item.email || item.company || item.due}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' :
                    item.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status || item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your CRM</h1>
          <p className="text-gray-600">Get started by adding some sample data to see your CRM in action</p>
        </div>
        <AddSampleData />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600">Welcome to your customer relationship management system</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('customers/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Customer
          </button>
          <button 
            onClick={() => navigate('leads/create')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          title="Active Leads" 
          value={stats.activeLeads} 
          icon={Target} 
          color="green" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`${stats.totalRevenue.toLocaleString()} kr`} 
          icon={DollarSign} 
          color="yellow" 
        />
        <StatCard 
          title="Open Tasks" 
          value={stats.openTasks} 
          icon={CheckSquare} 
          color="purple" 
        />
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityCard 
          title="Recent Customers" 
          items={stats.recentCustomers} 
          emptyMessage="No recent customers"
        />
        <ActivityCard 
          title="Recent Leads" 
          items={stats.recentLeads} 
          emptyMessage="No recent leads"
        />
        <ActivityCard 
          title="Upcoming Tasks" 
          items={stats.upcomingTasks} 
          emptyMessage="No upcoming tasks"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('customers/create')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Add Customer</p>
            </button>
            <button 
              onClick={() => navigate('leads/create')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Add Lead</p>
            </button>
            <button 
              onClick={() => navigate('deals/create')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="font-medium">Create Deal</p>
            </button>
            <button 
              onClick={() => navigate('tasks/create')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Add Task</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard; 
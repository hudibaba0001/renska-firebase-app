import React, { useState } from 'react';
import { Plus, Users, Target, Briefcase, CheckSquare } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { useParams } from 'react-router-dom';

const AddSampleData = () => {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sampleCustomers = [
    {
      name: 'Anna Andersson',
      email: 'anna.andersson@example.com',
      phone: '+46 70 123 4567',
      status: 'active',
      address: 'Storgatan 15, Stockholm',
      city: 'Stockholm',
      postalCode: '11122',
      country: 'Sweden',
      notes: 'Regular cleaning customer, prefers eco-friendly products',
      consent: true
    },
    {
      name: 'Erik Svensson',
      email: 'erik.svensson@example.com',
      phone: '+46 70 234 5678',
      status: 'active',
      address: 'Kungsgatan 42, Göteborg',
      city: 'Göteborg',
      postalCode: '41108',
      country: 'Sweden',
      notes: 'Business customer, office cleaning twice per week',
      consent: true
    },
    {
      name: 'Maria Johansson',
      email: 'maria.johansson@example.com',
      phone: '+46 70 345 6789',
      status: 'prospect',
      address: 'Vasagatan 8, Malmö',
      city: 'Malmö',
      postalCode: '21120',
      country: 'Sweden',
      notes: 'Interested in premium cleaning services',
      consent: true
    }
  ];

  const sampleLeads = [
    {
      name: 'Lars Nilsson',
      email: 'lars.nilsson@techcorp.se',
      phone: '+46 70 456 7890',
      company: 'TechCorp AB',
      status: 'new',
      source: 'website',
      priority: 'high',
      notes: 'Looking for office cleaning services for 50 employees'
    },
    {
      name: 'Sofia Karlsson',
      email: 'sofia.karlsson@cleanpro.se',
      phone: '+46 70 567 8901',
      company: 'CleanPro Solutions',
      status: 'contacted',
      source: 'referral',
      priority: 'medium',
      notes: 'Follow up scheduled for next week'
    },
    {
      name: 'Johan Berg',
      email: 'johan.berg@officesolutions.se',
      phone: '+46 70 678 9012',
      company: 'Office Solutions',
      status: 'qualified',
      source: 'social',
      priority: 'high',
      notes: 'Ready for proposal, budget 25,000 kr/month'
    }
  ];

  const sampleDeals = [
    {
      name: 'TechCorp Office Cleaning',
      customer: 'Lars Nilsson',
      value: 15000,
      status: 'proposal',
      expectedCloseDate: '2024-02-15',
      notes: 'Large office building, 3 floors, daily cleaning required'
    },
    {
      name: 'CleanPro Partnership',
      customer: 'Sofia Karlsson',
      value: 8000,
      status: 'negotiation',
      expectedCloseDate: '2024-02-01',
      notes: 'Partnership opportunity for commercial cleaning'
    },
    {
      name: 'Office Solutions Contract',
      customer: 'Johan Berg',
      value: 25000,
      status: 'won',
      expectedCloseDate: '2024-01-20',
      notes: 'Multi-year contract signed, starting next month'
    }
  ];

  const sampleTasks = [
    {
      title: 'Follow up with Anna Andersson',
      description: 'Check satisfaction with last cleaning service',
      dueDate: '2024-01-16',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Sales Team'
    },
    {
      title: 'Send proposal to TechCorp',
      description: 'Prepare detailed proposal for office cleaning services',
      dueDate: '2024-01-17',
      priority: 'medium',
      status: 'in-progress',
      assignedTo: 'Sales Team'
    },
    {
      title: 'Schedule demo with CleanPro',
      description: 'Arrange product demonstration for partnership discussion',
      dueDate: '2024-01-18',
      priority: 'low',
      status: 'pending',
      assignedTo: 'Marketing Team'
    }
  ];

  const addSampleData = async (collectionName, data) => {
    try {
      const promises = data.map(item => 
        addDoc(collection(db, `companies/${companyId}/${collectionName}`), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error(`Error adding ${collectionName}:`, error);
      return false;
    }
  };

  const handleAddSampleData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const results = await Promise.all([
        addSampleData('customers', sampleCustomers),
        addSampleData('leads', sampleLeads),
        addSampleData('deals', sampleDeals),
        addSampleData('tasks', sampleTasks)
      ]);

      if (results.every(result => result)) {
        setMessage('✅ Sample data added successfully! Refresh the page to see the data.');
      } else {
        setMessage('⚠️ Some data could not be added. Please check the console for errors.');
      }
    } catch (error) {
      setMessage('❌ Error adding sample data. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Plus className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Add Sample Data</h3>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <p className="text-gray-600">
          Add sample customers, leads, deals, and tasks to test your CRM functionality.
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>3 Customers</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-600" />
            <span>3 Leads</span>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-yellow-600" />
            <span>3 Deals</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-purple-600" />
            <span>3 Tasks</span>
          </div>
        </div>

        <button
          onClick={handleAddSampleData}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Adding Data...' : 'Add Sample Data'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-100 text-green-800' :
            message.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSampleData; 
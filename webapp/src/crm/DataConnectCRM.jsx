import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Target,
  DollarSign,
  CheckSquare,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Clock,
  Tag
} from 'lucide-react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { apolloClient } from '../firebase/apollo-client';
import toast from 'react-hot-toast';

// GraphQL Queries
const GET_CUSTOMERS = gql`
  query GetCustomers($companyId: ID!) {
    customers(companyId: $companyId) {
      id
      name
      email
      phone
      address
      multiple_addresses
      rut_rot_eligible
      property_details
      internal_notes
      lead_source
      preferred_contact_method
      customer_tags
      booking_frequency
      feedback_rating
      is_company
      contact_person
      secondary_phone
      secondary_email
      company_size
      branch_count
      created_at
      updated_at
    }
  }
`;

const GET_LEADS = gql`
  query GetLeads($companyId: ID!) {
    leads(companyId: $companyId) {
      id
      title
      description
      status
      priority
      value
      currency
      expected_close_date
      created_at
      updated_at
    }
  }
`;

const GET_DEALS = gql`
  query GetDeals($companyId: ID!) {
    deals(companyId: $companyId) {
      id
      title
      description
      status
      value
      currency
      probability
      expected_close_date
      created_at
      updated_at
    }
  }
`;

const GET_TASKS = gql`
  query GetTasks($companyId: ID!) {
    tasks(companyId: $companyId) {
      id
      title
      description
      status
      priority
      due_date
      assigned_to
      created_at
      updated_at
    }
  }
`;

// GraphQL Mutations
const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CustomerInput!) {
    createCustomer(input: $input) {
      id
      first_name
      last_name
      email
      phone
      address
      status
      tags
      notes
      created_at
      updated_at
    }
  }
`;

const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      id
      first_name
      last_name
      email
      phone
      address
      status
      tags
      notes
      updated_at
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
    }
  }
`;

// Dashboard Component
const CRMDashboard = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeLeads: 0,
    totalRevenue: 0,
    openTasks: 0,
  });

  // GraphQL Queries
  const { data: customersData, loading: customersLoading } = useQuery(GET_CUSTOMERS, {
    variables: { companyId },
    skip: !companyId,
  });

  const { data: leadsData, loading: leadsLoading } = useQuery(GET_LEADS, {
    variables: { companyId },
    skip: !companyId,
  });

  const { data: dealsData, loading: dealsLoading } = useQuery(GET_DEALS, {
    variables: { companyId },
    skip: !companyId,
  });

  const { data: tasksData, loading: tasksLoading } = useQuery(GET_TASKS, {
    variables: { companyId },
    skip: !companyId,
  });

  useEffect(() => {
    if (customersData && leadsData && dealsData && tasksData) {
      const customers = customersData.customers || [];
      const leads = leadsData.leads || [];
      const deals = dealsData.deals || [];
      const tasks = tasksData.tasks || [];

      const totalRevenue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const openTasks = tasks.filter(task => task.status !== 'completed').length;
      const activeLeads = leads.filter(lead => lead.status !== 'lost').length;

      setStats({
        totalCustomers: customers.length,
        activeLeads,
        totalRevenue,
        openTasks
      });
    }
  }, [customersData, leadsData, dealsData, tasksData]);

  const loading = customersLoading || leadsLoading || dealsLoading || tasksLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your customer relationships and sales pipeline</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeLeads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">SEK {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('customers/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Customer</span>
          </button>
          <button
            onClick={() => navigate('leads/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Lead</span>
          </button>
          <button
            onClick={() => navigate('deals/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Deal</span>
          </button>
          <button
            onClick={() => navigate('tasks/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Form Component with SwedPrime CRM Fields
const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    multiple_addresses: customer?.multiple_addresses || [],
    rut_rot_eligible: customer?.rut_rot_eligible || false,
    property_details: customer?.property_details || '',
    internal_notes: customer?.internal_notes || '',
    lead_source: customer?.lead_source || '',
    preferred_contact_method: customer?.preferred_contact_method || '',
    customer_tags: customer?.customer_tags || [],
    booking_frequency: customer?.booking_frequency || '',
    feedback_rating: customer?.feedback_rating || null,
    // Additional fields for company support
    is_company: customer?.is_company || false,
    contact_person: customer?.contact_person || '',
    secondary_phone: customer?.secondary_phone || '',
    secondary_email: customer?.secondary_email || '',
    company_size: customer?.company_size || '',
    branch_count: customer?.branch_count || ''
  });

  const [newAddress, setNewAddress] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      setFormData(prev => ({
        ...prev,
        multiple_addresses: [...prev.multiple_addresses, newAddress.trim()]
      }));
      setNewAddress('');
    }
  };

  const handleRemoveAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      multiple_addresses: prev.multiple_addresses.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {customer ? 'Redigera Kund' : 'Lägg till Ny Kund'}
        </h2>
        <p className="text-gray-600">
          Fyll i kunduppgifter för SwedPrime CRM-systemet
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Type Selection */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Kundtyp</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="is_company"
                value="false"
                checked={!formData.is_company}
                onChange={() => setFormData(prev => ({ ...prev, is_company: false }))}
                className="mr-2"
              />
              <span className="text-sm font-medium">Privatperson</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="is_company"
                value="true"
                checked={formData.is_company}
                onChange={() => setFormData(prev => ({ ...prev, is_company: true }))}
                className="mr-2"
              />
              <span className="text-sm font-medium">Företag</span>
            </label>
          </div>
        </div>

        {/* Core Customer Management Fields */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kunduppgifter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.is_company ? 'Företagsnamn' : 'Namn'} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={formData.is_company ? "Stockholm Office Solutions" : "Anna Johansson"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Contact Person (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktperson (valfritt)
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Lars Nilsson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-post *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="anna.johansson@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Secondary Email (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sekundär e-post (valfritt)
                </label>
                <input
                  type="email"
                  name="secondary_email"
                  value={formData.secondary_email}
                  onChange={handleChange}
                  placeholder="accounts@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="070-123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Secondary Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sekundär telefon (valfritt)
              </label>
              <input
                type="tel"
                name="secondary_phone"
                value={formData.secondary_phone}
                onChange={handleChange}
                placeholder="076-987 65 43"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adressinformation</h3>
          
          {/* Primary Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Huvudadress *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Storgatan 12, 111 52 Stockholm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Multiple Addresses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.is_company ? 'Filialadresser' : 'Flera adresser'} (valfritt)
            </label>
            <div className="space-y-2">
              {formData.multiple_addresses.map((address, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={address}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder={formData.is_company ? "Kungsgatan 5, 111 43 Stockholm" : "Sommarstuga: Långgatan 8, 123 45 Mariefred"}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lägg till
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Property and Service Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fastighets- och tjänstedetaljer</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RUT/ROT Eligibility */}
            <div className="bg-green-50 p-3 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rut_rot_eligible"
                  checked={formData.rut_rot_eligible}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-green-800">
                  RUT/ROT-berättigad
                </span>
              </label>
              <p className="text-xs text-green-600 mt-1">
                {formData.is_company ? 'ROT för renoveringar' : 'RUT för hemstädning'}
              </p>
            </div>

            {/* Property Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.is_company ? 'Antal enheter/Total yta' : 'Fastighetsdetaljer'} (valfritt)
              </label>
              <input
                type="text"
                name="property_details"
                value={formData.property_details}
                onChange={handleChange}
                placeholder={formData.is_company ? "500 m² eller 10 kontor" : "80 m², 3 rum"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Company Size (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Företagsstorlek (valfritt)
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Välj storlek</option>
                  <option value="1-10">1-10 anställda</option>
                  <option value="11-50">11-50 anställda</option>
                  <option value="51-200">51-200 anställda</option>
                  <option value="200+">200+ anställda</option>
                </select>
              </div>
            )}

            {/* Branch Count (for companies) */}
            {formData.is_company && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Antal filialer (valfritt)
                </label>
                <input
                  type="number"
                  name="branch_count"
                  value={formData.branch_count}
                  onChange={handleChange}
                  placeholder="3"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lead and Acquisition Fields */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead- och förvärvsinformation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leadkälla (valfritt)
              </label>
              <select
                name="lead_source"
                value={formData.lead_source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj källa</option>
                <option value="referral">Rekommendation</option>
                <option value="website">Webbplats</option>
                <option value="trade_show">Mässa</option>
                <option value="tender">Upphandling</option>
                <option value="almega">Almega</option>
                <option value="social_media">Sociala medier</option>
                <option value="google">Google</option>
                <option value="other">Annan</option>
              </select>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Föredragen kontaktmetod (valfritt)
              </label>
              <select
                name="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj metod</option>
                <option value="email">E-post</option>
                <option value="phone">Telefon</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Retention and Insights Fields */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kundretention och insikter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kundtaggar (valfritt)
              </label>
              <div className="space-y-2">
                {[
                  'VIP', 'Ny kund', 'Kommersiell', 'Flerårig kontrakt', 
                  'RUT-berättigad', 'ROT-berättigad', 'Återkommande', 'Stor kund'
                ].map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.customer_tags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            customer_tags: [...prev.customer_tags, tag]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            customer_tags: prev.customer_tags.filter(t => t !== tag)
                          }));
                        }
                      }}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Booking Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bokningsfrekvens (valfritt)
              </label>
              <select
                name="booking_frequency"
                value={formData.booking_frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj frekvens</option>
                <option value="one_time">Engångs</option>
                <option value="weekly">Veckovis</option>
                <option value="bi_weekly">Varannan vecka</option>
                <option value="monthly">Månadsvis</option>
                <option value="quarterly">Kvartalsvis</option>
                <option value="custom">Anpassad</option>
              </select>
            </div>

            {/* Feedback Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kundbetyg (valfritt)
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, feedback_rating: star }))}
                    className={`text-2xl ${formData.feedback_rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.feedback_rating ? `${formData.feedback_rating}/5` : 'Inget betyg'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interna anteckningar</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interna anteckningar (valfritt)
            </label>
            <textarea
              name="internal_notes"
              value={formData.internal_notes}
              onChange={handleChange}
              placeholder={formData.is_company ? "Åtkomst via reception, kod: 1234" : "Nyckel under mattan, husdjur: katt"}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Specialinstruktioner för städteamet
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {customer ? 'Uppdatera Kund' : 'Lägg till Kund'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Customers List Component
const CustomersList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // GraphQL Queries
  const { data: customersData, loading, refetch } = useQuery(GET_CUSTOMERS, {
    variables: { companyId },
    skip: !companyId,
  });

  // GraphQL Mutations
  const [createCustomer] = useMutation(gql`
    mutation CreateCustomer($input: CustomerInput!) {
      createCustomer(input: $input) {
        id
        name
        email
        phone
        address
        multiple_addresses
        rut_rot_eligible
        property_details
        internal_notes
        lead_source
        preferred_contact_method
        customer_tags
        booking_frequency
        feedback_rating
        is_company
        contact_person
        secondary_phone
        secondary_email
        company_size
        branch_count
        created_at
        updated_at
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      setShowCreateForm(false);
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  });

  const [deleteCustomer] = useMutation(gql`
    mutation DeleteCustomer($id: ID!) {
      deleteCustomer(id: $id) {
        id
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  });

  const handleCreateCustomer = async (formData) => {
    try {
      await createCustomer({
        variables: {
          input: {
            ...formData,
            company_id: companyId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer({
          variables: { id: customerId }
        });
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    }
  };

  const customers = customersData?.customers || [];
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunder</h1>
          <p className="text-gray-600">Hantera dina kunder i SwedPrime CRM</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till Kund
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök kunder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kund
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUT/ROT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taggar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Betyg
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        {customer.is_company && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Företag
                          </span>
                        )}
                      </div>
                      {customer.contact_person && (
                        <div className="text-sm text-gray-500">
                          Kontakt: {customer.contact_person}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.address}</div>
                    {customer.multiple_addresses && customer.multiple_addresses.length > 0 && (
                      <div className="text-xs text-gray-500">
                        +{customer.multiple_addresses.length} fler adresser
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.rut_rot_eligible ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ja
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Nej
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {customer.customer_tags && customer.customer_tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {customer.customer_tags && customer.customer_tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{customer.customer_tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.feedback_rating ? (
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={customer.feedback_rating >= star ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">
                          {customer.feedback_rating}/5
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Inget betyg</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`customers/${customer.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visa detaljer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`customers/${customer.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Redigera"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Radera"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Inga kunder hittades</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Försök att justera dina söktermer.' : 'Kom igång genom att skapa din första kund.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Lägg till Kund
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CustomerForm
              onSubmit={handleCreateCustomer}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Leads List Component
const LeadsList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // GraphQL Queries
  const { data: leadsData, loading, refetch } = useQuery(GET_LEADS, {
    variables: { companyId },
    skip: !companyId,
  });

  // GraphQL Mutations
  const [createLead] = useMutation(gql`
    mutation CreateLead($input: LeadInput!) {
      createLead(input: $input) {
        id
        title
        description
        status
        priority
        value
        currency
        expected_close_date
        created_at
        updated_at
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      setShowCreateForm(false);
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead');
    }
  });

  const [deleteLead] = useMutation(gql`
    mutation DeleteLead($id: ID!) {
      deleteLead(id: $id) {
        id
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  });

  const handleCreateLead = async (formData) => {
    try {
      await createLead({
        variables: {
          input: {
            ...formData,
            company_id: companyId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead({
          variables: { id: leadId }
        });
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  const leads = leadsData?.leads || [];
  const filteredLeads = leads.filter(lead =>
    lead.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Track and manage your leads</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Close
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.title}</div>
                      <div className="text-sm text-gray-500">{lead.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                      lead.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.priority === 'high' ? 'bg-red-100 text-red-800' :
                      lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.value ? `${lead.currency || 'SEK'} ${lead.value.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.expected_close_date ? new Date(lead.expected_close_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`leads/${lead.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`leads/${lead.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first lead.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Lead
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Deals List Component
const DealsList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // GraphQL Queries
  const { data: dealsData, loading, refetch } = useQuery(GET_DEALS, {
    variables: { companyId },
    skip: !companyId,
  });

  // GraphQL Mutations
  const [createDeal] = useMutation(gql`
    mutation CreateDeal($input: DealInput!) {
      createDeal(input: $input) {
        id
        title
        description
        status
        value
        currency
        probability
        expected_close_date
        created_at
        updated_at
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      setShowCreateForm(false);
      toast.success('Deal created successfully');
    },
    onError: (error) => {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
    }
  });

  const [deleteDeal] = useMutation(gql`
    mutation DeleteDeal($id: ID!) {
      deleteDeal(id: $id) {
        id
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      toast.success('Deal deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
    }
  });

  const handleCreateDeal = async (formData) => {
    try {
      await createDeal({
        variables: {
          input: {
            ...formData,
            company_id: companyId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDeal({
          variables: { id: dealId }
        });
      } catch (error) {
        console.error('Error deleting deal:', error);
        toast.error('Failed to delete deal');
      }
    }
  };

  const deals = dealsData?.deals || [];
  const filteredDeals = deals.filter(deal =>
    deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600">Manage your sales pipeline</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Deals Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Close
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                      <div className="text-sm text-gray-500">{deal.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      deal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      deal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      deal.status === 'negotiated' ? 'bg-yellow-100 text-yellow-800' :
                      deal.status === 'won' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.value ? `${deal.currency || 'SEK'} ${deal.value.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${deal.probability || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{deal.probability || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`deals/${deal.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`deals/${deal.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first deal.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Add Deal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Tasks List Component
const TasksList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // GraphQL Queries
  const { data: tasksData, loading, refetch } = useQuery(GET_TASKS, {
    variables: { companyId },
    skip: !companyId,
  });

  // GraphQL Mutations
  const [createTask] = useMutation(gql`
    mutation CreateTask($input: TaskInput!) {
      createTask(input: $input) {
        id
        title
        description
        status
        priority
        due_date
        assigned_to
        created_at
        updated_at
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      setShowCreateForm(false);
      toast.success('Task created successfully');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  });

  const [deleteTask] = useMutation(gql`
    mutation DeleteTask($id: ID!) {
      deleteTask(id: $id) {
        id
      }
    }
  `, {
    onCompleted: () => {
      refetch();
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  });

  const handleCreateTask = async (formData) => {
    try {
      await createTask({
        variables: {
          input: {
            ...formData,
            company_id: companyId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({
          variables: { id: taskId }
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const tasks = tasksData?.tasks || [];
  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Track and manage your tasks</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.assigned_to || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`tasks/${task.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`tasks/${task.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first task.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Add Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main CRM Component
const DataConnectCRM = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '', description: 'CRM Overview' },
    { label: 'Customers', icon: Users, path: 'customers', description: 'Manage customers' },
    { label: 'Leads', icon: Target, path: 'leads', description: 'Track leads' },
    { label: 'Deals', icon: DollarSign, path: 'deals', description: 'Manage deals' },
    { label: 'Tasks', icon: CheckSquare, path: 'tasks', description: 'Track tasks' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">CRM System</h2>
          <p className="text-sm text-gray-600">Customer Relationship Management</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors group hover:bg-gray-50 text-gray-700"
            >
              <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">CRM System</h1>
              <p className="text-sm text-gray-600">Company ID: {companyId}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Professional CRM Platform
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="" element={<CRMDashboard />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/create" element={<div className="p-6"><CustomerForm onSubmit={() => {}} onCancel={() => navigate('customers')} /></div>} />
            <Route path="customers/:id" element={<div className="p-6">Customer Details (Coming Soon)</div>} />
            <Route path="customers/:id/edit" element={<div className="p-6">Edit Customer Form (Coming Soon)</div>} />
            <Route path="leads" element={<LeadsList />} />
            <Route path="deals" element={<DealsList />} />
            <Route path="tasks" element={<TasksList />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DataConnectCRM; 
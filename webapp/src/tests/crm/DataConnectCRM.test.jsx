import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataConnectCRM from '../../crm/DataConnectCRM';

// Mock the CRM modules
vi.mock('../../crm/modules/customers', () => ({
  CustomerList: ({ companyId }) => <div data-testid="customer-list">Customer List - {companyId}</div>,
  CustomerCreate: ({ companyId }) => <div data-testid="customer-create">Customer Create - {companyId}</div>,
  CustomerEdit: ({ companyId }) => <div data-testid="customer-edit">Customer Edit - {companyId}</div>,
  CustomerShow: ({ companyId }) => <div data-testid="customer-show">Customer Show - {companyId}</div>,
}));

vi.mock('../../crm/modules/leads', () => ({
  LeadList: ({ companyId }) => <div data-testid="lead-list">Lead List - {companyId}</div>,
  LeadCreate: ({ companyId }) => <div data-testid="lead-create">Lead Create - {companyId}</div>,
  LeadEdit: ({ companyId }) => <div data-testid="lead-edit">Lead Edit - {companyId}</div>,
  LeadShow: ({ companyId }) => <div data-testid="lead-show">Lead Show - {companyId}</div>,
}));

vi.mock('../../crm/modules/deals', () => ({
  DealList: ({ companyId }) => <div data-testid="deal-list">Deal List - {companyId}</div>,
  DealCreate: ({ companyId }) => <div data-testid="deal-create">Deal Create - {companyId}</div>,
  DealEdit: ({ companyId }) => <div data-testid="deal-edit">Deal Edit - {companyId}</div>,
  DealShow: ({ companyId }) => <div data-testid="deal-show">Deal Show - {companyId}</div>,
}));

vi.mock('../../crm/modules/tasks', () => ({
  TaskList: ({ companyId }) => <div data-testid="task-list">Task List - {companyId}</div>,
  TaskCreate: ({ companyId }) => <div data-testid="task-create">Task Create - {companyId}</div>,
  TaskEdit: ({ companyId }) => <div data-testid="task-edit">Task Edit - {companyId}</div>,
  TaskShow: ({ companyId }) => <div data-testid="task-show">Task Show - {companyId}</div>,
}));

// Mock Firebase
vi.mock('../../firebase/init', () => ({
  db: {}
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn()
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const renderWithRouter = (component, { route = '/admin/test-company/crm-data' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DataConnectCRM', () => {
  const mockCompanyId = 'test-company';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the CRM dashboard by default', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    expect(screen.getByText('CRM System')).toBeInTheDocument();
    expect(screen.getByText('Customer Relationship Management')).toBeInTheDocument();
    expect(screen.getByText('Company ID: test-company')).toBeInTheDocument();
  });

  it('displays all navigation menu items', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('navigates to customers list when customers menu is clicked', async () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    const customersButton = screen.getByText('Customers');
    fireEvent.click(customersButton);

    await waitFor(() => {
      expect(screen.getByTestId('customer-list')).toBeInTheDocument();
    });
  });

  it('navigates to leads list when leads menu is clicked', async () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    const leadsButton = screen.getByText('Leads');
    fireEvent.click(leadsButton);

    await waitFor(() => {
      expect(screen.getByTestId('lead-list')).toBeInTheDocument();
    });
  });

  it('navigates to tasks list when tasks menu is clicked', async () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    const tasksButton = screen.getByText('Tasks');
    fireEvent.click(tasksButton);

    await waitFor(() => {
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
    });
  });

  it('navigates to deals list when deals menu is clicked', async () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    const dealsButton = screen.getByText('Deals');
    fireEvent.click(dealsButton);

    await waitFor(() => {
      expect(screen.getByTestId('deal-list')).toBeInTheDocument();
    });
  });

  it('renders customer routes correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/customers` });
    
    expect(screen.getByTestId('customer-list')).toBeInTheDocument();
  });

  it('renders customer create route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/customers/create` });
    
    expect(screen.getByTestId('customer-create')).toBeInTheDocument();
  });

  it('renders customer edit route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/customers/test-id/edit` });
    
    expect(screen.getByTestId('customer-edit')).toBeInTheDocument();
  });

  it('renders customer show route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/customers/test-id` });
    
    expect(screen.getByTestId('customer-show')).toBeInTheDocument();
  });

  it('renders lead routes correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/leads` });
    
    expect(screen.getByTestId('lead-list')).toBeInTheDocument();
  });

  it('renders lead create route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/leads/create` });
    
    expect(screen.getByTestId('lead-create')).toBeInTheDocument();
  });

  it('renders lead edit route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/leads/test-id/edit` });
    
    expect(screen.getByTestId('lead-edit')).toBeInTheDocument();
  });

  it('renders lead show route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/leads/test-id` });
    
    expect(screen.getByTestId('lead-show')).toBeInTheDocument();
  });

  it('renders deal routes correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/deals` });
    
    expect(screen.getByTestId('deal-list')).toBeInTheDocument();
  });

  it('renders deal create route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/deals/create` });
    
    expect(screen.getByTestId('deal-create')).toBeInTheDocument();
  });

  it('renders deal edit route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/deals/test-id/edit` });
    
    expect(screen.getByTestId('deal-edit')).toBeInTheDocument();
  });

  it('renders deal show route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/deals/test-id` });
    
    expect(screen.getByTestId('deal-show')).toBeInTheDocument();
  });

  it('renders task routes correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/tasks` });
    
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
  });

  it('renders task create route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/tasks/create` });
    
    expect(screen.getByTestId('task-create')).toBeInTheDocument();
  });

  it('renders task edit route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/tasks/test-id/edit` });
    
    expect(screen.getByTestId('task-edit')).toBeInTheDocument();
  });

  it('renders task show route correctly', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/tasks/test-id` });
    
    expect(screen.getByTestId('task-show')).toBeInTheDocument();
  });

  it('passes companyId prop to all components', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data/customers` });
    
    expect(screen.getByText(`Customer List - ${mockCompanyId}`)).toBeInTheDocument();
  });

  it('displays menu descriptions', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    expect(screen.getByText('CRM Overview')).toBeInTheDocument();
    expect(screen.getByText('Manage customers')).toBeInTheDocument();
    expect(screen.getByText('Manage leads')).toBeInTheDocument();
    expect(screen.getByText('Manage tasks')).toBeInTheDocument();
    expect(screen.getByText('Manage deals')).toBeInTheDocument();
  });

  it('shows professional branding', () => {
    renderWithRouter(<DataConnectCRM />, { route: `/admin/${mockCompanyId}/crm-data` });
    
    expect(screen.getByText('Professional CRM Platform')).toBeInTheDocument();
  });
}); 
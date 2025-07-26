-- Enhanced Firebase Data Connect CRM Schema
-- PostgreSQL schema with multi-tenant security, GDPR compliance, and RUT reporting

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Row Level Security (RLS) for multi-tenant isolation
CREATE OR REPLACE FUNCTION get_company_id()
RETURNS UUID AS $$
BEGIN
  -- This will be set by Firebase Data Connect based on user context
  RETURN current_setting('app.current_company_id', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies table (tenants) with enhanced security
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    organization_number VARCHAR(20) UNIQUE, -- Swedish organization number
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    area_tag VARCHAR(100), -- Regional management (Gothenburg, Stockholm, etc.)
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'professional', 'enterprise')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    gdpr_compliant BOOLEAN DEFAULT false,
    rut_certified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table with role-based access control
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL, -- Firebase Auth UID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('super_admin', 'company_admin', 'manager', 'user')),
    permissions JSONB DEFAULT '{}', -- Flexible permissions system
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table with GDPR compliance
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    personnummer VARCHAR(20), -- Swedish personal identity number
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Sweden',
    area_tag VARCHAR(100), -- Regional management
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    source VARCHAR(100),
    notes TEXT,
    -- GDPR Compliance
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_version VARCHAR(20),
    data_processing_purpose TEXT,
    -- RUT Compliance
    rut_eligible BOOLEAN DEFAULT false,
    rut_certificate_number VARCHAR(50),
    -- Soft delete for GDPR
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    tags TEXT[], -- Array of tags
    custom_fields JSONB -- Flexible custom fields
);

-- Leads table with enhanced tracking
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'SEK',
    expected_close_date DATE,
    assigned_to UUID REFERENCES users(id),
    source VARCHAR(100),
    area_tag VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Deals table with RUT reporting
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'negotiated', 'won', 'lost')),
    value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'SEK',
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_to UUID REFERENCES users(id),
    area_tag VARCHAR(100),
    notes TEXT,
    -- RUT Reporting
    rut_eligible BOOLEAN DEFAULT false,
    rut_deducted_hours INTEGER DEFAULT 0,
    rut_rate DECIMAL(10,2) DEFAULT 0,
    rut_certificate_number VARCHAR(50),
    -- GDPR
    consent_given BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Tasks table with enhanced tracking
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    type VARCHAR(50) DEFAULT 'other' CHECK (type IN ('call', 'email', 'meeting', 'follow_up', 'cleaning', 'other')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    related_to UUID, -- Can be customer_id, lead_id, or deal_id
    related_type VARCHAR(50) CHECK (related_type IN ('customer', 'lead', 'deal')),
    area_tag VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Activities table (audit trail) with GDPR compliance
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'gdpr_request', 'rut_report')),
    subject VARCHAR(255),
    description TEXT,
    related_to UUID, -- Can be customer_id, lead_id, or deal_id
    related_type VARCHAR(50) CHECK (related_type IN ('customer', 'lead', 'deal')),
    user_id UUID REFERENCES users(id),
    duration INTEGER, -- Duration in minutes
    area_tag VARCHAR(100),
    -- GDPR tracking
    gdpr_related BOOLEAN DEFAULT false,
    data_processing_purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RUT Reports table for Skatteverket compliance
CREATE TABLE rut_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    report_period VARCHAR(7), -- YYYY-MM format
    total_hours INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    rut_deduction DECIMAL(15,2) NOT NULL,
    customer_payment DECIMAL(15,2) NOT NULL,
    certificate_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- GDPR Requests table for compliance tracking
CREATE TABLE gdpr_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    description TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    notes TEXT
);

-- Performance Indexes for multi-tenant queries
CREATE INDEX idx_companies_area_tag ON companies(area_tag);
CREATE INDEX idx_companies_status ON companies(status);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_area_tag ON customers(area_tag);
CREATE INDEX idx_customers_consent_given ON customers(consent_given);
CREATE INDEX idx_customers_rut_eligible ON customers(rut_eligible);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_customer_id ON leads(customer_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_expected_close_date ON leads(expected_close_date);
CREATE INDEX idx_leads_area_tag ON leads(area_tag);

CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_customer_id ON deals(customer_id);
CREATE INDEX idx_deals_lead_id ON deals(lead_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX idx_deals_area_tag ON deals(area_tag);
CREATE INDEX idx_deals_rut_eligible ON deals(rut_eligible);

CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_related_to ON tasks(related_to, related_type);
CREATE INDEX idx_tasks_area_tag ON tasks(area_tag);

CREATE INDEX idx_activities_company_id ON activities(company_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_related_to ON activities(related_to, related_type);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_area_tag ON activities(area_tag);

CREATE INDEX idx_rut_reports_company_id ON rut_reports(company_id);
CREATE INDEX idx_rut_reports_customer_id ON rut_reports(customer_id);
CREATE INDEX idx_rut_reports_report_period ON rut_reports(report_period);
CREATE INDEX idx_rut_reports_status ON rut_reports(status);

CREATE INDEX idx_gdpr_requests_company_id ON gdpr_requests(company_id);
CREATE INDEX idx_gdpr_requests_customer_id ON gdpr_requests(customer_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);

-- Row Level Security (RLS) Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rut_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant isolation
CREATE POLICY company_isolation_policy ON companies
    FOR ALL USING (id = get_company_id());

CREATE POLICY user_isolation_policy ON users
    FOR ALL USING (company_id = get_company_id());

CREATE POLICY customer_isolation_policy ON customers
    FOR ALL USING (company_id = get_company_id() AND deleted_at IS NULL);

CREATE POLICY lead_isolation_policy ON leads
    FOR ALL USING (company_id = get_company_id());

CREATE POLICY deal_isolation_policy ON deals
    FOR ALL USING (company_id = get_company_id());

CREATE POLICY task_isolation_policy ON tasks
    FOR ALL USING (company_id = get_company_id());

CREATE POLICY activity_isolation_policy ON activities
    FOR ALL USING (company_id = get_company_id());

CREATE POLICY rut_report_isolation_policy ON rut_reports
    FOR ALL USING (company_id = get_company_id());

CREATE POLICY gdpr_request_isolation_policy ON gdpr_requests
    FOR ALL USING (company_id = get_company_id());

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rut_reports_updated_at BEFORE UPDATE ON rut_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gdpr_requests_updated_at BEFORE UPDATE ON gdpr_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO companies (name, organization_number, city, area_tag, gdpr_compliant, rut_certified) VALUES
('Reniska Cleaning AB', '556123-4567', 'Stockholm', 'Stockholm', true, true),
('CleanPro Gothenburg', '556987-6543', 'Gothenburg', 'Gothenburg', true, true);

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres; 
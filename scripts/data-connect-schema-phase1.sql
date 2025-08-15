-- SwedPrime CRM Database Schema for Firebase Data Connect - Phase 1 (FINAL)
-- Focused on CRM only: companies, users, and customers with all 13 fields
-- Future phases: leads, deals, tasks, activities will be added later

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    address TEXT,
    area_tag VARCHAR(100), -- Regional management (e.g., "Stockholm", "Gothenburg")
    subscription_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255)
);

-- Users table (for authentication and access control)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    admin_of UUID[], -- Array of company IDs where user is admin
    super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255)
);

-- Customers table with all 13 SwedPrime CRM fields
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Core Customer Management Fields (1-8)
    name VARCHAR(255) NOT NULL, -- Customer Name (individual or company)
    email VARCHAR(255) NOT NULL, -- Email
    phone VARCHAR(50) NOT NULL, -- Phone
    address TEXT NOT NULL, -- Primary Address
    multiple_addresses TEXT[], -- Multiple Addresses (array)
    rut_rot_eligible BOOLEAN DEFAULT false, -- RUT/ROT Eligibility
    property_details TEXT, -- Basic Property Details
    internal_notes TEXT, -- Internal Notes
    
    -- Lead and Acquisition Fields (9-10)
    lead_source VARCHAR(100), -- Lead Source
    preferred_contact_method VARCHAR(50), -- Preferred Contact Method
    
    -- Retention and Insights Fields (11-13)
    customer_tags VARCHAR(100)[], -- Customer Tags (array)
    booking_frequency VARCHAR(50), -- Booking Frequency
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5), -- Feedback Rating (1-5 stars)
    
    -- Additional fields for company support
    is_company BOOLEAN DEFAULT false, -- Customer type (individual vs company)
    contact_person VARCHAR(255), -- Contact person for companies
    secondary_phone VARCHAR(50), -- Secondary phone
    secondary_email VARCHAR(255), -- Secondary email
    company_size VARCHAR(50), -- Company size (1-10, 11-50, etc.)
    branch_count INTEGER DEFAULT 0, -- Number of branches
    
    -- GDPR and Regional Management
    consent_given BOOLEAN DEFAULT false, -- GDPR compliance
    consent_timestamp TIMESTAMP, -- Required when consent_given is true
    consent_details TEXT, -- Required when consent_given is true
    area_tag VARCHAR(100), -- Regional management (e.g., "Stockholm", "Gothenburg")
    
    -- Swedish Personal Identity Number (for individuals)
    personnummer VARCHAR(13) NULL, -- Required for individual customers, NULL for companies
    
    -- Future Module Integration Points (Phase 2+)
    -- customer_id UUID, -- For future FMS integration (Phase 2)
    -- subscription_id UUID, -- For future Subscription Manager integration (Phase 3)
    -- assigned_crew UUID[], -- For future crew management in FMS (Phase 2)
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255)
);

-- Constraint to ensure consent_timestamp and consent_details are provided when consent_given is true
ALTER TABLE customers ADD CONSTRAINT check_consent_timestamp 
    CHECK (NOT consent_given OR (consent_given AND consent_timestamp IS NOT NULL AND consent_details IS NOT NULL));

-- Indexes for performance (Phase 1 focus)
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_rut_rot_eligible ON customers(rut_rot_eligible);
CREATE INDEX idx_customers_is_company ON customers(is_company);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customers_area_tag ON customers(area_tag);
CREATE INDEX idx_customers_consent_given ON customers(consent_given);
CREATE INDEX idx_customers_personnummer ON customers(personnummer);

-- Row Level Security (RLS) policies for multi-tenancy (Phase 1)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Companies are viewable by company admins and super admins" ON companies
    FOR SELECT USING (
        auth.jwt() ->> 'adminOf' IS NOT NULL AND 
        (auth.jwt() ->> 'adminOf')::text[] @> ARRAY[id::text] OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

CREATE POLICY "Companies are insertable by super admins" ON companies
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

CREATE POLICY "Companies are updatable by company admins and super admins" ON companies
    FOR UPDATE USING (
        auth.jwt() ->> 'adminOf' IS NOT NULL AND 
        (auth.jwt() ->> 'adminOf')::text[] @> ARRAY[id::text] OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

-- RLS Policies for users (corrected JWT claim)
CREATE POLICY "Users are viewable by themselves and super admins" ON users
    FOR SELECT USING (
        firebase_uid = auth.jwt() ->> 'sub' OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

CREATE POLICY "Users are insertable by super admins" ON users
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

CREATE POLICY "Users are updatable by themselves and super admins" ON users
    FOR UPDATE USING (
        firebase_uid = auth.jwt() ->> 'sub' OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

-- RLS Policies for customers
CREATE POLICY "Customers are viewable by company admins and super admins" ON customers
    FOR SELECT USING (
        auth.jwt() ->> 'adminOf' IS NOT NULL AND 
        (auth.jwt() ->> 'adminOf')::text[] @> ARRAY[company_id::text] OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

CREATE POLICY "Customers are insertable by company admins and super admins" ON customers
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'adminOf' IS NOT NULL AND 
        (auth.jwt() ->> 'adminOf')::text[] @> ARRAY[company_id::text] OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

CREATE POLICY "Customers are updatable by company admins and super admins" ON customers
    FOR UPDATE USING (
        auth.jwt() ->> 'adminOf' IS NOT NULL AND 
        (auth.jwt() ->> 'adminOf')::text[] @> ARRAY[company_id::text] OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

CREATE POLICY "Customers are deletable by company admins and super admins" ON customers
    FOR DELETE USING (
        auth.jwt() ->> 'adminOf' IS NOT NULL AND 
        (auth.jwt() ->> 'adminOf')::text[] @> ARRAY[company_id::text] OR
        (auth.jwt() ->> 'superAdmin')::boolean = true
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at (Phase 1 only)
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (Phase 1 focus)
INSERT INTO companies (name, contact_email, address, area_tag, subscription_plan) VALUES
('Test Cleaning Company', 'test@cleaningcompany.se', 'Storgatan 1, 111 22 Stockholm', 'Stockholm', 'premium'),
('Demo Office Solutions', 'demo@officesolutions.se', 'Kungsgatan 5, 111 43 Stockholm', 'Stockholm', 'basic');

-- Sample customers with SwedPrime CRM fields (Phase 1)
INSERT INTO customers (company_id, name, email, phone, address, multiple_addresses, rut_rot_eligible, property_details, internal_notes, lead_source, preferred_contact_method, customer_tags, booking_frequency, feedback_rating, is_company, contact_person, consent_given, consent_timestamp, consent_details, area_tag, personnummer) VALUES
(
    (SELECT id FROM companies WHERE name = 'Test Cleaning Company'),
    'Anna Johansson',
    'anna.johansson@example.com',
    '070-123 45 67',
    'Storgatan 12, 111 52 Stockholm',
    ARRAY['Sommarstuga: Långgatan 8, 123 45 Mariefred'],
    true,
    '80 m², 3 rum',
    'Nyckel under mattan, husdjur: katt',
    'referral',
    'email',
    ARRAY['VIP', 'RUT-berättigad', 'Återkommande'],
    'weekly',
    5,
    false,
    NULL,
    true,
    CURRENT_TIMESTAMP,
    'Consent given via booking form on 2025-07-27',
    'Stockholm',
    '19851215-1234'
),
(
    (SELECT id FROM companies WHERE name = 'Demo Office Solutions'),
    'Stockholm Office Solutions',
    'info@stockholmoffices.com',
    '08-555 12 34',
    'Kungsgatan 5, 111 43 Stockholm',
    ARRAY['Filial: Sveavägen 10, 111 57 Stockholm'],
    false,
    '500 m², 10 kontor',
    'Åtkomst via reception, kod: 1234',
    'tender',
    'email',
    ARRAY['Kommersiell', 'Flerårig kontrakt', 'Stor kund'],
    'monthly',
    4,
    true,
    'Lars Nilsson',
    true,
    CURRENT_TIMESTAMP,
    'Consent given via contract signing on 2025-07-27',
    'Stockholm',
    NULL
);

-- Future Phase Notes:
-- Phase 2 (September 2025): Add leads, deals tables with customer_id references
-- Phase 3 (October 2025): Add tasks table with proper user assignment (assigned_to UUID REFERENCES users(id))
-- Phase 4 (November 2025): Add activities table for audit trail
-- All future tables will reference company_id for multi-tenancy
-- Future integration points will be added as actual columns when modules are implemented:
--   - customer_id UUID REFERENCES customers(id) for FMS integration
--   - subscription_id UUID for Subscription Manager integration
--   - assigned_crew UUID[] for crew management in FMS 
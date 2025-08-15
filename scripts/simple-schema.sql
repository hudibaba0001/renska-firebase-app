-- SwedPrime CRM Database Schema - Simplified Version
-- Focused on CRM only: companies, users, and customers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_email VARCHAR(255) NOT NULL,
    address TEXT,
    area_tag VARCHAR(100),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Users table (for authentication and access control)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    admin_of UUID[],
    super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Customers table with all 13 SwedPrime CRM fields
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    
    -- Core Customer Management Fields (1-8)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    multiple_addresses TEXT[],
    rut_rot_eligible BOOLEAN DEFAULT false,
    property_details TEXT,
    internal_notes TEXT,
    
    -- Lead and Acquisition Fields (9-10)
    lead_source VARCHAR(100),
    preferred_contact_method VARCHAR(50),
    
    -- Retention and Insights Fields (11-13)
    customer_tags VARCHAR(100)[],
    booking_frequency VARCHAR(50),
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    
    -- Additional fields for company support
    is_company BOOLEAN DEFAULT false,
    contact_person VARCHAR(255),
    secondary_phone VARCHAR(50),
    secondary_email VARCHAR(255),
    company_size VARCHAR(50),
    branch_count INTEGER DEFAULT 0 CHECK (branch_count >= 0),
    
    -- GDPR and Regional Management
    consent_given BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    consent_details TEXT,
    area_tag VARCHAR(100),
    
    -- Swedish Personal Identity Number (for individuals)
    personnummer VARCHAR(13) NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Add foreign key constraints after tables are created
ALTER TABLE companies ADD CONSTRAINT fk_companies_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id);
ALTER TABLE users ADD CONSTRAINT fk_users_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id);
ALTER TABLE customers ADD CONSTRAINT fk_customers_company_id FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE customers ADD CONSTRAINT fk_customers_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id);

-- Indexes for performance
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_rut_rot_eligible ON customers(rut_rot_eligible);
CREATE INDEX idx_customers_is_company ON customers(is_company);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customers_area_tag ON customers(area_tag);
CREATE INDEX idx_customers_consent_given ON customers(consent_given);
CREATE INDEX idx_customers_personnummer ON customers(personnummer);

-- Sample data
INSERT INTO users (firebase_uid, email, name, super_admin) VALUES
('sample_super_admin_uid_123', 'superadmin@example.com', 'Super Admin User', true);

-- Sample companies
INSERT INTO companies (name, contact_email, address, area_tag, subscription_plan) VALUES
('Test Cleaning Company', 'test@cleaningcompany.se', 'Storgatan 1, 111 22 Stockholm', 'Stockholm', 'premium'),
('Demo Office Solutions', 'demo@officesolutions.se', 'Kungsgatan 5, 111 43 Stockholm', 'Stockholm', 'basic');

-- Sample customers
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
    'Consent given for marketing emails and service updates, including new features and promotions.',
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
    'Consent given for essential service communications and operational updates related to our contract.',
    'Stockholm',
    NULL
); 
-- SwedPrime CRM Database Schema for Firebase Data Connect - Phase 1
-- Focused on CRM only: companies, users, and customers with all 13 fields
-- Future phases: leads, deals, tasks, activities will be added later
-- Schema finalized as of Sunday, July 27, 2025 at 10:14:38 PM CEST; modify only with new business needs

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
    deleted_by UUID REFERENCES users(id)
);

-- Users table (for authentication and access control)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    admin_of UUID[], -- Array of company IDs where user is admin
    super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id)
);

-- Trigger function to prevent deletion of the last super admin (hard or soft delete)
CREATE OR REPLACE FUNCTION prevent_last_super_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if it's a hard delete OR a soft delete (setting 'deleted' to TRUE)
    IF OLD.super_admin IS TRUE AND (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted IS TRUE AND OLD.deleted IS FALSE)) THEN
        IF (SELECT COUNT(*) FROM users WHERE super_admin = TRUE AND deleted = FALSE AND id != OLD.id) = 0 THEN
            RAISE EXCEPTION 'Cannot delete or soft-delete the last active super admin.';
        END IF;
    END IF;

    -- For soft-deletes (UPDATE OF deleted), ensure deleted_at is set.
    -- deleted_by should ideally be set by the application based on auth.uid()
    IF TG_OP = 'UPDATE' AND NEW.deleted IS TRUE AND OLD.deleted IS FALSE THEN
        NEW.deleted_at = CURRENT_TIMESTAMP;
    END IF;

    -- Return the appropriate row based on the operation type
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE -- TG_OP = 'UPDATE'
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Trigger for super admin deletion check
CREATE TRIGGER check_last_super_admin_deletion
BEFORE DELETE OR UPDATE OF deleted ON users -- Trigger on DELETE or UPDATE of 'deleted' column
FOR EACH ROW
EXECUTE FUNCTION prevent_last_super_admin_deletion();

-- Customers table with all 13 SwedPrime CRM fields
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

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
    branch_count INTEGER DEFAULT 0 CHECK (branch_count >= 0), -- Constraint for non-negative branches

    -- GDPR and Regional Management
    consent_given BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    consent_details TEXT,
    area_tag VARCHAR(100),

    -- Swedish Personal Identity Number (for individuals)
    personnummer VARCHAR(13) NULL, -- YYYYMMDD-XXXX - Required for individual customers (is_company = false), NULL for companies (is_company = true)

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id)
);

-- Constraint to ensure consent_timestamp AND consent_details are provided and non-empty when consent_given is true
ALTER TABLE customers ADD CONSTRAINT check_consent_timestamp_and_details
    CHECK (
        NOT consent_given OR (
            consent_given AND
            consent_timestamp IS NOT NULL AND
            consent_details IS NOT NULL AND
            LENGTH(TRIM(consent_details)) > 10 -- Enforce substantive text
        )
    );

-- Constraint to enforce personnummer for individuals and NULL for companies
ALTER TABLE customers ADD CONSTRAINT check_personnummer_and_company_type
    CHECK (
        (NOT is_company AND personnummer IS NOT NULL) OR -- If not a company, personnummer must exist
        (is_company AND personnummer IS NULL)           -- If a company, personnummer must be NULL
    );

-- Constraint to validate the format of personnummer (YYYYMMDD-XXXX)
ALTER TABLE customers ADD CONSTRAINT check_personnummer_format
    CHECK (
        personnummer IS NULL OR                        -- Allow NULL for companies
        personnummer ~ '^\d{8}-\d{4}$'                 -- Enforce YYYYMMDD-XXXX format
    );

-- Constraint to validate basic email format
ALTER TABLE users ADD CONSTRAINT check_user_email_format
    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');
ALTER TABLE customers ADD CONSTRAINT check_customer_email_format
    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');
ALTER TABLE companies ADD CONSTRAINT check_company_email_format
    CHECK (contact_email ~* '^[^@]+@[^@]+\.[^@]+$');

-- Constraint to ensure deleted_by is set when a row is marked deleted
ALTER TABLE companies ADD CONSTRAINT check_companies_deleted_by
  CHECK (NOT deleted OR (deleted AND deleted_by IS NOT NULL));
ALTER TABLE users ADD CONSTRAINT check_users_deleted_by
  CHECK (NOT deleted OR (deleted AND deleted_by IS NOT NULL));
ALTER TABLE customers ADD CONSTRAINT check_customers_deleted_by
  CHECK (NOT deleted OR (deleted AND deleted_by IS NOT NULL));

-- Indexes for Performance
-- Indexes for core CRM tables (Phase 1 focus)
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_rut_rot_eligible ON customers(rut_rot_eligible);
CREATE INDEX idx_customers_is_company ON customers(is_company);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customers_area_tag ON customers(area_tag);
CREATE INDEX idx_customers_consent_given ON customers(consent_given);
CREATE INDEX idx_customers_personnummer ON customers(personnummer);

-- New Indexes for Scalability Considerations
CREATE INDEX idx_users_admin_of ON users USING GIN(admin_of); -- GIN index for array column for efficient lookups
CREATE INDEX idx_companies_subscription_active ON companies(subscription_active); -- For filtering active companies
CREATE INDEX idx_companies_subscription_plan ON companies(subscription_plan); -- For filtering by plan
CREATE INDEX idx_users_role ON users(role); -- For searching/filtering users by role
CREATE INDEX idx_users_super_admin ON users(super_admin); -- For efficient lookup of super admins

-- Indexes on 'deleted' column, optimized as partial indexes for common queries filtering out deleted rows
CREATE INDEX idx_companies_deleted_active ON companies(deleted) WHERE deleted = FALSE;
CREATE INDEX idx_users_deleted_active ON users(deleted) WHERE deleted = FALSE;
CREATE INDEX idx_customers_deleted_active ON customers(deleted) WHERE deleted = FALSE;

-- Row Level Security (RLS) Policies
-- IMPORTANT: Assumes Firebase JWT claims 'adminOf' is a JSON array of strings
-- and 'superAdmin' is a boolean. 'sub' is the Firebase UID.
-- Validation of JWT claim structure via Firebase emulator tokens is essential for deployment.

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Default RLS policies to hide soft-deleted rows from SELECT operations
-- These policies are applied first and ensure that only non-deleted rows are visible
CREATE POLICY companies_not_deleted ON companies
  FOR SELECT USING (deleted = false);
CREATE POLICY users_not_deleted ON users
  FOR SELECT USING (deleted = false);
CREATE POLICY customers_not_deleted ON customers
  FOR SELECT USING (deleted = false);

-- RLS Policies for companies
-- Note: 'WITH CHECK (deleted = false)' added to INSERT/UPDATE policies
-- to prevent accidental "revival" of deleted rows or insertion of already-deleted rows.
CREATE POLICY "Companies are viewable by company admins and super admins" ON companies
    FOR SELECT USING (
        (auth.jwt() -> 'superAdmin')::boolean = true OR
        id::text = ANY(SELECT jsonb_array_elements_text(auth.jwt() -> 'adminOf'))
    );

CREATE POLICY "Companies are insertable by super admins" ON companies
    FOR INSERT WITH CHECK (
        (auth.jwt() -> 'superAdmin')::boolean = true AND
        deleted = FALSE -- Ensure new records are not inserted as deleted
    );

CREATE POLICY "Companies are updatable by company admins and super admins" ON companies
    FOR UPDATE USING (
        (auth.jwt() -> 'superAdmin')::boolean = true OR
        id::text = ANY(SELECT jsonb_array_elements_text(auth.jwt() -> 'adminOf'))
    ) WITH CHECK (
        deleted = FALSE -- Prevent updating already soft-deleted rows (unless explicitly handled by super admin policy)
    );

CREATE POLICY "Companies are deletable by super admins" ON companies
    FOR DELETE USING (
        (auth.jwt() -> 'superAdmin')::boolean = true
    );

-- RLS Policies for users
CREATE POLICY "Users are viewable by themselves and super admins" ON users
    FOR SELECT USING (
        firebase_uid = auth.jwt() ->> 'sub' OR
        (auth.jwt() -> 'superAdmin')::boolean = true
    );

CREATE POLICY "Users are insertable by super admins" ON users
    FOR INSERT WITH CHECK (
        (auth.jwt() -> 'superAdmin')::boolean = true AND
        deleted = FALSE
    );

CREATE POLICY "Users are updatable by themselves and super admins" ON users
    FOR UPDATE USING (
        firebase_uid = auth.jwt() ->> 'sub' OR
        (auth.jwt() -> 'superAdmin')::boolean = true
    ) WITH CHECK (
        deleted = FALSE -- Assuming regular updates are on active users
    );

CREATE POLICY "Users are deletable by super admins" ON users
    FOR DELETE USING (
        (auth.jwt() -> 'superAdmin')::boolean = true
    );

-- RLS Policies for customers
CREATE POLICY "Customers are viewable by company admins and super admins" ON customers
    FOR SELECT USING (
        (auth.jwt() -> 'superAdmin')::boolean = true OR
        company_id::text = ANY(SELECT jsonb_array_elements_text(auth.jwt() -> 'adminOf'))
    );

CREATE POLICY "Customers are insertable by company admins and super admins" ON customers
    FOR INSERT WITH CHECK (
        (auth.jwt() -> 'superAdmin')::boolean = true OR
        company_id::text = ANY(SELECT jsonb_array_elements_text(auth.jwt() -> 'adminOf'))
    ) WITH CHECK (
        deleted = FALSE
    );

CREATE POLICY "Customers are updatable by company admins and super admins" ON customers
    FOR UPDATE USING (
        (auth.jwt() -> 'superAdmin')::boolean = true OR
        company_id::text = ANY(SELECT jsonb_array_elements_text(auth.jwt() -> 'adminOf'))
    ) WITH CHECK (
        deleted = FALSE
    );

CREATE POLICY "Customers are deletable by company admins and super admins" ON customers
    FOR DELETE USING (
        (auth.jwt() -> 'superAdmin')::boolean = true OR
        company_id::text = ANY(SELECT jsonb_array_elements_text(auth.jwt() -> 'adminOf'))
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

-- Sample Data for Testing
-- To correctly set deleted_by (UUID REFERENCES users(id)), we need to ensure a user exists first.
-- In a real deployment, a super admin user would be created via an Admin SDK script or initial setup.
-- This is a one-time setup step; re-running may require resetting deleted flags if you want to re-test soft deletions.

-- Insert a sample super admin user for testing purposes if not already present
INSERT INTO users (firebase_uid, email, name, super_admin) VALUES
('sample_super_admin_uid_123', 'superadmin@example.com', 'Super Admin User', true)
ON CONFLICT (firebase_uid) DO UPDATE SET name = EXCLUDED.name, super_admin = EXCLUDED.super_admin;

-- Get the ID of the super admin user for use in sample data for deleted_by
DO $$
DECLARE
    super_admin_user_id UUID;
    company_a_id UUID;
    company_b_id UUID;
    customer_a_email TEXT := 'anna.johansson@example.com';
    customer_b_email TEXT := 'info@stockholmoffices.com';
BEGIN
    SELECT id INTO super_admin_user_id FROM users WHERE email = 'superadmin@example.com';

    -- Sample companies
    INSERT INTO companies (name, contact_email, address, area_tag, subscription_plan) VALUES
    ('Test Cleaning Company', 'test@cleaningcompany.se', 'Storgatan 1, 111 22 Stockholm', 'Stockholm', 'premium'),
    ('Demo Office Solutions', 'demo@officesolutions.se', 'Kungsgatan 5, 111 43 Stockholm', 'Stockholm', 'basic')
    ON CONFLICT (name) DO NOTHING;

    -- Retrieve company IDs for customer inserts
    SELECT id INTO company_a_id FROM companies WHERE name = 'Test Cleaning Company';
    SELECT id INTO company_b_id FROM companies WHERE name = 'Demo Office Solutions';

    -- Sample customers with SwedPrime CRM fields
    INSERT INTO customers (company_id, name, email, phone, address, multiple_addresses, rut_rot_eligible, property_details, internal_notes, lead_source, preferred_contact_method, customer_tags, booking_frequency, feedback_rating, is_company, contact_person, consent_given, consent_timestamp, consent_details, area_tag, personnummer) VALUES
    (
        company_a_id,
        'Anna Johansson',
        customer_a_email,
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
        company_b_id,
        'Stockholm Office Solutions',
        customer_b_email,
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
    )
    ON CONFLICT (email, company_id) DO NOTHING;

    -- Execute soft deletion example
    UPDATE companies
    SET deleted = true, deleted_at = CURRENT_TIMESTAMP, deleted_by = super_admin_user_id
    WHERE name = 'Demo Office Solutions'
      AND deleted = false;

    UPDATE customers
    SET deleted = true, deleted_at = CURRENT_TIMESTAMP, deleted_by = super_admin_user_id
    WHERE email = customer_b_email
      AND company_id = company_b_id
      AND deleted = false;

END $$;

-- Future Phase Notes
-- Phase 2 (September 2025): Add leads, deals tables with customer_id references.
--   Consider partitioning 'customers' table by 'company_id' for large datasets.
--   Indexing on 'company_id' for `companies` (PK) and `admin_of` for `users` (GIN) is in place for future join performance.
-- Phase 3 (October 2025): Add tasks table with proper user assignment (assigned_to UUID REFERENCES users(id))
-- Phase 4 (November 2025): Add activities table for audit trail
-- All future tables will reference company_id for multi-tenancy
-- Future integration points will be added as actual columns when modules are implemented:
--   - customer_id UUID REFERENCES customers(id) for FMS integration
--   - subscription_id UUID for Subscription Manager integration
--   - assigned_crew UUID[] for crew management in FMS 
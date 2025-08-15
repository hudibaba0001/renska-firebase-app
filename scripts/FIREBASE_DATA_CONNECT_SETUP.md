# Firebase Data Connect Setup - Complete Guide for SwedPrime

## Overview
This guide will walk you through setting up Firebase Data Connect for the SwedPrime CRM system. Data Connect allows you to expose your PostgreSQL database through a GraphQL API, providing a robust backend for your CRM application.

**🎯 Target**: CRM Module (Phase 1) with future extensibility for FMS, Subscription Manager, and HRMS

## Prerequisites
- Firebase project with billing enabled
- Google Cloud SQL PostgreSQL instance (or create one during setup)
- Basic understanding of GraphQL
- **For Beginners**: [Firebase Cloud SQL Tutorial](https://firebase.google.com/docs/firestore/quickstart) (recommended)

## Cost Estimates
- **Development**: db-f1-micro (Free for 3 months)
- **Production**: ~$9.37/month base + $0.01/GB storage
- **Scaling**: Read replicas ~$25/month each
- **Recommendation**: Start with one tenant, scale post-MVP

## Step-by-Step Setup

### Step 1: Enable Firebase Data Connect

1. **Navigate to Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - In the left sidebar, click on **"Data Connect"**

2. **Enable Data Connect**
   - Click **"Get started"** or **"Enable Data Connect"**
   - Accept the terms and conditions
   - Wait for the service to be enabled (may take a few minutes)

### Step 2: Connect Your Data Source

1. **Create Data Source**
   - Click **"Create data source"**
   - You'll see two options:
     - **"Create new Cloud SQL instance"** (recommended for new projects)
     - **"Use existing Cloud SQL instance"** (if you already have one)

2. **Choose Cloud SQL Instance**
   - **For new instances**: Select "Create new Cloud SQL instance"
     - Choose "db-f1-micro" (free tier for 3 months)
     - **Region**: europe-west1 (closest to Sweden)
     - This is perfect for development and testing
   - **For existing instances**: Select "Use existing Cloud SQL instance"
     - Choose your existing PostgreSQL instance

3. **Configure Database**
   - Set up your PostgreSQL instance with the following settings:
     - **Database engine**: PostgreSQL
     - **Version**: PostgreSQL 14 or higher
     - **Region**: europe-west1 (for Swedish users)
     - **Machine type**: db-f1-micro (free tier) or larger for production

### Step 3: Set Up Database Schema

1. **Connect to Your Database**
   - Use the Cloud SQL connection details provided
   - Connect via Cloud Shell, local client, or Cloud Console

2. **Run the Schema Script**
   ```bash
   # Connect to your PostgreSQL instance
   gcloud sql connect [INSTANCE_NAME] --user=postgres
   
   # Run the SwedPrime CRM schema
   \i scripts/data-connect-schema.sql
   ```

3. **Verify Schema Creation**
   ```sql
   -- Check that tables were created
   \dt
   
   -- Verify sample data
   SELECT * FROM companies;
   SELECT * FROM customers;
   ```

**🔧 Future Extensibility Notes**:
- Schema includes `customerId` fields for future FMS integration
- `companyId` structure supports multi-module architecture
- Consider adding `areaTag` for regional management (see Step 4)

### Step 4: Generate GraphQL Schema

You have two options for generating the GraphQL schema:

#### Option A: Use Gemini (Recommended)

1. **Access Schema Generator**
   - In the Data Connect console, click **"Schema generator"**
   - You'll see the Gemini-powered schema generator interface

2. **Describe Your App**
   - In the text input field, describe your SwedPrime CRM:
   ```
   SwedPrime CRM system for Swedish cleaning companies. 
   Multi-tenant SaaS with customers, leads, deals, tasks, and activities. 
   Supports both individual and company customers with RUT/ROT tax compliance and GDPR requirements.
   Key tables: companies (tenants), users, customers (with 13 fields including RUT/ROT eligibility, 
   multiple addresses, customer tags, feedback ratings, consent tracking, area tags), leads, deals, tasks, activities.
   PostgreSQL database with row-level security for multi-tenancy.
   Future modules: FMS (field management), Subscription Manager, HRMS.
   ```

3. **Let Gemini Generate Schema**
   - Click the submit button (paper airplane icon)
   - Gemini will analyze your description and generate a complete GraphQL schema
   - Review the generated schema and make any necessary adjustments

4. **Alternative: Use Suggested Templates**
   - If Gemini doesn't generate exactly what you need, try one of the suggested templates:
     - **"A CRM application"** (closest match)
     - **"A business management app"**
     - Then customize the generated schema

#### Option B: Manual Schema Creation

1. **Create Schema File**
   - Create a new file called `schema.graphql`
   - Define your GraphQL types manually

2. **Define Types**
   ```graphql
   type Company {
     id: ID!
     name: String!
     contact_email: String!
     address: String
     rut_eligible: Boolean!
     consent_given: Boolean!  # GDPR compliance
     consent_timestamp: String
     area_tag: String!        # Regional management
     subscription_active: Boolean!
     created_at: String!
     updated_at: String!
   }
   
   type Customer {
     id: ID!
     company_id: ID!
     name: String!
     email: String!
     phone: String!
     address: String!
     multiple_addresses: [String!]
     rut_rot_eligible: Boolean!
     property_details: String
     internal_notes: String
     lead_source: String
     preferred_contact_method: String
     customer_tags: [String!]
     booking_frequency: String
     feedback_rating: Int
     is_company: Boolean!
     contact_person: String
     secondary_phone: String
     secondary_email: String
     company_size: String
     branch_count: Int
     consent_given: Boolean!  # GDPR compliance
     consent_timestamp: String
     area_tag: String!        # Regional management
     created_at: String!
     updated_at: String!
   }
   
   # Add other types for leads, deals, tasks, activities...
   ```

### Step 5: Configure Data Connect

1. **Upload Schema**
   - If using Gemini: The schema will be automatically applied
   - If manual: Upload your `schema.graphql` file

2. **Map Database Tables**
   - Data Connect will automatically map your PostgreSQL tables to GraphQL types
   - Verify the mappings are correct
   - Adjust any field mappings if needed

3. **Test the API**
   - Use the built-in GraphQL playground
   - Test a simple query:
   ```graphql
   query {
     companies {
       id
       name
       contact_email
       consent_given
       area_tag
     }
   }
   ```

### Step 6: Configure Security

1. **Set Up Row Level Security (RLS)**
   - Ensure your PostgreSQL RLS policies are active
   - Test that users can only access their company's data

2. **Configure Firebase Auth Integration**
   - Set up custom claims for `adminOf` and `superAdmin`
   - Ensure JWT tokens include the necessary claims

### Step 7: Update Environment Variables

1. **Get Your Data Connect Endpoint**
   - Copy the GraphQL endpoint URL from Data Connect console
   - It will look like: `https://[PROJECT_ID]-[REGION].data-connect.firebaseapp.com/graphql`

2. **Update Environment File**
   ```bash
   # Edit webapp/.env.local
   VITE_DATA_CONNECT_ENDPOINT=https://[PROJECT_ID]-[REGION].data-connect.firebaseapp.com/graphql
   VITE_FIREBASE_PROJECT_ID=[YOUR_PROJECT_ID]
   ```

### Step 8: Test Your CRM

1. **Start Development Server**
   ```bash
   cd webapp
   npm run dev
   ```

2. **Access Your CRM**
   - Navigate to: `http://localhost:5173/admin/[COMPANY_ID]/crm-data`
   - Test creating, reading, updating, and deleting customers
   - Verify all 13 SwedPrime CRM fields work correctly
   - Test GDPR consent tracking and area tagging

### Step 9: Integrate with React Stack

1. **Install Apollo Client**
   ```bash
   cd webapp
   npm install @apollo/client graphql
   ```

2. **Configure Apollo Client**
   - Update `/webapp/src/firebase/apollo-client.js` with your Data Connect endpoint
   - Ensure TypeScript compatibility for React 19.1.0

3. **Test Integration**
   - Verify Apollo Client connects to Data Connect
   - Test CRUD operations in the React app
   - Ensure Tailwind CSS responsiveness

## Troubleshooting

### Common Issues

1. **"Data Connect not available"**
   - Ensure billing is enabled on your Firebase project
   - Check that you're in a supported region

2. **"Cannot connect to database"**
   - Verify Cloud SQL instance is running
   - Check firewall rules and connection settings
   - Ensure the database user has proper permissions

3. **"Schema generation failed"**
   - Try a simpler description for Gemini
   - Use the manual schema creation option
   - Check that your database tables exist and are accessible

4. **"GraphQL queries failing"**
   - Verify RLS policies are correctly configured
   - Check that user authentication is working
   - Ensure custom claims are properly set

5. **"React integration issues"**
   - Verify Apollo Client configuration
   - Check environment variables
   - Ensure TypeScript types are correct

### Getting Help

- **Firebase Documentation**: [Data Connect Docs](https://firebase.google.com/docs/data-connect)
- **GraphQL Playground**: Use the built-in playground in Data Connect console
- **Community Support**: [Firebase Community](https://firebase.google.com/community)
- **Beginner Resources**: [Firebase Codelabs](https://firebase.google.com/codelabs)

## Production Considerations

1. **Scaling**
   - Upgrade from db-f1-micro to larger instance for production
   - Consider read replicas for high-traffic applications
   - Implement proper caching strategies

2. **Security**
   - Review and test all RLS policies
   - Implement proper audit logging
   - Regular security updates and monitoring
   - GDPR compliance verification

3. **Monitoring**
   - Set up Cloud Monitoring for your database
   - Monitor GraphQL query performance
   - Track usage and costs
   - Monitor consent tracking compliance

## Future Module Planning

### Phase 2: Field Management System (FMS)
- **Timeline**: September 2025
- **Schema Extension**: Add FMS tables (crews, schedules, assignments)
- **Integration**: Link to CRM customer data via `customerId`

### Phase 3: Subscription Manager
- **Timeline**: October 2025
- **Schema Extension**: Add subscription and billing tables
- **Integration**: Connect to company subscription data

### Phase 4: HRMS
- **Timeline**: November 2025
- **Schema Extension**: Add HR management tables
- **Integration**: Link to company employee data

## Benefits of This Setup

✅ **Professional CRM Solution** - Enterprise-grade GraphQL API
✅ **Swedish Market Ready** - RUT/ROT compliance built-in
✅ **GDPR Compliant** - Consent tracking and data protection
✅ **Multi-tenant Security** - Company data isolation
✅ **Scalable Architecture** - Firebase Data Connect powered
✅ **Real-time Updates** - Apollo Client integration
✅ **Future-Ready** - Extensible for FMS, Subscription, HRMS
✅ **Production Ready** - Security and performance optimized

## Timeline Summary

- **Week 1-2**: Complete Data Connect setup and schema generation
- **Week 3-4**: Integrate with React frontend and test CRM functionality
- **Week 5-6**: Optimize performance and prepare for production
- **Week 7-8**: Launch CRM MVP and gather user feedback

Your SwedPrime CRM is now ready for production deployment! 🚀 
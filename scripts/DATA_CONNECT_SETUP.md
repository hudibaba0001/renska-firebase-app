# Firebase Data Connect CRM Setup Guide

## 🚀 Overview

This guide will help you set up a robust, production-ready CRM using Firebase Data Connect with PostgreSQL backend. This approach eliminates the complex debugging issues we've been experiencing with Firestore and provides a professional, scalable solution.

## 📋 Prerequisites

1. **Firebase Project**: `swed-de2a3`
2. **Firebase CLI**: Version 14.11.1 (already installed)
3. **PostgreSQL Database**: We'll set this up
4. **Node.js**: For running scripts

## 🔧 Step 1: Enable Firebase Data Connect

### 1.1 Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `swed-de2a3`
3. Navigate to **Data Connect** in the left sidebar

### 1.2 Enable Data Connect
1. Click **"Get Started"** or **"Enable Data Connect"**
2. Accept the terms and conditions
3. Wait for the service to be enabled (may take a few minutes)

## 🗄️ Step 2: Set Up PostgreSQL Database

### Option A: Google Cloud SQL (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **SQL** in the left sidebar
3. Click **"Create Instance"**
4. Choose **PostgreSQL**
5. Configure:
   - **Instance ID**: `renska-crm-db`
   - **Database version**: PostgreSQL 15
   - **Machine type**: `db-f1-micro` (for development)
   - **Storage**: 10 GB
   - **Region**: `europe-west1` (Stockholm)
6. Click **"Create"**

### Option B: Local PostgreSQL (Development)
```bash
# Install PostgreSQL locally
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql postgresql-contrib

# Create database
createdb renska_crm
```

## 🔐 Step 3: Configure Database Connection

### 3.1 Get Connection Details
For Google Cloud SQL:
1. Go to your SQL instance
2. Click **"Connections"** tab
3. Note the **Public IP address**
4. Create a user with password

For Local PostgreSQL:
```bash
# Create user
sudo -u postgres createuser --interactive renska_crm_user
# Set password
sudo -u postgres psql
ALTER USER renska_crm_user PASSWORD 'your_secure_password';
```

### 3.2 Update Connection String
Update the connection details in your Firebase project:
1. Go to Firebase Console > Data Connect
2. Click **"Add Data Source"**
3. Choose **PostgreSQL**
4. Enter connection details:
   - **Host**: Your PostgreSQL host
   - **Port**: 5432
   - **Database**: renska_crm
   - **Username**: renska_crm_user
   - **Password**: your_secure_password

## 📊 Step 4: Create Database Schema

### 4.1 Run Schema Script
```bash
# Connect to your PostgreSQL database
psql -h your_host -U renska_crm_user -d renska_crm -f scripts/data-connect-schema.sql
```

### 4.2 Verify Schema
```sql
-- Connect to database and verify tables
\dt

-- Should show:
-- companies, users, customers, leads, deals, tasks, activities
```

## 🔗 Step 5: Configure Data Connect

### 5.1 Create Data Source
1. In Firebase Console > Data Connect
2. Click **"Add Data Source"**
3. Select your PostgreSQL connection
4. Name it: `renska_crm_db`

### 5.2 Configure Tables
1. Select all tables: `companies`, `users`, `customers`, `leads`, `deals`, `tasks`, `activities`
2. Set up relationships:
   - `customers.company_id` → `companies.id`
   - `leads.company_id` → `companies.id`
   - `deals.company_id` → `companies.id`
   - `tasks.company_id` → `companies.id`
   - `activities.company_id` → `companies.id`

### 5.3 Set Up Security Rules
Configure row-level security:
```sql
-- Example: Users can only see data from their company
CREATE POLICY "Users can only access their company data" ON customers
    FOR ALL USING (company_id IN (
        SELECT company_id FROM users WHERE id = current_user_id()
    ));
```

## 🎯 Step 6: Generate GraphQL Schema

### 6.1 Auto-Generate Schema
1. In Firebase Console > Data Connect
2. Click **"Generate Schema"**
3. Review the generated GraphQL schema
4. Save the schema

### 6.2 Download SDK
1. Click **"Download SDK"**
2. Choose **JavaScript/TypeScript**
3. Download the generated client

## ⚡ Step 7: Update React Application

### 7.1 Install Dependencies
```bash
cd webapp
npm install @firebase/data-connect graphql
```

### 7.2 Update CRM Component
The `DataConnectCRM.jsx` component is already prepared. Update it to use the generated SDK:

```javascript
// Replace mock data with real Data Connect queries
import { useQuery, useMutation } from '@firebase/data-connect';

// Example query
const { data: customers, loading } = useQuery(`
  query GetCustomers($companyId: ID!) {
    customers(where: { company_id: { eq: $companyId } }) {
      id
      first_name
      last_name
      email
      status
      created_at
    }
  }
`, { companyId });
```

## 🧪 Step 8: Test the Implementation

### 8.1 Start Development Server
```bash
cd webapp
npm run dev
```

### 8.2 Access New CRM
1. Go to: `http://localhost:5179/admin/your-company-id/crm-data`
2. Test all functionality:
   - Dashboard stats
   - Customer list
   - Lead management
   - Deal tracking
   - Task management

### 8.3 Verify Data Flow
1. Check browser console for any errors
2. Verify data is loading from PostgreSQL
3. Test CRUD operations
4. Verify multi-tenancy (company isolation)

## 🚀 Step 9: Deploy to Production

### 9.1 Build Application
```bash
cd webapp
npm run build
```

### 9.2 Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 9.3 Update Production Database
1. Create production PostgreSQL instance
2. Run schema migration
3. Update connection strings
4. Test production deployment

## 📈 Benefits of This Approach

### ✅ Advantages:
1. **Relational Database**: Proper relationships and constraints
2. **Type Safety**: Generated TypeScript types
3. **Better Performance**: Optimized queries
4. **Professional Grade**: Enterprise-level reliability
5. **Future-Proof**: Firebase's strategic direction
6. **Less Debugging**: Structured data prevents issues

### ❌ Current Issues Solved:
1. **No more complex Firestore queries**
2. **No more data loading issues**
3. **No more permission debugging**
4. **No more NoSQL limitations**
5. **Professional CRM functionality**

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Check firewall rules
   - Verify connection string
   - Ensure database is running

2. **Permission Denied**
   - Check user permissions
   - Verify row-level security policies
   - Check Firebase authentication

3. **Schema Generation Failed**
   - Ensure all tables exist
   - Check foreign key relationships
   - Verify data types

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Review PostgreSQL logs
3. Check browser console for errors
4. Verify all prerequisites are met

## 🎉 Next Steps

Once Data Connect CRM is working:
1. **Migrate existing data** from Firestore
2. **Add advanced features** (reports, analytics)
3. **Implement real-time updates**
4. **Add mobile app support**
5. **Scale to multiple companies**

---

**This approach will save us days of debugging and provide a professional, scalable CRM solution that actually works!** 
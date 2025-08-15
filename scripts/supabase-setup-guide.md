# Supabase Setup Guide for CRM

## Overview
This guide shows how to integrate Supabase PostgreSQL with your existing Firebase app for a robust CRM system.

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login with your Google account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `reniska-crm`
   - Database Password: (generate a strong password)
   - Region: `West Europe` (closest to Sweden)
6. Click "Create new project"

## Step 2: Get Connection Details
1. Go to Settings > Database
2. Copy the connection details:
   - Host: `db.xxxxxxxxxxxxx.supabase.co`
   - Database: `postgres`
   - Port: `5432`
   - User: `postgres`
   - Password: (the one you set)

## Step 3: Run Schema Script
1. Go to SQL Editor in Supabase
2. Copy the contents of `scripts/data-connect-schema.sql`
3. Paste and run the script
4. Verify tables are created

## Step 4: Configure Firebase Data Connect
1. Go to Firebase Console > Data Connect
2. Add PostgreSQL data source
3. Use Supabase connection details
4. Test connection

## Step 5: Update Environment Variables
Add to `webapp/.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 6: Install Supabase Client
```bash
cd webapp
npm install @supabase/supabase-js
```

## Step 7: Create Supabase Client
Create `webapp/src/firebase/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 8: Update CRM Components
The CRM components will now use Supabase instead of Firestore for data operations.

## Benefits
- ✅ Keep existing Firebase auth
- ✅ Keep existing booking system
- ✅ Better CRM performance
- ✅ Proper relational data
- ✅ Real-time subscriptions
- ✅ Type safety

## Migration Timeline
- Setup: 30 minutes
- Testing: 15 minutes
- Data migration: 10 minutes
- Total: ~1 hour

## No Data Loss
- All existing data stays in Firebase
- CRM data goes to Supabase
- Both systems work together
- Gradual migration possible 
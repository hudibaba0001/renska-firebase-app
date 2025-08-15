# 🔍 Checking Your Missing Data

## The Problem
Your services, calculators, and bookings are missing because the data structure has changed. The application now expects data to be in **subcollections** under each company, but your data might be in the **old top-level collections**.

## How to Check Your Data

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/project/swed-de2a3/firestore/data)
2. Navigate to Firestore Database
3. Check these collections:

**Old Structure (Top-level collections):**
- `services` - Look for documents with `companyId: "Yfun7EgM8ip8lQmzIuy6"`
- `bookings` - Look for documents with `companyId: "Yfun7EgM8ip8lQmzIuy6"`
- `customers` - Look for documents with `companyId: "Yfun7EgM8ip8lQmzIuy6"`
- `calculators` - Look for documents with `companyId: "Yfun7EgM8ip8lQmzIuy6"`

**New Structure (Subcollections):**
- `companies/Yfun7EgM8ip8lQmzIuy6/services`
- `companies/Yfun7EgM8ip8lQmzIuy6/bookings`
- `companies/Yfun7EgM8ip8lQmzIuy6/customers`
- `companies/Yfun7EgM8ip8lQmzIuy6/calculators`

### Option 2: Web Application Console
1. Open your web application
2. Log in as admin
3. Open browser console (F12)
4. Run the test script from `scripts/test-data-access.js`

## What to Look For
- **If you find data in old collections**: We need to migrate it to the new structure
- **If you find data in new collections**: The data is already in the right place
- **If you find no data**: The data might have been deleted or is in a different location

## Next Steps
Once you check the Firebase console, let me know:
1. Where you found your data (old vs new structure)
2. How many services, bookings, and customers you found
3. Any error messages you see

Then I can help you migrate the data to the correct structure. 
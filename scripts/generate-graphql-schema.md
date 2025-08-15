# Firebase Data Connect - GraphQL Schema Generation Guide

## 🎯 **Phase 2: Generate GraphQL Schema**

Now that your PostgreSQL database is set up, let's generate the GraphQL schema using Firebase Data Connect's built-in Gemini-powered generator.

### **Step 1: Access Firebase Data Connect Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `sandhu-crm-db` (or your project name)
3. Navigate to **Data Connect** in the left sidebar
4. Click on your database connection

### **Step 2: Generate GraphQL Schema**

1. In the Data Connect console, look for **"Generate Schema"** or **"Schema"** section
2. Click **"Generate GraphQL Schema"** or similar button
3. Firebase will use Gemini AI to analyze your PostgreSQL schema and generate GraphQL types

### **Step 3: Review Generated Schema**

The generated schema should include:

```graphql
# Example of what should be generated:
type Company {
  id: ID!
  name: String!
  contactEmail: String!
  address: String
  areaTag: String
  subscriptionPlan: String
  subscriptionActive: Boolean
  createdAt: String!
  updatedAt: String!
  deleted: Boolean
  deletedAt: String
  deletedBy: User
  customers: [Customer!]!
}

type User {
  id: ID!
  firebaseUid: String!
  email: String!
  name: String
  role: String
  adminOf: [String!]
  superAdmin: Boolean
  createdAt: String!
  updatedAt: String!
  deleted: Boolean
  deletedAt: String
  deletedBy: User
  companies: [Company!]!
}

type Customer {
  id: ID!
  companyId: String!
  name: String!
  email: String!
  phone: String!
  address: String!
  multipleAddresses: [String!]
  rutRotEligible: Boolean
  propertyDetails: String
  internalNotes: String
  leadSource: String
  preferredContactMethod: String
  customerTags: [String!]
  bookingFrequency: String
  feedbackRating: Int
  isCompany: Boolean
  contactPerson: String
  secondaryPhone: String
  secondaryEmail: String
  companySize: String
  branchCount: Int
  consentGiven: Boolean
  consentTimestamp: String
  consentDetails: String
  areaTag: String
  personnummer: String
  createdAt: String!
  updatedAt: String!
  deleted: Boolean
  deletedAt: String
  deletedBy: User
  company: Company!
}
```

### **Step 4: Customize Schema (Optional)**

If needed, you can modify the generated schema to:
- Add custom resolvers
- Modify field names
- Add computed fields
- Add filtering and sorting capabilities

### **Step 5: Deploy Schema**

1. Click **"Deploy Schema"** or **"Save"**
2. Firebase will make your GraphQL API available
3. Note the **GraphQL endpoint URL** - you'll need this for your React app

### **Step 6: Test the API**

You can test queries like:

```graphql
# Get all companies
query {
  companies {
    id
    name
    contactEmail
    customers {
      id
      name
      email
    }
  }
}

# Get customers for a specific company
query {
  customers(where: { companyId: { eq: "company-uuid" } }) {
    id
    name
    email
    phone
    rutRotEligible
  }
}
```

## 🔧 **Environment Variables**

Once you have the GraphQL endpoint, update your `.env.local`:

```bash
# Add to webapp/.env.local
VITE_FIREBASE_DATA_CONNECT_URL=https://your-project.firebaseapp.com/graphql
```

## 📋 **Next Phase: React CRM Development**

After the GraphQL schema is deployed, we'll move to Phase 3:
- Create React components for customer management
- Implement CRUD operations
- Add filtering and search
- Build the CRM dashboard

## 🎯 **Success Criteria**

✅ Schema generation completed
✅ GraphQL endpoint available
✅ Basic queries working
✅ Environment variables configured

---

**Ready to proceed? Let me know when you've generated the GraphQL schema!** 🚀 
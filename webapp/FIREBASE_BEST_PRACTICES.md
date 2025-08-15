# Firebase Best Practices for SwedPrime

## 🏗️ **Systematic Architecture Overview**

### **Multi-Tenant Structure**
```
/companies/{companyId}/
├── name, slug, adminUid, subscriptionStatus
├── /services/{serviceId}/
│   ├── name, pricingModel, windowTypes, addOns
├── /bookings/{bookingId}/
│   ├── customerName, totalPrice, window_0, window_1, etc.
├── /calculators/{calculatorId}/
│   ├── name, slug, status, configuration
└── /coupons/{couponId}/
    ├── code, discountType, discountValue, usage
```

## 📊 **Data Structure Standards**

### **1. Flat Data Structure**
✅ **Good:**
```javascript
// Flat structure for easy querying
{
  window_0: 1,
  window_1: 2,
  window_2: 0,
  addon_Ladder_needed: true,
  addon_Clean_window_frames: false
}
```

❌ **Avoid:**
```javascript
// Nested structure - harder to query
{
  windows: {
    type0: { quantity: 1, price: 90 },
    type1: { quantity: 2, price: 90 }
  }
}
```

### **2. Consistent Field Naming**
- Use **snake_case** for field names
- Use **camelCase** for JavaScript variables
- Prefix related fields: `window_0`, `window_1`, `addon_ladder`

### **3. Timestamp Management**
```javascript
// Always include timestamps
{
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

## 🔒 **Security Rules Best Practices**

### **1. Tenant Isolation**
```javascript
// Ensure users can only access their company data
match /companies/{companyId} {
  allow read, write: if isCompanyAdmin(companyId);
  
  match /bookings/{bookingId} {
    allow read, write: if isCompanyAdmin(companyId);
  }
}
```

### **2. Data Validation**
```javascript
// Validate data structure in security rules
allow create: if 
  request.resource.data.customerName is string &&
  request.resource.data.totalPrice is number &&
  request.resource.data.totalPrice >= 0;
```

### **3. Role-Based Access**
```javascript
// Super admin can access everything
function isSuperAdmin() {
  return request.auth.token.superAdmin == true;
}

// Company admin can access their company
function isCompanyAdmin(companyId) {
  return request.auth.token.adminOf == companyId;
}
```

## ⚡ **Performance Optimization**

### **1. Efficient Queries**
```javascript
// ✅ Good: Use indexes for complex queries
const q = query(
  collection(db, 'companies', companyId, 'bookings'),
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc'),
  limit(50)
);

// ❌ Avoid: Querying without indexes
const q = query(
  collection(db, 'companies', companyId, 'bookings'),
  where('status', '==', 'pending'),
  where('totalPrice', '>', 1000), // Requires composite index
  orderBy('createdAt', 'desc')
);
```

### **2. Pagination**
```javascript
// Implement pagination for large datasets
const getBookings = async (companyId, lastDoc = null, limit = 20) => {
  let q = query(
    collection(db, 'companies', companyId, 'bookings'),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  return getDocs(q);
};
```

### **3. Caching Strategy**
```javascript
// Cache frequently accessed data
const cache = new Map();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TIMEOUT) {
    return cached.data;
  }
  return null;
};
```

## 🛡️ **Error Handling**

### **1. Centralized Error Management**
```javascript
// Use centralized error handler
import { errorHandler, ERROR_TYPES } from '../utils/errorHandler.js';

try {
  await addDoc(collection(db, 'bookings'), bookingData);
} catch (error) {
  errorHandler.handleFirebaseError(error, {
    operation: 'createBooking',
    companyId,
    bookingData
  });
}
```

### **2. Graceful Degradation**
```javascript
// Handle offline scenarios
const saveBooking = async (bookingData) => {
  try {
    return await addDoc(collection(db, 'bookings'), bookingData);
  } catch (error) {
    if (error.code === 'unavailable') {
      // Store locally for later sync
      storeOfflineBooking(bookingData);
      return { offline: true, id: generateOfflineId() };
    }
    throw error;
  }
};
```

## 📈 **Scalability Considerations**

### **1. Collection Design**
```javascript
// ✅ Good: Subcollections for related data
/companies/{companyId}/bookings/{bookingId}
/companies/{companyId}/services/{serviceId}

// ❌ Avoid: Single large collection
/bookings (with companyId field)
```

### **2. Index Management**
```javascript
// Create composite indexes for complex queries
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### **3. Data Size Limits**
- **Document size**: Max 1MB
- **Array size**: Max 20,000 elements
- **Field name length**: Max 1,500 characters
- **Field value length**: Max 1MB

## 🔄 **Data Consistency**

### **1. Batch Operations**
```javascript
// Use batch writes for related operations
const batch = writeBatch(db);

// Create booking
const bookingRef = doc(collection(db, 'companies', companyId, 'bookings'));
batch.set(bookingRef, bookingData);

// Update company stats
const companyRef = doc(db, 'companies', companyId);
batch.update(companyRef, {
  totalBookings: increment(1),
  updatedAt: serverTimestamp()
});

await batch.commit();
```

### **2. Transaction Safety**
```javascript
// Use transactions for critical operations
const updateBookingStatus = async (bookingId, newStatus) => {
  return runTransaction(db, async (transaction) => {
    const bookingRef = doc(db, 'companies', companyId, 'bookings', bookingId);
    const bookingDoc = await transaction.get(bookingRef);
    
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    transaction.update(bookingRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  });
};
```

## 🧪 **Testing Best Practices**

### **1. Test Data Management**
```javascript
// Use separate test collections
const TEST_COMPANY_ID = 'test-company-' + Date.now();

// Clean up after tests
const cleanupTestData = async () => {
  const batch = writeBatch(db);
  const bookingsRef = collection(db, 'companies', TEST_COMPANY_ID, 'bookings');
  const snapshot = await getDocs(bookingsRef);
  
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
};
```

### **2. Mock Firebase**
```javascript
// Mock Firebase for unit tests
import { mockFirestore } from 'firebase-mock';

const mockDb = mockFirestore();
jest.mock('../firebase/init', () => ({
  db: mockDb
}));
```

## 📊 **Monitoring & Analytics**

### **1. Performance Monitoring**
```javascript
// Track query performance
const trackQueryPerformance = async (queryName, queryFn) => {
  const startTime = performance.now();
  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    
    logger.info('Query performance', {
      query: queryName,
      duration: Math.round(duration),
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('Query failed', {
      query: queryName,
      duration: Math.round(duration),
      error: error.message
    });
    throw error;
  }
};
```

### **2. Usage Analytics**
```javascript
// Track Firebase usage
const trackFirebaseUsage = (operation, collection, documentCount = 1) => {
  logger.info('Firebase operation', {
    operation,
    collection,
    documentCount,
    timestamp: new Date().toISOString()
  });
};
```

## 🚀 **Deployment Best Practices**

### **1. Environment Configuration**
```javascript
// Use environment-specific configs
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};

// Validate required config
const required = ['apiKey', 'projectId'];
const missing = required.filter(k => !firebaseConfig[k]);
if (missing.length) {
  throw new Error(`Missing Firebase config: ${missing.join(', ')}`);
}
```

### **2. Security Rules Deployment**
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### **3. Production Checklist**
- [ ] Security rules deployed and tested
- [ ] Indexes created for all queries
- [ ] Error handling implemented
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] Data validation active

## 📚 **Code Organization**

### **1. Service Layer Pattern**
```javascript
// services/firestore.js
export class FirestoreService {
  static async getBookings(companyId, filters = {}) {
    // Implementation
  }
  
  static async createBooking(companyId, bookingData) {
    // Implementation with validation
  }
}
```

### **2. Data Validation**
```javascript
// utils/validation.js
import { validateData, sanitizeData } from './dataSchemas.js';

export const validateBooking = (data) => {
  const errors = validateData(data, BOOKING_SCHEMA);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  return sanitizeData(data, BOOKING_SCHEMA);
};
```

### **3. Error Boundaries**
```javascript
// components/ErrorBoundary.jsx
class FirebaseErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    errorHandler.handleError(error, {
      component: this.constructor.name,
      errorInfo
    });
  }
}
```

## 🎯 **Swedish Industry Specifics**

### **1. RUT Integration**
```javascript
// Handle Swedish RUT tax deduction
const calculateRutDiscount = (amount) => {
  return Math.round(amount * 0.30); // 30% RUT deduction
};

// Validate personal number format
const validatePersonalNumber = (pnr) => {
  return /^\d{10,12}$/.test(pnr);
};
```

### **2. GDPR Compliance**
```javascript
// Ensure GDPR compliance
const bookingData = {
  ...customerData,
  gdprConsent: true,
  consentTimestamp: serverTimestamp(),
  dataRetentionPolicy: '3_years'
};
```

This systematic approach ensures our Firebase implementation is **scalable**, **secure**, and **maintainable** for the Swedish cleaning industry complexity. 
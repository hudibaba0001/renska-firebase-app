# SwedPrime Database Architecture

**Document Version**: 1.0  
**Last Updated**: July 26, 2025  
**Database System**: Google Cloud Firestore (NoSQL)  
**Architecture Pattern**: Multi-tenant SaaS with Document-based Collections  

## 📊 Database Overview

SwedPrime uses **Google Cloud Firestore** as its primary database, implementing a **multi-tenant architecture** with company-based data isolation. The database is designed for scalability, security, and GDPR compliance while supporting Swedish market requirements including RUT deduction tracking.

### Key Characteristics:
- **NoSQL Document Database** (Firestore)
- **Multi-tenant Architecture** with company isolation
- **Soft-delete Pattern** for data retention and GDPR compliance
- **Real-time Synchronization** capabilities
- **Offline Support** with local persistence
- **ACID Transactions** for data consistency

## 🏗️ Database Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIRESTORE DATABASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /users/{userId}                                               │
│  ├── uid: string                                               │
│  ├── email: string                                             │
│  ├── name: string                                              │
│  ├── superAdmin: boolean                                       │
│  ├── adminOf: array<companyId>                                 │
│  ├── createdAt: timestamp                                      │
│  ├── updatedAt: timestamp                                      │
│  └── deleted: boolean                                          │
│                                                                 │
│  /companies/{companyId}                                        │
│  ├── name: string                                              │
│  ├── contactEmail: string                                      │
│  ├── address: string                                           │
│  ├── adminUid: string                                          │
│  ├── personnummer: string (encrypted)                          │
│  ├── RUTEligible: boolean                                      │
│  ├── consent: boolean                                          │
│  ├── consentTimestamp: timestamp                               │
│  ├── subscription: object                                      │
│  │   ├── active: boolean                                       │
│  │   ├── plan: string                                          │
│  │   └── status: string                                        │
│  ├── createdAt: timestamp                                      │
│  ├── updatedAt: timestamp                                      │
│  ├── deleted: boolean                                          │
│  └── isPublic: boolean                                         │
│                                                                 │
│      /companies/{companyId}/services/{serviceId}               │
│      ├── name: string                                          │
│      ├── price: number                                         │
│      ├── duration: number                                      │
│      ├── RUTEligible: boolean                                  │
│      ├── companyId: string                                     │
│      ├── createdAt: timestamp                                  │
│      ├── updatedAt: timestamp                                  │
│      └── deleted: boolean                                      │
│                                                                 │
│      /companies/{companyId}/customers/{customerId}             │
│      ├── name: string                                          │
│      ├── email: string                                         │
│      ├── status: string (lead|active|inactive|prospect)        │
│      ├── customerType: string (private|business)               │
│      ├── source: string                                        │
│      ├── personnummer: string (encrypted)                      │
│      ├── consent: boolean                                      │
│      ├── consentTimestamp: timestamp                           │
│      ├── consentDetails: string                                │
│      ├── totalSpent: number                                    │
│      ├── companyId: string                                     │
│      ├── createdAt: timestamp                                  │
│      ├── updatedAt: timestamp                                  │
│      └── deleted: boolean                                      │
│                                                                 │
│      /companies/{companyId}/bookings/{bookingId}               │
│      ├── companyId: string                                     │
│      ├── customerId: string                                    │
│      ├── serviceId: string                                     │
│      ├── customerEmail: string                                 │
│      ├── date: timestamp                                       │
│      ├── price: number                                         │
│      ├── personnummer: string (encrypted)                      │
│      ├── consent: boolean                                      │
│      ├── consentTimestamp: timestamp                           │
│      ├── consentDetails: string                                │
│      ├── RUTEligible: boolean                                  │
│      ├── isRecurring: boolean                                  │
│      ├── frequency: string (weekly|monthly)                    │
│      ├── occurrenceNumber: number                              │
│      ├── totalOccurrences: number                              │
│      ├── originalDate: timestamp                               │
│      ├── createdAt: timestamp                                  │
│      ├── updatedAt: timestamp                                  │
│      └── deleted: boolean                                      │
│                                                                 │
│      /companies/{companyId}/coupons/{couponId}                 │
│      ├── code: string                                          │
│      ├── discountType: string (amount|percentage)              │
│      ├── discountAmount: number                                │
│      ├── appliesTo: string (all|specific)                      │
│      ├── selectedServices: array<serviceId>                    │
│      ├── expiresAt: timestamp                                  │
│      ├── usageLimit: number                                    │
│      ├── usageCount: number                                    │
│      ├── restrictToExpirationDate: boolean                     │
│      ├── canCombineWithRecurring: boolean                      │
│      ├── applyToRecurring: string (all|first)                  │
│      ├── companyId: string                                     │
│      ├── createdAt: timestamp                                  │
│      ├── updatedAt: timestamp                                  │
│      └── deleted: boolean                                      │
│                                                                 │
│  /companyStats/{companyId}                                     │
│  ├── total: number                                             │
│  ├── byStatus: object                                          │
│  ├── byType: object                                            │
│  ├── bySource: object                                          │
│  ├── totalRevenue: number                                      │
│  ├── averageOrderValue: number                                 │
│  ├── lastUpdated: timestamp                                    │
│  └── computedAt: timestamp                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔑 Data Model Details

### 1. **Users Collection** (`/users/{userId}`)

**Purpose**: Store user authentication and profile information

**Key Fields**:
- `uid`: Firebase Authentication user ID
- `email`: User's email address
- `superAdmin`: Global admin privileges flag
- `adminOf`: Array of company IDs user can administer
- `deleted`: Soft-delete flag for GDPR compliance

**Relationships**:
- One-to-many with companies (via adminOf array)
- Referenced in audit trails across all collections

### 2. **Companies Collection** (`/companies/{companyId}`)

**Purpose**: Multi-tenant root collection for business entities

**Key Fields**:
- `adminUid`: Reference to the company administrator
- `personnummer`: Encrypted Swedish personal identity number
- `RUTEligible`: Eligibility for Swedish RUT tax deduction
- `consent`: GDPR consent tracking
- `subscription`: SaaS subscription details

**Security**: 
- Company-level isolation enforced by Firestore rules
- Only company admins and super admins can access

### 3. **Services Subcollection** (`/companies/{companyId}/services/{serviceId}`)

**Purpose**: Store service offerings for each company

**Key Fields**:
- `price`: Service pricing in SEK
- `duration`: Service duration in minutes
- `RUTEligible`: RUT deduction eligibility
- `companyId`: Denormalized for collection group queries

**Indexing**: Optimized for company-scoped queries with soft-delete filtering

### 4. **Customers Subcollection** (`/companies/{companyId}/customers/{customerId}`)

**Purpose**: CRM functionality with Swedish compliance

**Key Fields**:
- `personnummer`: Encrypted Swedish personal identity number
- `status`: Lead management (lead, active, inactive, prospect)
- `customerType`: Business classification (private, business)
- `totalSpent`: Calculated field for customer value
- `consent`: GDPR consent with timestamp

**Privacy**: Personnummer encrypted at rest, consent tracking mandatory

### 5. **Bookings Subcollection** (`/companies/{companyId}/bookings/{bookingId}`)

**Purpose**: Appointment and service booking management

**Key Fields**:
- `isRecurring`: Flag for recurring booking series
- `frequency`: Recurrence pattern (weekly, monthly)
- `occurrenceNumber`: Position in recurring series
- `RUTEligible`: Tax deduction eligibility
- `personnummer`: Customer identity for RUT reporting

**Enhanced Features**:
- Recurring booking support with smart date calculation
- RUT reporting compliance
- Full audit trail for tax purposes

### 6. **Coupons Subcollection** (`/companies/{companyId}/coupons/{couponId}`)

**Purpose**: Promotional discount management

**Key Fields**:
- `discountType`: Amount or percentage-based discounts
- `appliesTo`: Service scope (all or specific services)
- `usageLimit`: Maximum redemption count
- `usageCount`: Current usage tracking
- `expiresAt`: Expiration timestamp

**Business Logic**: Supports complex discount rules and usage tracking

### 7. **Company Stats Collection** (`/companyStats/{companyId}`)

**Purpose**: Precomputed analytics for performance

**Key Fields**:
- `byStatus`: Customer status distribution
- `byType`: Customer type breakdown
- `totalRevenue`: Aggregate revenue calculation
- `averageOrderValue`: Customer value metrics

**Performance**: Cloud Function computed for fast dashboard loading

## 📈 Database Indexes

### Composite Indexes (from `firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "companies",
      "fields": [
        { "fieldPath": "deleted", "order": "asc" },
        { "fieldPath": "createdAt", "order": "desc" }
      ]
    },
    {
      "collectionGroup": "services",
      "fields": [
        { "fieldPath": "companyId", "order": "asc" },
        { "fieldPath": "deleted", "order": "asc" },
        { "fieldPath": "createdAt", "order": "desc" }
      ]
    },
    {
      "collectionGroup": "customers",
      "fields": [
        { "fieldPath": "companyId", "order": "asc" },
        { "fieldPath": "deleted", "order": "asc" },
        { "fieldPath": "status", "order": "asc" },
        { "fieldPath": "createdAt", "order": "desc" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "fields": [
        { "fieldPath": "companyId", "order": "asc" },
        { "fieldPath": "deleted", "order": "asc" },
        { "fieldPath": "date", "order": "asc" }
      ]
    }
  ]
}
```

### Index Strategy:
- **Multi-tenant optimization**: All subcollection indexes start with `companyId`
- **Soft-delete support**: Every index includes `deleted` field filtering
- **Business queries**: Support for status, date, and type filtering
- **Performance**: Optimized for common dashboard and reporting queries

## 🔒 Security Architecture

### 1. **Firestore Security Rules**

```javascript
// Multi-tenant isolation
match /companies/{companyId}/customers/{customerId} {
  allow read: if (isCompanyAdmin(companyId) || isSuperAdmin()) && isNotDeleted();
  allow create: if (isCompanyAdmin(companyId) || isSuperAdmin()) &&
                   request.resource.data.get('consent', false) == true;
}

// Personnummer validation
function isValidPersonnummerFormat(personnummer) {
  return personnummer is string && personnummer.matches(/^[0-9]{8}-[0-9]{4}$/);
}
```

### 2. **Data Protection**
- **Encryption**: All data encrypted at rest and in transit
- **Soft-delete**: No hard deletes, maintaining audit trails
- **Access Control**: Role-based with custom claims
- **GDPR Compliance**: Consent tracking and data subject rights

### 3. **Audit Trail**
Every document includes:
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp
- `deleted`: Soft-delete flag
- `deletedAt`: Deletion timestamp
- `deletedBy`: User who performed deletion

## 🚀 Performance Optimizations

### 1. **Caching Strategy**

```javascript
// In-memory caching with expiry
const serviceCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

const setCacheWithExpiry = (cache, key, value, duration = CACHE_DURATION) => {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), duration);
};
```

### 2. **Offline Support**

```javascript
// IndexedDB persistence for offline functionality
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  }
});
```

### 3. **Batch Operations**

```javascript
// Efficient recurring booking creation
const batch = writeBatch(db);
for (let i = 0; i < occurrences; i++) {
  const docRef = doc(bookingsRef);
  batch.set(docRef, bookingData);
}
await batch.commit();
```

## 📊 Data Flow Architecture

### 1. **Read Operations**

```
Client Request → Cache Check → Firestore Query → Security Rules → Data Return → Cache Update
```

### 2. **Write Operations**

```
Client Request → Input Validation → Authentication Check → Security Rules → Firestore Write → Audit Log → Cache Invalidation
```

### 3. **Recurring Bookings Flow**

```
User Input → Validation → Date Calculation → Batch Creation → Audit Trail → Success Response
```

## 🔄 Data Lifecycle Management

### 1. **Soft-Delete Pattern**

```javascript
// Soft delete implementation
const softDelete = async (docRef, userId) => {
  await updateDoc(docRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: userId,
    updatedAt: serverTimestamp()
  });
};
```

### 2. **Cascade Delete**

```javascript
// Cloud Function for cascade operations
exports.cascadeSoftDeleteCompanyData = functions.firestore
  .document('companies/{companyId}')
  .onUpdate(async (change, context) => {
    // Automatically soft-delete subcollections
  });
```

### 3. **Data Retention**

```javascript
// Scheduled cleanup of expired soft-deletes
exports.cleanupExpiredSoftDeletes = functions.pubsub
  .schedule('0 2 * * 0') // Weekly cleanup
  .onRun(async (context) => {
    // Permanently delete documents soft-deleted for 30+ days
  });
```

## 🇸🇪 Swedish Market Compliance

### 1. **RUT Deduction Support**

**Data Requirements**:
- Personnummer validation and encryption
- RUTEligible flag on services and bookings
- Audit trail for tax reporting
- CSV export functionality

**Implementation**:
```javascript
// RUT booking validation
if (bookingData.personnummer && !validatePersonnummer(bookingData.personnummer)) {
  throw new Error('Invalid personnummer format (YYYYMMDD-XXXX)');
}
```

### 2. **GDPR Compliance**

**Data Requirements**:
- Explicit consent collection and tracking
- Right to be forgotten (soft-delete)
- Data minimization principles
- Audit trails for all processing

**Implementation**:
```javascript
// GDPR consent enforcement
if (!sanitizedData.consent) {
  throw new Error('Consent required to create customer (GDPR compliance)');
}
```

## 📈 Scalability Considerations

### 1. **Horizontal Scaling**
- Multi-tenant architecture supports unlimited companies
- Collection groups enable cross-tenant analytics
- Firestore auto-scales with usage

### 2. **Performance Scaling**
- Composite indexes for complex queries
- Caching layer reduces read costs
- Batch operations for bulk updates

### 3. **Cost Optimization**
- Soft-delete reduces write costs
- Caching reduces read operations
- Efficient indexing strategy

## 🔮 Future Enhancements

### 1. **Planned Improvements**
- Real-time analytics with Firestore listeners
- Advanced search with Algolia integration
- Data warehouse integration for BI
- Machine learning for customer insights

### 2. **Scalability Roadmap**
- Sharding strategy for very large tenants
- Read replicas for global distribution
- Advanced caching with Redis
- Event-driven architecture with Pub/Sub

## 📋 Database Maintenance

### 1. **Backup Strategy**
- Automated daily backups to Cloud Storage
- Point-in-time recovery capability
- Cross-region backup replication
- Disaster recovery procedures

### 2. **Monitoring**
- Query performance monitoring
- Index usage analytics
- Cost tracking and optimization
- Security audit logging

### 3. **Migration Strategy**
- Schema evolution with backward compatibility
- Data migration scripts for updates
- Version control for database changes
- Rollback procedures for failed migrations

---

**Document Maintained By**: SwedPrime Development Team  
**Next Review**: October 26, 2025  
**Version Control**: Git repository with change tracking
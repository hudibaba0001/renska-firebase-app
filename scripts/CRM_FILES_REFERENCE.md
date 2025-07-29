# SwedPrime CRM Files Reference Guide

## 📁 **Complete CRM File Structure**

### **🎯 Core CRM Components**

#### **Main CRM Files:**
```
webapp/src/crm/
├── DataConnectCRM.jsx          # Main CRM component (1645 lines) - NEEDS REFACTORING
├── CRMApp.jsx                  # CRM application wrapper (195 lines)
├── CRMWrapper.jsx              # CRM wrapper with auth (45 lines)
├── graphql.js                  # GraphQL queries/mutations (139 lines) - UNUSED
└── components/                 # CRM sub-components directory
```

#### **CRM Components Directory:**
```
webapp/src/crm/components/
├── CRMDashboard.jsx            # CRM dashboard (263 lines)
├── CustomerList.jsx            # Customer listing (155 lines)
├── CustomerCreate.jsx          # Customer creation form (230 lines)
├── CustomerEdit.jsx            # Customer editing form (283 lines)
├── CustomerShow.jsx            # Customer details view (165 lines)
├── LeadList.jsx                # Lead listing (161 lines)
├── LeadCreate.jsx              # Lead creation form (224 lines)
├── LeadEdit.jsx                # Lead editing form (228 lines)
├── LeadShow.jsx                # Lead details view (186 lines)
├── DealList.jsx                # Deal listing (164 lines)
├── DealCreate.jsx              # Deal creation form (192 lines)
├── DealEdit.jsx                # Deal editing form (225 lines)
├── DealShow.jsx                # Deal details view (157 lines)
├── TaskList.jsx                # Task listing (168 lines)
├── TaskCreate.jsx              # Task creation form (191 lines)
├── TaskEdit.jsx                # Task editing form (221 lines)
├── TaskShow.jsx                # Task details view (149 lines)
└── AddSampleData.jsx           # Sample data loader (239 lines)
```

---

## 🔍 **File Analysis & Status**

### **✅ Fully Functional Files**

#### **Core Components:**
- **`DataConnectCRM.jsx`** - Main CRM component with all functionality
  - **Status**: ✅ Working but needs refactoring (too large)
  - **Lines**: 1645 (should be < 500)
  - **Features**: Dashboard, forms, lists, routing

- **`CRMApp.jsx`** - CRM application wrapper
  - **Status**: ✅ Working
  - **Lines**: 195
  - **Features**: Custom routing, sidebar, navigation

- **`CRMWrapper.jsx`** - Authentication wrapper
  - **Status**: ✅ Working
  - **Lines**: 45
  - **Features**: Auth check, loading states

#### **Dashboard & Lists:**
- **`CRMDashboard.jsx`** - Main dashboard
  - **Status**: ✅ Working
  - **Lines**: 263
  - **Features**: Stats cards, recent activity, sample data

- **`CustomerList.jsx`** - Customer listing
  - **Status**: ✅ Working
  - **Lines**: 155
  - **Features**: Customer table, search, actions

- **`LeadList.jsx`** - Lead listing
  - **Status**: ✅ Working
  - **Lines**: 161
  - **Features**: Lead table, status filtering

- **`DealList.jsx`** - Deal listing
  - **Status**: ✅ Working
  - **Lines**: 164
  - **Features**: Deal table, value calculations

- **`TaskList.jsx`** - Task listing
  - **Status**: ✅ Working
  - **Lines**: 168
  - **Features**: Task table, priority sorting

#### **Create Forms:**
- **`CustomerCreate.jsx`** - Customer creation
  - **Status**: ✅ Working
  - **Lines**: 230
  - **Features**: All 13 SwedPrime fields, validation

- **`LeadCreate.jsx`** - Lead creation
  - **Status**: ✅ Working
  - **Lines**: 224
  - **Features**: Lead form, status selection

- **`DealCreate.jsx`** - Deal creation
  - **Status**: ✅ Working
  - **Lines**: 192
  - **Features**: Deal form, value calculation

- **`TaskCreate.jsx`** - Task creation
  - **Status**: ✅ Working
  - **Lines**: 191
  - **Features**: Task form, priority assignment

#### **Edit Forms:**
- **`CustomerEdit.jsx`** - Customer editing
  - **Status**: ✅ Working
  - **Lines**: 283
  - **Features**: Pre-populated form, validation

- **`LeadEdit.jsx`** - Lead editing
  - **Status**: ✅ Working
  - **Lines**: 228
  - **Features**: Lead editing, status updates

- **`DealEdit.jsx`** - Deal editing
  - **Status**: ✅ Working
  - **Lines**: 225
  - **Features**: Deal editing, value updates

- **`TaskEdit.jsx`** - Task editing
  - **Status**: ✅ Working
  - **Lines**: 221
  - **Features**: Task editing, status updates

#### **Show/Detail Views:**
- **`CustomerShow.jsx`** - Customer details
  - **Status**: ✅ Working
  - **Lines**: 165
  - **Features**: Customer information display

- **`LeadShow.jsx`** - Lead details
  - **Status**: ✅ Working
  - **Lines**: 186
  - **Features**: Lead information display

- **`DealShow.jsx`** - Deal details
  - **Status**: ✅ Working
  - **Lines**: 157
  - **Features**: Deal information display

- **`TaskShow.jsx`** - Task details
  - **Status**: ✅ Working
  - **Lines**: 149
  - **Features**: Task information display

#### **Utilities:**
- **`AddSampleData.jsx`** - Sample data loader
  - **Status**: ✅ Working
  - **Lines**: 239
  - **Features**: Demo data creation

---

### **⚠️ Files Needing Attention**

#### **Unused/Deprecated:**
- **`graphql.js`** - GraphQL queries/mutations
  - **Status**: ⚠️ UNUSED (switched to Firestore)
  - **Lines**: 139
  - **Action**: Remove or implement Data Connect

---

## 🚀 **Integration Points**

### **App.jsx Routes:**
```javascript
// CRM Routes in App.jsx
<Route path="crm" element={<CRMPage />} />
<Route path="admin/:companyId/crm-data/*" element={<DataConnectCRM />} />
```

### **Admin Dashboard Integration:**
```javascript
// AdminDashboardPage.jsx
{
  label: 'CRM',
  href: `/admin/${companyId}/crm-data`,
  icon: Users
}
```

### **Navigation Structure:**
```
/admin/:companyId/crm-data/
├── / (Dashboard)
├── /customers
├── /customers/create
├── /customers/:id/edit
├── /customers/:id
├── /leads
├── /leads/create
├── /leads/:id/edit
├── /leads/:id
├── /deals
├── /deals/create
├── /deals/:id/edit
├── /deals/:id
├── /tasks
├── /tasks/create
├── /tasks/:id/edit
└── /tasks/:id
```

---

## 📊 **Current Functionality Summary**

### **✅ Working Features:**
- **Dashboard**: Stats, recent activity, quick actions
- **Customer Management**: Full CRUD with all 13 SwedPrime fields
- **Lead Management**: Full CRUD with status tracking
- **Deal Management**: Full CRUD with value calculations
- **Task Management**: Full CRUD with priority/status
- **Multi-tenancy**: Company-based data isolation
- **Swedish Compliance**: RUT/ROT, GDPR, Personnummer
- **Real-time Data**: Firestore integration
- **Professional UI**: Tailwind CSS styling

### **⚠️ Missing Features:**
- **Pagination**: Large datasets not optimized
- **Advanced Filtering**: Limited search capabilities
- **Export Functionality**: No data export
- **Bulk Operations**: No bulk edit/delete
- **Reporting**: No advanced analytics
- **Error Boundaries**: Limited error handling
- **Form Validation**: Basic validation only
- **Shared Components**: Code duplication

---

## 🎯 **Priority Improvements**

### **High Priority (Week 1-2):**
1. **Refactor DataConnectCRM.jsx** - Split into smaller components
2. **Extract Shared Forms** - Create reusable form components
3. **Add Form Validation** - Implement comprehensive validation
4. **Create Service Layer** - Extract data operations

### **Medium Priority (Week 3-4):**
1. **Implement Pagination** - Handle large datasets
2. **Add Advanced Filtering** - Improve search capabilities
3. **Create Error Boundaries** - Better error handling
4. **Optimize Performance** - Reduce loading times

### **Low Priority (Week 5-6):**
1. **Add Export Functionality** - CSV/PDF export
2. **Implement Reporting** - Advanced analytics
3. **Add Bulk Operations** - Mass edit/delete
4. **Create Tests** - Unit and integration tests

---

## 📈 **File Size Analysis**

### **Largest Files (Need Refactoring):**
1. **DataConnectCRM.jsx** - 1645 lines ⚠️
2. **CustomerEdit.jsx** - 283 lines
3. **CRMDashboard.jsx** - 263 lines
4. **AddSampleData.jsx** - 239 lines
5. **CustomerCreate.jsx** - 230 lines

### **Optimal File Sizes:**
- **Components**: < 200 lines
- **Forms**: < 150 lines
- **Services**: < 100 lines
- **Utilities**: < 50 lines

---

*This reference guide provides a complete overview of your CRM file structure and identifies specific areas for improvement.*
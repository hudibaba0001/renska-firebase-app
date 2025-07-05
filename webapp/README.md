# SwedPrime - Form Builder SaaS Platform

A professional no-code platform for cleaning companies to create custom booking calculators and forms.

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Clone and install
git clone <repo-url>
cd swedprime/webapp
npm install
```

### 2. Environment Variables
Create a `.env` file in the webapp directory:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY="your_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com" 
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# Application Configuration
VITE_APP_NAME="SwedPrime"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV="development"
```

### 3. Development Server
```bash
npm run dev
```

## 📁 Key Routes

- `/` - Landing page with features and pricing
- `/booking/:companyId` - Customer booking forms
- `/admin/:companyId` - Admin dashboard and management
- `/admin/:companyId/forms/:formId` - Form builder interface

## 🛠 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore + Auth + Hosting)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom design system

## 🎯 Development Roadmap

### ✅ Stage 1: Local Setup & Core Routing (COMPLETE)
- ✅ Clean repository structure
- ✅ Environment configuration with fallbacks
- ✅ Tailwind CSS configured and working
- ✅ Comprehensive routing system
- ✅ Professional admin dashboard layout
- ✅ Form builder system (5-step wizard)

### 🎨 Stage 2: Firestore Schema & Security (NEXT)
- Multi-tenant data model
- Security rules implementation
- Company and booking collections

### 🧰 Stage 3: BookingPage & BookingForm MVP
- Client-facing booking widgets
- Dynamic pricing calculations
- Configuration-driven forms

### ⚙️ Stage 4: Admin Config CRUD
- Service management interface
- Pricing configuration tools
- Live preview system

### 💅 Stage 5: UI/UX Polish
- Component library integration
- Responsive design system
- Professional styling

### 💳 Stage 6: Stripe Billing Integration
- Subscription management
- Payment processing
- Access control

### 🚀 Stage 7: Deploy & CI/CD
- Firebase hosting setup
- Automated deployment pipeline
- Production environment

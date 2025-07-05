# 🚀 SwedPrime SaaS - Deployment Guide

Complete guide to deploy SwedPrime SaaS to production with automated CI/CD pipeline.

## 📋 Prerequisites

### 1. Required Tools
- **Node.js 22+** - [Download here](https://nodejs.org/)
- **Firebase CLI** - Install with `npm install -g firebase-tools`
- **Git** - For version control and GitHub Actions

### 2. Required Accounts
- **Firebase Account** - [console.firebase.google.com](https://console.firebase.google.com)
- **Stripe Account** - [dashboard.stripe.com](https://dashboard.stripe.com)
- **GitHub Account** - For repository hosting and CI/CD

## 🏗️ Initial Setup

### 1. Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   # Login to Firebase
   firebase login
   
   # Create new project (or use existing)
   firebase projects:create your-project-id
   ```

2. **Configure Firebase Services**
   ```bash
   # Initialize Firebase in your project
   firebase init
   
   # Select:
   # - Firestore (Database)
   # - Functions (Cloud Functions)
   # - Hosting (Web hosting)
   ```

3. **Update Project Configuration**
   - Update `.firebaserc` with your project ID
   - Update environment variables in GitHub secrets

### 2. Environment Variables

Create these environment variables in your production environment:

#### Firebase Configuration
```bash
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

#### Stripe Configuration
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### Application Configuration
```bash
VITE_APP_NAME=SwedPrime SaaS
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://your-project-id.web.app
VITE_ENVIRONMENT=production
```

### 3. GitHub Repository Setup

1. **Create Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/swedprime-saas.git
   git push -u origin main
   ```

2. **Create Development Branch**
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

## 🔐 Secrets Configuration

### GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Firebase Secrets
```
FIREBASE_DEPLOY_TOKEN=your-ci-token
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

#### Stripe Secrets
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Generate Firebase Deploy Token
```bash
firebase login:ci
# Copy the token and add it to GitHub secrets as FIREBASE_DEPLOY_TOKEN
```

## 🎯 Deployment Strategies

### 1. Manual Deployment

Use the deployment script for quick manual deployments:

```bash
# Interactive deployment
node scripts/deploy.js

# Direct deployment to staging
node scripts/deploy.js --staging

# Direct deployment to production (with confirmation)
node scripts/deploy.js --production

# Local preview
node scripts/deploy.js --local
```

### 2. Automated CI/CD Pipeline

The GitHub Actions workflow automatically:
- **On develop branch**: Deploys to staging
- **On main branch**: Deploys to production
- **On pull requests**: Runs tests and builds

#### Branch Strategy
```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

#### Workflow Triggers
- **Push to main** → Production deployment
- **Push to develop** → Staging deployment
- **Pull request** → Test and build only

## 🏥 Health Checks & Monitoring

### 1. Health Check Endpoint
```
GET /api/health
```

### 2. Monitoring URLs
- **Main App**: `https://your-project-id.web.app`
- **Admin Dashboard**: `https://your-project-id.web.app/admin/demo-company`
- **Pricing Page**: `https://your-project-id.web.app/pricing`
- **Booking Form**: `https://your-project-id.web.app/booking/demo-company`

### 3. Firebase Console Monitoring
- **Hosting**: Monitor deployment status
- **Functions**: Check function logs and performance
- **Firestore**: Monitor database usage and security rules
- **Authentication**: Track user sign-ups and authentication

### 4. Stripe Dashboard Monitoring
- **Webhooks**: Verify webhook delivery
- **Subscriptions**: Monitor subscription status
- **Payments**: Track payment success/failure rates

## 🔒 Security Checklist

### Pre-Deployment
- [ ] All environment variables are set correctly
- [ ] Firebase security rules are properly configured
- [ ] Stripe webhook signatures are verified
- [ ] Authentication is properly implemented
- [ ] HTTPS is enforced for all routes

### Post-Deployment
- [ ] Test all major user flows
- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Check Firebase Console for any errors
- [ ] Test payment processing with test cards
- [ ] Verify multi-tenancy isolation

## 📊 Performance Optimization

### 1. Build Optimization
```bash
# Production build with optimization
npm run build

# Analyze bundle size
npm run build:analyze
```

### 2. Firebase Hosting Optimization
- **CDN**: Automatic global CDN distribution
- **Compression**: Gzip compression enabled
- **Caching**: Static assets cached for 1 year
- **HTTP/2**: Automatic HTTP/2 support

### 3. Firestore Optimization
- **Indexes**: Proper composite indexes for queries
- **Security Rules**: Optimized for performance
- **Offline Support**: Automatic offline caching

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### 2. Deployment Failures
```bash
# Check Firebase CLI version
firebase --version

# Re-authenticate
firebase login

# Check project configuration
firebase use --current
```

#### 3. Function Errors
```bash
# Check function logs
firebase functions:log

# Deploy functions only
firebase deploy --only functions
```

#### 4. Environment Variable Issues
```bash
# Verify environment variables are loaded
npm run build -- --debug
```

### Support Resources
- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **GitHub Actions Documentation**: [docs.github.com/actions](https://docs.github.com/en/actions)

## 🎉 Post-Deployment Tasks

### 1. DNS Configuration (Optional)
If using a custom domain:
```bash
# Add custom domain in Firebase Console
firebase hosting:channel:deploy production --only hosting
```

### 2. SSL Certificate Verification
- Firebase automatically provides SSL certificates
- Verify HTTPS is working correctly
- Check for mixed content warnings

### 3. Performance Monitoring
- Set up Firebase Performance Monitoring
- Configure Google Analytics (if needed)
- Monitor Core Web Vitals

### 4. Backup Strategy
- **Firestore**: Configure automatic backups
- **Functions**: Code is backed up in Git
- **Hosting**: Static files are backed up in Git

## 📈 Scaling Considerations

### 1. Firebase Limits
- **Firestore**: 1M reads/writes per day (free tier)
- **Functions**: 2M invocations per month (free tier)
- **Hosting**: 10GB bandwidth per month (free tier)

### 2. Upgrade Path
- **Blaze Plan**: Pay-as-you-go pricing
- **Stripe Billing**: Automatic subscription management
- **Multi-region**: Deploy to multiple regions for better performance

### 3. Cost Optimization
- **Firestore**: Optimize queries to reduce reads
- **Functions**: Use appropriate memory allocation
- **Hosting**: Leverage CDN caching

---

## 🎯 Quick Start Checklist

- [ ] Fork/clone repository
- [ ] Create Firebase project
- [ ] Set up Stripe account
- [ ] Configure GitHub secrets
- [ ] Update `.firebaserc` with project ID
- [ ] Push to `develop` branch (triggers staging deployment)
- [ ] Test staging environment
- [ ] Push to `main` branch (triggers production deployment)
- [ ] Verify production deployment
- [ ] Set up monitoring and alerts

**🎉 Congratulations! Your SwedPrime SaaS is now live and automatically deploying with every code change!** 
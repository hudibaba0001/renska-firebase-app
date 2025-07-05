# 🚀 Firebase Deployment Guide - SwedPrime SaaS

## Secure Deployment Process

Now that all security vulnerabilities have been fixed, you can deploy safely to Firebase. This guide ensures a secure deployment process.

## 📋 Pre-Deployment Checklist

### ✅ Security Fixes Completed
- [x] Removed hardcoded API keys
- [x] Added authentication protection
- [x] Implemented input validation
- [x] Secured Firestore rules
- [x] Added security headers

### 🔧 Environment Setup Required

## Step 1: Configure Environment Variables

Since we removed hardcoded API keys for security, you need to set up environment variables:

### For Development:
```bash
cd webapp
cp env.example .env.local
# Edit .env.local with your actual Firebase and Stripe keys
```

### For Production Deployment:
```bash
cd webapp
cp env.example .env.production.local
# Edit .env.production.local with PRODUCTION Firebase project keys
```

**⚠️ Important**: Use different Firebase projects for development and production!

## Step 2: Deploy Updated Security Rules

Deploy the secured Firestore rules first:

```bash
# From project root
firebase deploy --only firestore:rules
```

This deploys the updated security rules that prevent unauthorized data access.

## Step 3: Build for Production

### Option A: Quick Build (if .env.local has production keys)
```bash
cd webapp
npm run build
```

### Option B: Production Build (recommended)
```bash
cd webapp
# Copy production environment
cp .env.production.local .env.local
npm run build
# Restore development environment
cp .env.example .env.local
```

## Step 4: Deploy to Firebase

### Deploy Everything:
```bash
# From project root (not webapp directory)
firebase deploy
```

### Deploy Specific Services:
```bash
# Deploy only hosting (frontend)
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Cloud Functions
firebase deploy --only functions
```

## Step 5: Verify Deployment

After deployment, verify these security features:

### 1. Test Authentication
- Visit your deployed site
- Try accessing `/admin/any-company` without login
- Should redirect to login page ✅

### 2. Test Environment Variables
- Open browser dev tools → Console
- Should NOT see any hardcoded API keys ✅
- Firebase should initialize properly ✅

### 3. Test Security Headers
```bash
curl -I https://your-project.web.app
# Should include:
# Content-Security-Policy: ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

## 🔧 Environment Configuration

### Firebase Console Setup
1. Go to **Firebase Console** → Your Project
2. **Project Settings** → **General** 
3. Add your domain to **Authorized Domains**
4. **Authentication** → **Sign-in method** → Enable providers

### Stripe Configuration
1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. Add webhook endpoint: `https://your-project.web.app/api/webhooks/stripe`
3. Update your `.env.production.local` with webhook secret

## 🛡️ Production Security Checklist

Before going live:

- [ ] **Different Firebase project** for production
- [ ] **Live Stripe keys** (not test keys) in production
- [ ] **HTTPS enforced** (Firebase does this automatically)
- [ ] **Environment variables** set correctly
- [ ] **Security rules** deployed and tested
- [ ] **Authentication** working properly
- [ ] **Error monitoring** configured
- [ ] **Backup strategy** in place

## 📱 Mobile & Testing

### Testing URLs to Verify:
- `https://your-project.web.app/` - Home page
- `https://your-project.web.app/login` - Login page  
- `https://your-project.web.app/admin/test-company` - Should require auth
- `https://your-project.web.app/super-admin` - Should require super admin
- `https://your-project.web.app/booking/test-company` - Public booking form

## 🚨 Troubleshooting

### Build Errors
If you get "Missing Firebase configuration" during build:

1. Ensure `.env.local` exists in webapp directory
2. Check all `VITE_FIREBASE_*` variables are set
3. Restart the build process

### Deployment Errors
```bash
# Check Firebase CLI version
firebase --version

# Login again if needed
firebase login

# Check project configuration
firebase projects:list
firebase use swed-de2a3
```

### Runtime Errors
If the site loads but doesn't work:

1. Check browser console for errors
2. Verify Firebase config in deployed version
3. Check Firestore rules are deployed
4. Test authentication flow

## 🔄 CI/CD Setup (Optional)

For automated deployments, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd webapp
          npm ci
      
      - name: Build
        run: |
          cd webapp
          npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          # Add all other environment variables
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: swed-de2a3
```

## 📞 Support

If you encounter issues:

1. **Security Issues**: Review `SECURITY_FIXES_COMPLETED.md`
2. **Environment Issues**: Check `ENVIRONMENT_SETUP.md`  
3. **Firebase Issues**: Check Firebase Console logs
4. **General Issues**: Review error messages in browser console

---

## 🎉 Deployment Complete!

Once deployed successfully:

1. **Share your live URL**: `https://swed-de2a3.web.app`
2. **Test all functionality** thoroughly
3. **Monitor logs** for any issues
4. **Set up alerts** for production monitoring

Your SwedPrime SaaS platform is now securely deployed! 🛡️ 
# 🔧 Environment Setup Guide

## Secure Configuration for SwedPrime SaaS

### 1. Create Environment File

Copy the example environment file and configure it with your actual values:

```bash
# In the webapp directory
cd webapp
cp env.example .env.local
```

### 2. Configure Firebase (Required)

Get these values from **Firebase Console > Project Settings > General**:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
VITE_FIREBASE_MEASUREMENT_ID=G-ABCD123456
```

### 3. Configure Stripe (Required)

Get these from **Stripe Dashboard > Developers > API keys**:

```bash
# Use TEST keys for development (pk_test_...)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

⚠️ **Never use live/production Stripe keys in development!**

### 4. Security Configuration

The application now includes enhanced security features:

- ✅ **Input validation and sanitization**
- ✅ **Rate limiting protection**  
- ✅ **XSS prevention**
- ✅ **Content Security Policy headers**
- ✅ **Secure authentication flow**

### 5. Development vs Production

#### Development (.env.local)
```bash
NODE_ENV=development
VITE_ENABLE_DEBUG_LOGS=true
# Use test Firebase project
# Use test Stripe keys
```

#### Production (Environment Variables)
```bash
NODE_ENV=production
VITE_ENABLE_DEBUG_LOGS=false
# Use production Firebase project
# Use live Stripe keys
# Set up monitoring and alerting
```

### 6. Security Checklist

Before going live, ensure you have:

- [ ] **Moved all API keys to environment variables**
- [ ] **Updated Firestore security rules**
- [ ] **Added .env.local to .gitignore** ✅
- [ ] **Removed hardcoded fallback values** ✅
- [ ] **Set up proper authentication** ✅
- [ ] **Implemented input validation** ✅
- [ ] **Added security headers** ✅
- [ ] **Disabled dangerous features** ✅
- [ ] **Set up monitoring and logging**
- [ ] **Configured backup and recovery**

### 7. Common Issues

#### Missing Environment Variables
If you see errors about missing Firebase configuration:
1. Ensure `.env.local` exists in the `webapp` directory
2. Check all required variables are set
3. Restart the development server

#### Firebase Permission Errors
If you get permission denied errors:
1. Check your Firestore security rules
2. Ensure you're authenticated 
3. Verify your user has the correct claims

#### Stripe Integration Issues
If payments don't work:
1. Verify you're using the correct publishable key
2. Check the key matches your Firebase project
3. Ensure you're not mixing test/live environments

### 8. Getting Help

- **Security Issues**: See `SECURITY_FIXES_REQUIRED.md`
- **Service Account Keys**: See `scripts/SECURITY_WARNING.md`
- **General Setup**: Check the project README

### 9. Production Deployment

When deploying to production:

1. **Use a separate Firebase project**
2. **Set environment variables in your hosting platform**
3. **Enable monitoring and alerting** 
4. **Set up automated backups**
5. **Configure proper domain and SSL**
6. **Review and test all security features**

---

🛡️ **Security First**: Never commit sensitive keys or credentials to version control. Always use environment variables and follow the principle of least privilege. 
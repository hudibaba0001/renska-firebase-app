#!/bin/bash

# SwedPrime SaaS - Environment Setup Script
# This script helps you set up a secure development environment

echo "🔧 SwedPrime SaaS - Secure Environment Setup"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "webapp" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   (the directory containing package.json and webapp folder)"
    exit 1
fi

echo "📁 Setting up environment configuration..."

# Create .env.local from example
if [ ! -f "webapp/.env.local" ]; then
    if [ -f "webapp/env.example" ]; then
        cp webapp/env.example webapp/.env.local
        echo "✅ Created webapp/.env.local from example"
        echo "⚠️  Please edit webapp/.env.local with your actual Firebase and Stripe configuration"
    else
        echo "❌ Error: webapp/env.example not found"
        exit 1
    fi
else
    echo "ℹ️  webapp/.env.local already exists, skipping creation"
fi

echo ""
echo "🔒 Checking security configuration..."

# Check if .gitignore includes .env.local
if grep -q "\.env\.local" .gitignore; then
    echo "✅ .env.local is properly ignored by git"
else
    echo "⚠️  Adding .env.local to .gitignore for security"
    echo "" >> .gitignore
    echo "# Environment files (added by setup script)" >> .gitignore
    echo ".env.local" >> .gitignore
    echo "webapp/.env.local" >> .gitignore
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 📝 Edit your environment file:"
echo "   code webapp/.env.local"
echo ""
echo "2. 🔥 Add your Firebase configuration:"
echo "   - Get values from Firebase Console > Project Settings"
echo "   - Update all VITE_FIREBASE_* variables"
echo ""
echo "3. 💳 Add your Stripe configuration:"
echo "   - Get TEST key from Stripe Dashboard > Developers > API keys"
echo "   - Update VITE_STRIPE_PUBLISHABLE_KEY (use pk_test_... for development)"
echo ""
echo "4. 🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "5. 🛡️  Deploy updated Firestore rules:"
echo "   firebase deploy --only firestore:rules"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - ENVIRONMENT_SETUP.md"
echo "   - SECURITY_FIXES_REQUIRED.md"
echo ""
echo "🛡️  Security Note: Never commit .env.local to version control!"
echo "   Your secrets are now protected by .gitignore"
echo ""
echo "✅ Environment setup complete!" 
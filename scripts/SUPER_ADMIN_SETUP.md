# Super Admin Setup Guide

This guide will help you create your first super admin user for the SwedPrime platform.

## Quick Setup (Easiest Method)

### Step 1: Create a Regular User
First, create a regular user account:

1. Go to your app: https://reniska-calculator.web.app/signup
2. Sign up with your desired super admin email and password
3. Remember these credentials!

### Step 2: Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon) > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in the `scripts` folder

### Step 3: Update the Script Path

Edit `scripts/setup-super-admin.js` line 18:
```javascript
// Change this line:
const serviceAccount = require('./path/to/your/serviceAccountKey.json');

// To this:
const serviceAccount = require('./serviceAccountKey.json');
```

### Step 4: Run the Setup Script

Open a terminal in your project root and run:

```bash
# If you already created a user in Step 1:
node scripts/setup-super-admin.js set-claim your-email@example.com

# Or create a new super admin user directly:
node scripts/setup-super-admin.js create-user admin@swedprime.com YourSecurePassword123 "Super Admin"
```

### Step 5: Sign Out and Sign In

**Important:** After running the script:
1. Sign out from your current session
2. Sign in again with the super admin credentials
3. Navigate to `/super-admin` to access the super admin dashboard

## Alternative: Manual Setup via Firebase Console

If you prefer not to use the script:

1. **Create a user** in Firebase Console > Authentication > Users
2. **Copy the User UID**
3. **Set custom claims** using Firebase Admin SDK or Cloud Functions:

```javascript
// In a Cloud Function or server-side script:
await admin.auth().setCustomUserClaims(userUID, {
  superAdmin: true
});
```

## Example Credentials for Testing

For testing purposes, you might want to create:
- **Email:** admin@swedprime.com
- **Password:** SwedPrime2024Admin!
- **Display Name:** SwedPrime Administrator

## Verifying Super Admin Access

1. Login with your super admin credentials at `/login`
2. Navigate to `/super-admin`
3. You should see the Super Admin Dashboard
4. If you see "Access Denied", make sure you:
   - Signed out and signed in again after setting the claim
   - Correctly set the `superAdmin: true` claim
   - Check browser console for any errors

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit** your `serviceAccountKey.json` file to version control
2. **Use strong passwords** for super admin accounts
3. **Limit super admin access** to only trusted administrators
4. **Enable 2FA** on super admin accounts in production
5. **Monitor super admin activity** through audit logs

## Troubleshooting

### "Access Denied" Error
- Make sure you signed out and signed in again
- Check if the custom claim was set correctly
- Verify the user exists in Firebase Authentication

### Script Errors
- Ensure `firebase-admin` is installed: `npm install firebase-admin`
- Check that your service account key path is correct
- Verify your Firebase project is correctly configured

### Can't Find Service Account Key
1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Make sure you have the right permissions (Project Owner/Editor)

## Next Steps

Once you have super admin access, you can:
1. **Manage Tenants** - Create and manage company accounts
2. **Configure Plans** - Set up billing plans and pricing
3. **View Audit Logs** - Monitor platform activity
4. **Manage Users** - Grant/revoke admin privileges
5. **Global Settings** - Configure platform-wide settings

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Firebase Authentication logs
3. Ensure Firestore security rules are deployed
4. Contact the development team 
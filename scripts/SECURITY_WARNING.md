# 🚨 SECURITY WARNING - Service Account Keys

## ⚠️ CRITICAL: Never Commit Service Account Keys

The scripts in this directory reference service account keys for Firebase Admin SDK access. 

### Security Requirements:

1. **Service account keys must NEVER be committed to version control**
2. **Download keys directly from Firebase Console when needed**  
3. **Delete keys immediately after use**
4. **Use environment variables in production**

### Safe Usage:

```bash
# 1. Download service account key from Firebase Console:
#    Project Settings > Service Accounts > Generate New Private Key

# 2. Save as serviceAccountKey.json in this directory (temporary)

# 3. Run the script you need:
node setup-super-admin.js create-user admin@example.com password123

# 4. IMMEDIATELY delete the key file:
rm serviceAccountKey.json
```

### Production Security:

For production environments, use one of these secure methods instead:

1. **Google Cloud IAM** (recommended)
2. **Firebase Admin SDK with Application Default Credentials**
3. **Environment variables with secure key management**

### If Keys Are Exposed:

If service account keys are accidentally committed or exposed:

1. **Immediately revoke the key** in Firebase Console
2. **Generate a new key** if needed
3. **Review access logs** for unauthorized usage
4. **Update any systems** using the old key

---

**Remember**: Service account keys provide full admin access to your Firebase project. Treat them like passwords and follow the principle of least privilege. 
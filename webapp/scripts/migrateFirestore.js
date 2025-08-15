// webapp/scripts/migrateFirestore.js
// This script is for one-time use in development/staging environments
// to backfill missing fields like 'createdAt' and 'deleted: false'
// for existing documents across collections and subcollections.
//
// To run:
// 1. Ensure you have 'firebase-admin' installed in your project (e.g., npm install firebase-admin --save-dev).
//    Note: This is a dev dependency for the webapp, but functions will use it as a prod dependency.
// 2. Set up Firebase Admin SDK credentials:
//    - Download your serviceAccountKey.json from Firebase Project settings -> Service accounts.
//    - Place it in the root of your project or configure its path.
//    - For security, consider loading the path from an environment variable:
//      `process.env.SERVICE_ACCOUNT_KEY_PATH`
//      Then run the script with `SERVICE_ACCOUNT_KEY_PATH='./serviceAccountKey.json' node webapp/scripts/migrateFirestore.js`
// 3. Ensure your 'firebase-admin' package is installed in your webapp/ directory: npm install firebase-admin
// 4. Run the script: `node webapp/scripts/migrateFirestore.js [--dry-run]` (or with env variable as above)
//
// BE CAREFUL: Run this only once per environment and BACK UP YOUR DATA before running!
// This script uses the Admin SDK and bypasses security rules, so it has full access.

const admin = require('firebase-admin');
const readline = require('readline'); // For confirmation prompt
const { exec } = require('child_process'); // For backup command

// Adjust path as needed, or use environment variable for production
const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json'; // Default to root

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (e) {
  console.error(`Error: serviceAccountKey.json not found at ${serviceAccountPath}. Please create it or set SERVICE_ACCOUNT_KEY_PATH environment variable.`);
  process.exit(1);
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Personnummer validation (Swedish personal identity number format: YYYYMMDD-XXXX, used for RUT deduction)
const validatePersonnummer = (personnummer) => /^[0-9]{8}-[0-9]{4}$/.test(personnummer);

const collectionsToMigrate = [
  { name: 'companies', isCollectionGroup: false, needsCompanyId: false, needsPersonnummerValidation: true },
  { name: 'services', isCollectionGroup: true, needsCompanyId: true, needsPersonnummerValidation: false },
  { name: 'customers', isCollectionGroup: true, needsCompanyId: true, needsPersonnummerValidation: true },
  { name: 'bookings', isCollectionGroup: true, needsCompanyId: true, needsPersonnummerValidation: true },
  { name: 'users', isCollectionGroup: false, needsCompanyId: false, needsPersonnummerValidation: false } // Assuming users are top-level and don't need companyId
];

const BATCH_SIZE = 400; // Keep below Firestore's 500 limit for safety

// Check for dry-run argument
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runBackup() {
  const backupFileName = `firestore-backup-${new Date().toISOString().slice(0,10)}.json`;
  console.log(`\n--- Initiating Firestore Backup ---`);
  console.log(`Exporting current Firestore data to: ${backupFileName}`);

  try {
    // You might need to configure your firebase project ID if not set via env vars or firebase use
    const projectId = process.env.FIREBASE_PROJECT_ID || admin.instanceId().app.options.projectId;
    const backupCommand = `firebase firestore:export --project ${projectId} --output-uri gs://${projectId}/${backupFileName}`;
    
    console.log(`Running command: ${backupCommand}`);
    
    await new Promise((resolve, reject) => {
      exec(backupCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup failed: ${stderr}`);
          reject(error);
        } else {
          console.log(`Backup stdout: ${stdout}`);
          console.log(`Backup stderr: ${stderr}`);
          console.log(`Backup successful! Data exported to Google Cloud Storage bucket gs://${projectId}/${backupFileName}`);
          resolve();
        }
      });
    });

    console.log(`--- Firestore Backup Completed ---`);
    return true;
  } catch (e) {
    console.error(`Failed to execute backup command. Please ensure Firebase CLI is installed and authenticated.`, e);
    console.warn(`Migration will proceed WITHOUT a successful backup. Proceed with EXTREME CAUTION.`);
    return false;
  }
}

async function processCollectionGroup(collectionName, needsCompanyId, needsPersonnummerValidation) {
  console.log(`\nStarting migration for collection group: ${collectionName}`);
  
  let queryRef = db.collectionGroup(collectionName);
  let lastDocSnapshot = null;
  let totalUpdated = 0;
  let totalSkipped = 0;

  while (true) {
    let currentQuery = queryRef.orderBy(admin.firestore.FieldPath.documentId()).limit(BATCH_SIZE);
    
    if (lastDocSnapshot) {
      currentQuery = currentQuery.startAfter(lastDocSnapshot);
    }

    const snapshot = await currentQuery.get();
    
    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();
    let batchOperations = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      let needsUpdate = false;
      const updatePayload = {};
      let skippedReason = [];

      if (!data.createdAt) {
        updatePayload.createdAt = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
      } else {
        skippedReason.push('createdAt exists');
      }

      // Check for undefined or null, but not false, to not overwrite existing 'deleted: true'
      if (data.deleted === undefined || data.deleted === null) {
        updatePayload.deleted = false;
        needsUpdate = true;
      } else if (data.deleted === true) {
        skippedReason.push('deleted is true');
      } else {
        skippedReason.push('deleted is false');
      }

      if (needsCompanyId && !data.companyId) {
        const companyDocRef = doc.ref.parent.parent;
        if (companyDocRef) {
          updatePayload.companyId = companyDocRef.id;
          needsUpdate = true;
        } else {
          skippedReason.push('Missing companyId and parent not found');
        }
      } else if (needsCompanyId) {
        skippedReason.push('companyId exists');
      }

      if (needsPersonnummerValidation && data.personnummer !== undefined) {
        if (data.personnummer && !validatePersonnummer(data.personnummer)) {
          console.warn(`[WARNING] Invalid personnummer format for ${doc.ref.path}: ${data.personnummer}. Setting to null.`);
          updatePayload.personnummer = null; // Nullify invalid personnummer
          needsUpdate = true; // Mark for update to nullify
        } else if (data.personnummer) {
          // If it's valid and present, ensure it's not unintentionally removed by undefined clean-up
          updatePayload.personnummer = data.personnummer; // If already valid and no other updates, needsUpdate might remain false, which is fine.
        }
      }

      if (needsUpdate) {
        if (!isDryRun) {
          batch.update(doc.ref, updatePayload);
          batchOperations++;
        } else {
          console.log(`[DRY-RUN] Would update ${doc.ref.path} with:`, updatePayload);
        }
      } else {
        totalSkipped++;
        // console.log(`Skipped ${doc.ref.path}: ${skippedReason.join(', ')}`); // Uncomment for verbose skipped logging
      }
    });

    if (batchOperations > 0) {
      if (!isDryRun) {
        await batch.commit();
        totalUpdated += batchOperations;
        console.log(`Migrated ${batchOperations} documents in this batch for ${collectionName}. Total updated: ${totalUpdated}`);
      } else {
        console.log(`[DRY-RUN] Would commit ${batchOperations} updates for ${collectionName} in this batch.`);
      }
    } else {
      // console.log(`No updates needed in this batch for ${collectionName}.`); // Uncomment for verbose batch logging
    }

    lastDocSnapshot = snapshot.docs[snapshot.docs.length - 1];
    
    if (snapshot.size < BATCH_SIZE) {
      break; // All documents processed
    }
  }

  console.log(`Migration for collection group ${collectionName} completed. Total documents updated: ${totalUpdated}, Total skipped: ${totalSkipped}`);
}

async function processTopLevelCollection(collectionName, needsPersonnummerValidation) {
  console.log(`\nStarting migration for top-level collection: ${collectionName}`);
  
  let queryRef = db.collection(collectionName);
  let lastDocSnapshot = null;
  let totalUpdated = 0;
  let totalSkipped = 0;

  while (true) {
    let currentQuery = queryRef.orderBy(admin.firestore.FieldPath.documentId()).limit(BATCH_SIZE);
    
    if (lastDocSnapshot) {
      currentQuery = currentQuery.startAfter(lastDocSnapshot);
    }

    const snapshot = await currentQuery.get();
    
    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();
    let batchOperations = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      let needsUpdate = false;
      const updatePayload = {};
      let skippedReason = [];

      if (!data.createdAt) {
        updatePayload.createdAt = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
      } else {
        skippedReason.push('createdAt exists');
      }

      if (data.deleted === undefined || data.deleted === null) {
        updatePayload.deleted = false;
        needsUpdate = true;
      } else if (data.deleted === true) {
        skippedReason.push('deleted is true');
      } else {
        skippedReason.push('deleted is false');
      }

      if (needsPersonnummerValidation && data.personnummer !== undefined) {
        if (data.personnummer && !validatePersonnummer(data.personnummer)) {
          console.warn(`[WARNING] Invalid personnummer format for ${doc.ref.path}: ${data.personnummer}. Setting to null.`);
          updatePayload.personnummer = null; // Nullify invalid personnummer
          needsUpdate = true; // Mark for update to nullify
        } else if (data.personnummer) {
          updatePayload.personnummer = data.personnummer;
          // If already valid and no other updates, needsUpdate might remain false, which is fine.
        }
      }

      if (needsUpdate) {
        if (!isDryRun) {
          batch.update(doc.ref, updatePayload);
          batchOperations++;
        } else {
          console.log(`[DRY-RUN] Would update ${doc.ref.path} with:`, updatePayload);
        }
      } else {
        totalSkipped++;
        // console.log(`Skipped ${doc.ref.path}: ${skippedReason.join(', ')}`); // Uncomment for verbose skipped logging
      }
    });

    if (batchOperations > 0) {
      if (!isDryRun) {
        await batch.commit();
        totalUpdated += batchOperations;
        console.log(`Migrated ${batchOperations} documents in this batch for ${collectionName}. Total updated: ${totalUpdated}`);
      } else {
        console.log(`[DRY-RUN] Would commit ${batchOperations} updates for ${collectionName} in this batch.`);
      }
    } else {
      // console.log(`No updates needed in this batch for ${collectionName}.`); // Uncomment for verbose batch logging
    }

    lastDocSnapshot = snapshot.docs[snapshot.docs.length - 1];
    
    if (snapshot.size < BATCH_SIZE) {
      break; // All documents processed
    }
  }

  console.log(`Migration for top-level collection ${collectionName} completed. Total documents updated: ${totalUpdated}, Total skipped: ${totalSkipped}`);
}

async function runMigration() {
  console.log(`\n--- Starting Firestore data migration with Admin SDK ---`);
  
  if (isDryRun) {
    console.log(`*** DRY RUN MODE: No actual database changes will be made. ***`);
  }

  const backupAnswer = await askQuestion(`It is highly recommended to back up your Firestore data before proceeding. Do you want to run a backup now? (yes/no): `);
  
  if (backupAnswer.toLowerCase() === 'yes') {
    const backupSuccess = await runBackup();
    if (!backupSuccess) {
      const proceedWithoutBackup = await askQuestion(`Backup failed. Do you want to proceed with migration without a successful backup? (yes/no): `);
      if (proceedWithoutBackup.toLowerCase() !== 'yes') {
        console.log('Migration aborted by user due to failed backup.');
        rl.close();
        process.exit(0);
      }
    }
  } else {
    console.log('Skipping backup as requested. Proceed with caution.');
  }

  const confirmAnswer = await askQuestion(`This script will modify your Firestore data. Do you want to proceed? (yes/no): `);
  
  if (confirmAnswer.toLowerCase() !== 'yes') {
    console.log('Migration aborted by user.');
    rl.close();
    process.exit(0);
  }

  for (const collectionInfo of collectionsToMigrate) {
    if (collectionInfo.isCollectionGroup) {
      await processCollectionGroup(collectionInfo.name, collectionInfo.needsCompanyId, collectionInfo.needsPersonnummerValidation);
    } else {
      await processTopLevelCollection(collectionInfo.name, collectionInfo.needsPersonnummerValidation);
    }
  }

  console.log('All migrations finished.');
  rl.close();
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  rl.close();
  process.exit(1); // Exit with an error code
});
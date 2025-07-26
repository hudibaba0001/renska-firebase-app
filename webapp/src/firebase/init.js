// webapp/src/firebase/init.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

console.log('🔧 Using Firebase v9 modular API');

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  // databaseURL intentionally omitted for security
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with cache configuration for offline persistence
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Realtime Database
const database = getDatabase(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectDatabaseEmulator(database, 'localhost', 9000);
}

export default app;
export { db, auth, database };

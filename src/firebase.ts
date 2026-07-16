import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom settings to use long polling, which is robust in sandboxed/iframe/reverse proxy environments.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, config.firestoreDatabaseId || '(default)');

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

export let isFirestoreOffline = false;

export function setFirestoreOffline(val: boolean) {
  isFirestoreOffline = val;
  if (val) {
    // Also set demo mode in local storage to keep session state in sync
    localStorage.setItem('nexus_demo_mode', 'true');
  }
}

async function testConnection() {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timeout')), 2500)
  );

  try {
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn("Firestore connection check failed or timed out:", errMsg, "- Activating local storage offline fallback mode.");
    setFirestoreOffline(true);
  }
}
testConnection();


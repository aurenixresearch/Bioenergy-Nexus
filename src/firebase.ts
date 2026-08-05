import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  initializeAuth, 
  indexedDBLocalPersistence,
  browserLocalPersistence, 
  inMemoryPersistence,
  browserPopupRedirectResolver, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  memoryLocalCache,
  getFirestore,
  doc, 
  getDocFromServer,
  setLogLevel,
  disableNetwork
} from 'firebase/firestore';
import config from '../firebase-applet-config.json';

// Suppress internal Firestore connection warnings from clogging the console
try {
  setLogLevel('error');
} catch {
  // Ignore if already set or unsupported
}

import { getStorage } from 'firebase/storage';

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

// Initialize Firestore with memory local cache and long polling to avoid IndexedDB persistent batch assertion crashes
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true,
  }, config.firestoreDatabaseId || '(default)');
} catch (err) {
  console.warn("Failed initializing Firestore with memoryLocalCache, falling back:", err);
  dbInstance = getFirestore(app, config.firestoreDatabaseId || '(default)');
}

export const db = dbInstance;

let storageInstance;
try {
  storageInstance = getStorage(app);
} catch (e) {
  console.warn("Storage initialization fallback:", e);
}
export const storage = storageInstance;

// Initialize Auth safely without global popupRedirectResolver to prevent "Pending promise was never set" assertions in sandboxed/iframe environments
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence],
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export { browserPopupRedirectResolver };
export const googleProvider = new GoogleAuthProvider();

// Standard scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

export let isFirestoreOffline = false;

export function setFirestoreOffline(val: boolean) {
  isFirestoreOffline = val;
  if (val && db) {
    disableNetwork(db).catch(err => {
      console.warn("Could not disable Firestore network:", err);
    });
  }
}

async function testConnection() {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('connection-timeout'));
    }, 1500);
  });

  try {
    await Promise.race([
      getDocFromServer(doc(db, 'users', 'connection_test_doc')),
      timeoutPromise
    ]);
    console.log("Firestore connection check succeeded. Operating in online mode.");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    
    // If the error is permission-denied or document-not-found, we actually reached the Firestore backend!
    // It means the connection is active and healthy. Only activate offline mode for actual connectivity issues.
    const isPermissionOrExistsError = 
      errMsg.includes('permission-denied') || 
      errMsg.includes('Permission denied') ||
      errMsg.includes('not-found') ||
      errMsg.includes('not found') ||
      errMsg.includes('permission');

    if (isPermissionOrExistsError) {
      console.log("Firestore reached successfully (confirmed via secure response). Operating in online mode.");
      return;
    }

    if (
      errMsg.includes('offline') || 
      errMsg.includes('failed to connect') || 
      errMsg.includes('network') ||
      errMsg.includes('unavailable') ||
      errMsg.includes('Could not reach') ||
      errMsg.includes('Connection failed') ||
      errMsg.includes('connection-timeout')
    ) {
      console.warn("Firestore backend unavailable or offline. Operating in local sandbox/offline mode.");
      setFirestoreOffline(true);
    }
  }
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => { testConnection(); });
  } else {
    setTimeout(testConnection, 2500);
  }
}


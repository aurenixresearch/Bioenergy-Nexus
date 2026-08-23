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
  setLogLevel('silent');
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

// Initialize Firestore with memory local cache and long polling
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
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
}


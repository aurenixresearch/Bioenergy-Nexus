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
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
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

// Initialize Firestore with custom settings to use long polling, which is robust in sandboxed/iframe/reverse proxy environments,
// and enable multi-tab persistent cache so the app functions instantly offline/online.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
}, config.firestoreDatabaseId || '(default)');

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
  if (val) {
    // Also set demo mode in local storage to keep session state in sync
    localStorage.setItem('nexus_demo_mode', 'true');
  }
}

async function testConnection() {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timeout')), 4000)
  );

  try {
    await Promise.race([
      getDocFromServer(doc(db, 'users', 'connection_test_doc')),
      timeoutPromise
    ]);
    console.log("Firestore connection check succeeded. Operating in online mode.");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    
    // If the error is permission-denied or document-not-found, we actually reached the Firestore backend!
    // It means the connection is active and healthy. Only activate offline mode for actual connectivity issues or timeouts.
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

    console.warn("Firestore connection check failed or timed out:", errMsg, "- Activating local storage offline fallback mode.");
    setFirestoreOffline(true);
  }
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => { testConnection(); });
  } else {
    setTimeout(testConnection, 2500);
  }
}


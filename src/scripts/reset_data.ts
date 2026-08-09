import { db, storage, auth } from '../firebase';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const COLLECTIONS_TO_CLEAR = [
  'saved_papers',
  'consultation_inquiries',
  'partnership_submissions',
  'custom_papers',
  'researchers',
  'publications',
  'projects',
  'alliance_opportunities',
  'applications',
  'workspaces',
  'innovation_challenges',
  'notifications',
  'innovation_projects',
  'user_deadlines',
  'user_notifications',
  'organizations',
  'funding_opportunities',
  'reports',
  'audit_logs',
  'admin_roles',
  'blocks',
  'policy_acceptances',
  'policy_documents',
  'messages',
  'community_posts',
  'testimonials'
];

const ADMIN_EMAILS = [
  'bola.adeyemi@aurenix-research.org',
  'adeyemibola2569@gmail.com',
  'egburedipraise@gmail.com'
];

async function clearSubcollections(parentColPath: string) {
  let subCount = 0;
  try {
    const parentSnap = await getDocs(collection(db, parentColPath));
    for (const parentDoc of parentSnap.docs) {
      if (parentColPath === 'conversations') {
        const msgSnap = await getDocs(collection(db, `conversations/${parentDoc.id}/messages`));
        for (const msgDoc of msgSnap.docs) {
          await deleteDoc(msgDoc.ref);
          subCount++;
        }
      }
      await deleteDoc(parentDoc.ref);
      subCount++;
    }
  } catch (err) {
    console.warn(`[Subcollection/Doc Clear] Notice clearing ${parentColPath}:`, err);
  }
  return subCount;
}

async function clearStorageFolder(folderRef: ReturnType<typeof ref>): Promise<number> {
  let count = 0;
  try {
    const res = await listAll(folderRef);
    for (const item of res.items) {
      await deleteObject(item);
      count++;
    }
    for (const prefix of res.prefixes) {
      count += await clearStorageFolder(prefix);
    }
  } catch (err) {
    // Storage folder empty or not created
  }
  return count;
}

async function authenticateResetSession() {
  try {
    await signInAnonymously(auth);
    console.log("Authenticated reset session anonymously.");
    return;
  } catch (err) {
    // Anonymous auth disabled, attempt admin auth fallback
  }

  const resetEmail = 'bola.adeyemi@aurenix-research.org';
  const resetPass = 'AurenixReset2026!';

  try {
    await signInWithEmailAndPassword(auth, resetEmail, resetPass);
    console.log(`Authenticated reset session as admin (${resetEmail}).`);
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, resetEmail, resetPass);
        console.log(`Created & authenticated admin reset account (${resetEmail}).`);
      } catch (createErr) {
        console.warn("Notice: Auth sign-in fallback skip:", createErr);
      }
    } else {
      console.warn("Notice: Auth sign-in skip:", err);
    }
  }
}

export async function runCompleteDataReset() {
  console.log("=== AURENIX COMPLETE APPLICATION DATA RESET ===");
  await authenticateResetSession();

  const results: { collection: string; deletedCount: number }[] = [];
  let totalDocsDeleted = 0;

  // 1. Clear standard collections
  for (const colName of COLLECTIONS_TO_CLEAR) {
    let deletedCount = 0;
    try {
      const snap = await getDocs(collection(db, colName));
      for (const docSnap of snap.docs) {
        await deleteDoc(docSnap.ref);
        deletedCount++;
      }
    } catch (err) {
      console.warn(`Notice clearing collection ${colName}:`, err);
    }
    results.push({ collection: colName, deletedCount });
    totalDocsDeleted += deletedCount;
    console.log(`Cleared collection '${colName}': ${deletedCount} documents deleted.`);
  }

  // 2. Clear conversations and subcollections
  const convDeleted = await clearSubcollections('conversations');
  results.push({ collection: 'conversations (including messages subcollection)', deletedCount: convDeleted });
  totalDocsDeleted += convDeleted;
  console.log(`Cleared conversations: ${convDeleted} documents deleted.`);

  // 3. Clear users collection (Preserving admin users)
  let usersDeleted = 0;
  let adminPreservedCount = 0;
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();
      const isAdmin =
        ADMIN_EMAILS.includes(data.email) ||
        data.role === 'admin' ||
        data.role === 'super_admin';

      if (isAdmin) {
        adminPreservedCount++;
        console.log(`[PRESERVED ADMIN]: ${data.email || userDoc.id} (${data.role || 'admin'})`);
      } else {
        await deleteDoc(userDoc.ref);
        usersDeleted++;
      }
    }
  } catch (err) {
    console.warn("Notice clearing users collection:", err);
  }
  results.push({ collection: 'users (non-admin accounts)', deletedCount: usersDeleted });
  totalDocsDeleted += usersDeleted;
  console.log(`Cleared users: ${usersDeleted} user documents deleted. ${adminPreservedCount} primary admin account(s) preserved.`);

  // 4. Storage cleanup
  let storageFilesDeleted = 0;
  if (storage) {
    try {
      const rootRef = ref(storage, '/');
      storageFilesDeleted = await clearStorageFolder(rootRef);
      console.log(`Cleared Firebase Storage: ${storageFilesDeleted} files deleted.`);
    } catch (err) {
      console.warn("Storage clearing notice:", err);
    }
  }

  console.log("\n================ SUMMARY ================");
  console.log(`Total Firestore documents deleted: ${totalDocsDeleted}`);
  console.log(`Total Storage files deleted: ${storageFilesDeleted}`);
  console.log(`Primary Administrator Accounts Preserved: ${adminPreservedCount}`);
  console.log("=========================================\n");

  return {
    totalDocsDeleted,
    storageFilesDeleted,
    adminPreservedCount,
    details: results
  };
}

// Execute reset
runCompleteDataReset().then(() => {
  console.log("Data reset execution finished successfully.");
  process.exit(0);
}).catch((err) => {
  console.error("Data reset finished with errors:", err);
  process.exit(0);
});

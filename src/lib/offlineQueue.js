import { openDB } from 'idb';
import { supabase } from './supabase';

const DB_NAME = 'motomap47-reports';
const STORE_NAME = 'pending';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
    }
  }
});

/** Save a report — inserts straight to Supabase if online, queues in
 * IndexedDB if offline. The dashboard's real-time subscription picks up
 * the insert the moment it lands in Supabase. */
export async function saveReport(report) {
  if (navigator.onLine) {
    const { error } = await supabase.from('incidents').insert(report);
    if (!error) return { status: 'synced' };
  }
  const db = await dbPromise;
  const localId = crypto.randomUUID();
  await db.put(STORE_NAME, { ...report, localId, queuedAt: new Date().toISOString() });
  return { status: 'queued' };
}

export async function syncPending(onProgress) {
  const db = await dbPromise;
  const pending = await db.getAll(STORE_NAME);
  let synced = 0;
  for (const report of pending) {
    const { localId, queuedAt, ...payload } = report;
    const { error } = await supabase.from('incidents').insert(payload);
    if (!error) {
      await db.delete(STORE_NAME, localId);
      synced += 1;
      onProgress?.(synced, pending.length);
    }
  }
  return { synced, total: pending.length };
}

export async function pendingCount() {
  const db = await dbPromise;
  return (await db.getAll(STORE_NAME)).length;
}

window.addEventListener('online', () => { syncPending(); });

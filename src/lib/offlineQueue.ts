import { offlineDB, OfflineBase } from './offlineDB';

export async function enqueue(table: 'attendance' | 'payments', record: Omit<OfflineBase, 'id' | 'synced' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now();
  console.log('Enqueue to', table, record);
  await offlineDB[table].add({ ...record, synced: false, createdAt: now, updatedAt: now });
}

export async function listUnsynced(table: 'attendance' | 'payments') {
  // Avoid IDBKeyRange issues on some browsers by filtering in-memory
  const all = await offlineDB[table].toArray();
  return all.filter((r) => r.synced === false).sort((a, b) => a.createdAt - b.createdAt);
}

export async function markSynced(table: 'attendance' | 'payments', ids: number[]) {
  const now = Date.now();
  await offlineDB.transaction('rw', offlineDB[table], async () => {
    for (const id of ids) {
      await offlineDB[table].update(id, { synced: true, updatedAt: now });
    }
  });
}



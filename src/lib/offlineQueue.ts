import { offlineDB, OfflineBase } from './offlineDB';

export async function enqueue(
  table: 'attendance' | 'payments',
  record: Omit<OfflineBase, 'id' | 'synced' | 'createdAt' | 'updatedAt'>
) {
  // ✅ منع duplicate entries لنفس الـ clientUuid
  if (record.clientUuid) {
    const existing = await offlineDB[table]
      .where('clientUuid')
      .equals(record.clientUuid)
      .first();
    if (existing) {
      console.log('Duplicate clientUuid, skipping enqueue:', record.clientUuid);
      return;
    }
  }

  const now = Date.now();
  console.log('Enqueue to', table, record);
  await offlineDB[table].add({ ...record, synced: false, createdAt: now, updatedAt: now });
}

export async function listUnsynced(table: 'attendance' | 'payments') {
  const all = await offlineDB[table].toArray();
  return all.filter((r) => r.synced === false).sort((a, b) => a.createdAt - b.createdAt);
}

export async function markSynced(table: 'attendance' | 'payments', ids: number[]) {
  // ✅ احذف نهائياً بدل ما تعلم synced: true — علشان مش يترسل تاني
  await offlineDB.transaction('rw', offlineDB[table], async () => {
    for (const id of ids) {
      await offlineDB[table].delete(id);
    }
  });
}

// ✅ فنكشن جديدة لتنظيف الـ queue القديم اللي اتراكم
export async function clearSyncedRecords(table: 'attendance' | 'payments') {
  const synced = await offlineDB[table]
    .filter((r) => r.synced === true)
    .toArray();
  const ids = synced.map((r) => r.id!);
  if (ids.length) {
    await offlineDB[table].bulkDelete(ids);
    console.log(`Cleared ${ids.length} old synced records from ${table}`);
  }
}
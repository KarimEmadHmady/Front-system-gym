import { enqueue, listUnsynced, markSynced, clearSyncedRecords } from './offlineQueue';
import { API_ENDPOINTS } from './constants';
import { apiRequest } from './api';

let isSyncing = false;

// ✅ بدل postJson — دي بترجع { ok, status, data } بدون throw
async function safeFetch(url: string, body: any): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const response = await apiRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (err: any) {
    // ✅ لو apiRequest throw بسبب 409 أو غيره، نحاول نستخرج الـ status
    const status = err?.status ?? err?.response?.status ?? 0;
    const data = err?.error ?? err?.data ?? { message: err?.message ?? '' };
    return { ok: false, status, data };
  }
}

export async function syncData(baseUrl = ''): Promise<{ syncedCount: number; failedCount: number; importantMessages: string[] }> {
  if (isSyncing) return { syncedCount: 0, failedCount: 0, importantMessages: [] };
  isSyncing = true;

  let syncedCount = 0;
  let failedCount = 0;
  const importantMessages: string[] = [];

  try {
    await clearSyncedRecords('attendance');
    await clearSyncedRecords('payments');

    const unsyncedAttendance = await listUnsynced('attendance');
    console.log(`Found ${unsyncedAttendance.length} unsynced attendance records`);

    for (const item of unsyncedAttendance) {
      const { ok, status, data } = await safeFetch(item.endpoint, item.payload);

      const isDuplicate =
        status === 409 ||
        data?.message?.includes('سجلت حضور اليوم') ||
        data?.message?.includes('already') ||
        data?.alreadySynced;

      const isExpired =
        data?.message?.includes('انتهى') ||
        data?.message?.includes('expired');

      const isImportantMessage =
        data?.message?.includes('انتهى') ||
        data?.message?.includes('expired') ||
        data?.message?.includes('مجمد') ||
        data?.message?.includes('ملغي') ||
        data?.message?.includes('غير نشط');

      // ✅ اجمع الرسايل المهمة
      if (isImportantMessage && data?.message) {
        importantMessages.push(data.message);
      }

      if (ok || isDuplicate || isExpired) {
        // ✅ كل دول مش "فشل حقيقي" — امسح من الـ queue
        await markSynced('attendance', [item.id!]);
        if (ok) {
          syncedCount++;
        }
        // isDuplicate أو isExpired = مش هنعدهم كـ synced ولا failed
      } else {
        console.warn('Genuine sync failure:', status, data?.message, item.clientUuid);
        failedCount++;
      }
    }

    const unsyncedPayments = await listUnsynced('payments');
    for (const item of unsyncedPayments) {
      const { ok, status, data } = await safeFetch(item.endpoint, item.payload);
      if (ok || status === 409 || data?.alreadySynced) {
        await markSynced('payments', [item.id!]);
        if (ok) syncedCount++;
      } else {
        failedCount++;
      }
    }

  } finally {
    isSyncing = false;
  }

  return { syncedCount, failedCount, importantMessages };
}

export function initOnlineSync(baseUrl = '') {
  return () => {};
}

export async function queueAttendance(payload: any) {
  await enqueue('attendance', {
    clientUuid: payload.clientUuid,
    payload,
    endpoint: payload.userId ? '/attendance' : '/attendance-scan/scan',
    method: 'POST',
  });
}

export async function queuePayment(payload: any) {
  await enqueue('payments', {
    clientUuid: payload.clientUuid,
    payload,
    endpoint: API_ENDPOINTS.payments.create,
    method: 'POST',
  });
}
import { enqueue, listUnsynced, markSynced } from './offlineQueue';
import { API_ENDPOINTS } from './constants';
import { apiRequest } from './api';

async function postJson(url: string, body: any) {
  // Route through api helper to include baseURL and auth token
  const response = await apiRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function syncData(baseUrl = '') {
  // Sync attendance
  const unsyncedAttendance = await listUnsynced('attendance');
  if (unsyncedAttendance.length) {
    const ids: number[] = [];
    for (const item of unsyncedAttendance) {
      try {
        console.log('Syncing attendance:', item);
        // item.endpoint must be a path starting with '/'; apiRequest will prefix baseURL
        await postJson(item.endpoint, item.payload);
        ids.push(item.id!);
        console.log('Attendance synced:', item);
      } catch (err) {
        console.error('Failed to sync attendance:', item, err);
      }
    }
    if (ids.length) await markSynced('attendance', ids);
  }

  // Sync payments
  const unsyncedPayments = await listUnsynced('payments');
  if (unsyncedPayments.length) {
    const ids: number[] = [];
    for (const item of unsyncedPayments) {
      try {
        console.log('Syncing payment:', item);
        await postJson(item.endpoint, item.payload);
        ids.push(item.id!);
        console.log('Payment synced:', item);
      } catch (err) {
        console.error('Failed to sync payment:', item, err);
      }
    }
    if (ids.length) await markSynced('payments', ids);
  }
}

export function initOnlineSync(baseUrl = '') {
  const handler = () => {
    syncData(baseUrl).catch(() => {});
  };
  window.addEventListener('online', handler);
  // run once on init if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    handler();
  }
  return () => window.removeEventListener('online', handler);
}

// Helper to queue operations when offline
export async function queueAttendance(payload: any & { userId?: string; status?: string; notes?: string }) {
  console.log('Queuing attendance:', payload);
  await enqueue('attendance', {
    clientUuid: payload.clientUuid,
    payload,
    // If we have userId (from UI context), queue to records endpoint; otherwise use scan-by-barcode
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



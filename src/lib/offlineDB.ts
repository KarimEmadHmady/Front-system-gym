import Dexie, { Table } from 'dexie';

export type OfflineBase = {
  id?: number; // auto-increment key
  clientUuid: string; // frontend-generated UUID for idempotency
  payload: any; // raw API payload
  endpoint: string; // API endpoint to post to
  method?: 'POST' | 'PUT' | 'DELETE';
  synced: boolean;
  createdAt: number;
  updatedAt: number;
};

export class GymOfflineDB extends Dexie {
  attendance!: Table<OfflineBase, number>;
  payments!: Table<OfflineBase, number>;

  constructor() {
    super('GymOfflineDB');
    this.version(2).stores({
      attendance: '++id, clientUuid, synced, createdAt',
      payments: '++id, clientUuid, synced, createdAt',
    });
  }
}

export const offlineDB = new GymOfflineDB();



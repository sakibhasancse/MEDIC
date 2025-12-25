import { db, SyncQueue } from './db';
import { appointmentAPI, messageAPI } from './api';

class SyncService {
  private isSyncing = false;

  async sync() {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      const pendingItems = await db.syncQueue.toArray();

      for (const item of pendingItems) {
        await this.processItem(item);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueue) {
    try {
      switch (item.entity) {
        case 'appointment':
          if (item.action === 'create') {
            await appointmentAPI.book(item.data);
            // Update local ID if needed? 
            // Usually we might have a temp ID that needs mapping, but for simplicity we assume backend returns success
          }
          break;
        case 'message':
          if (item.action === 'create') {
            await messageAPI.send(item.data);
          }
          break;
        // add other cases
      }

      // Remove from queue on success
      if (item.id) await db.syncQueue.delete(item.id);

    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      // Increment retry count or mark as failed
      if (item.id) {
        await db.syncQueue.update(item.id, {
          retryCount: (item.retryCount || 0) + 1,
          lastError: typeof error === 'object' ? JSON.stringify(error) : String(error)
        });
      }
    }
  }

  async addToQueue(entity: SyncQueue['entity'], action: SyncQueue['action'], data: unknown, entityId: string) {
    await db.syncQueue.add({
      entity,
      action,
      data,
      entityId,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.sync();
    }
  }
}

export const syncService = new SyncService();

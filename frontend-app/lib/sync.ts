import { db } from './db';
import { medicineAPI, templateAPI, prescriptionAPI } from './api';

export const syncService = {
  // Cache medicines from API to Dexie
  cacheMedicines: async () => {
    try {
      // Cache recent medicines
      const response = await medicineAPI.getRecent();
      const medicines = response.data;

      // Map to Dexie schema if needed, but assuming it matches
      await db.medicines.bulkPut(medicines);
      console.log('Medicines cached:', medicines.length);
    } catch (error) {
      console.error('Error caching medicines:', error);
    }
  },

  // Cache templates from API to Dexie
  cacheTemplates: async () => {
    try {
      const response = await templateAPI.getAll();
      const templates = response.data;
      await db.templates.bulkPut(templates);
      console.log('Templates cached:', templates.length);
    } catch (error) {
      console.error('Error caching templates:', error);
    }
  },

  // Sync offline prescriptions to API
  syncPrescriptions: async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const pending = await db.offlinePrescriptions.toArray();
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} prescriptions...`);

    // Import patientAPI here to avoid circular dependency if any, or just use the imported one
    const { patientAPI } = require('./api');

    for (const p of pending) {
      try {
        // 1. Create/Update Patient
        const patientRes = await patientAPI.createOrUpdate(p.data.patient);
        const patientId = patientRes.data._id;

        // 2. Create Prescription with real Patient ID
        const prescriptionData = {
          ...p.data.prescription,
          patientId: patientId,
        };

        await prescriptionAPI.create(prescriptionData);

        // 3. Delete from offline DB
        await db.offlinePrescriptions.delete(p.id);
        console.log(`Synced prescription ${p.id}`);
      } catch (error) {
        console.error(`Failed to sync prescription ${p.id}:`, error);
        // Keep in offline DB to retry later
      }
    }
  },

  // Initialize sync (cache data and setup listeners)
  init: async () => {
    if (typeof window !== 'undefined') {
      if (navigator.onLine) {
        await syncService.cacheMedicines();
        await syncService.cacheTemplates();
        await syncService.syncPrescriptions();
      }

      window.addEventListener('online', () => {
        console.log('Online: Syncing...');
        syncService.syncPrescriptions();
      });
    }
  }
};

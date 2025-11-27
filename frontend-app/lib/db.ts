import Dexie, { Table } from 'dexie';

export interface Medicine {
  id?: string;
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
  commonDoses?: string[];
  category?: string;
}

export interface Template {
  id?: string;
  name: string;
  diagnosis?: string;
  medicines: any[];
  advice: string[];
  tests: string[];
}

export interface OfflinePrescription {
  id?: string;
  patientId: string;
  data: any;
  synced: boolean;
  createdAt: Date;
}

export class PrescriptionDB extends Dexie {
  medicines!: Table<Medicine>;
  templates!: Table<Template>;
  offlinePrescriptions!: Table<OfflinePrescription>;

  constructor() {
    super('PrescriptionMakerDB');
    this.version(1).stores({
      medicines: '++id, name, genericName',
      templates: '++id, name',
      offlinePrescriptions: '++id, synced, createdAt',
    });
  }
}

export const db = new PrescriptionDB();

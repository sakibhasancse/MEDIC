import Dexie, { Table } from 'dexie';

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  doctorId: string;
  doctorName: string;
  clinicName: string;
  patientId: string;
  diagnosis: string;
  medicines: Medicine[];
  advice: string[];
  tests: string[];
  date: string;
  syncStatus: 'synced' | 'pending' | 'offline' | 'failed';
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  name: string;
  genericName?: string;
  dose: string;
  duration: string;
  instructions: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  doctorPhoto?: string;
  patientId: string;
  date: string;
  time: string;
  visitType: 'online' | 'physical';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  syncStatus: 'synced' | 'pending' | 'offline' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  receiverId: string;
  content: string;
  attachments?: string[];
  readStatus: boolean;
  timestamp: string;
  syncStatus: 'synced' | 'pending' | 'offline' | 'failed';
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  type: 'prescription' | 'lab' | 'diagnosis' | 'appointment';
  title: string;
  description: string;
  date: string;
  doctorName?: string;
  clinicName?: string;
  relatedId?: string;
  createdAt: string;
}

export interface SyncQueue {
  id?: number;
  action: 'create' | 'update' | 'delete';
  entity: 'prescription' | 'appointment' | 'message';
  entityId: string;
  data: any;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

export class PatientDB extends Dexie {
  prescriptions!: Table<Prescription, string>;
  appointments!: Table<Appointment, string>;
  messages!: Table<Message, string>;
  medicalHistory!: Table<MedicalHistory, string>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super('PatientPortalDB');

    this.version(1).stores({
      prescriptions: 'id, prescriptionNumber, patientId, date, syncStatus',
      appointments: 'id, patientId, date, status, syncStatus',
      messages: 'id, threadId, timestamp, syncStatus',
      medicalHistory: 'id, patientId, type, date',
      syncQueue: '++id, entity, timestamp',
    });
  }
}

export const db = new PatientDB();

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patient_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('patient_token');
      localStorage.removeItem('patient_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { phone: string; password: string }) =>
    api.post('/auth/patient/login', credentials),

  register: (data: {
    name: string;
    phone: string;
    password: string;
    age?: number;
    gender?: string;
  }) => api.post('/auth/patient/register', data),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data: any) => api.patch('/patients/profile', data),
};

// Prescription API
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions/patient'),

  getById: (id: string) => api.get(`/prescriptions/${id}`),

  downloadPDF: (id: string) => api.get(`/prescriptions/${id}/pdf`, {
    responseType: 'blob',
  }),

  requestRefill: (id: string, medicines: string[]) =>
    api.post(`/prescriptions/${id}/refill`, { medicines }),
};

export const medicalRecordsAPI = {
  getAll: () => api.get('/medical-records'),
  upload: (data: FormData) => api.post('/medical-records', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => api.delete(`/medical-records/${id}`),
};

// Appointment API
export const appointmentAPI = {
  getAll: () => api.get('/appointments/patient'),

  getById: (id: string) => api.get(`/appointments/${id}`),

  book: (data: {
    clinicId: string;
    doctorId: string;
    date: string;
    time: string;
    visitType: 'online' | 'physical';
    notes?: string;
  }) => api.post('/appointments', data),

  reschedule: (id: string, data: { date: string; time: string }) =>
    api.put(`/appointments/${id}/reschedule`, data),

  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
};

// Message API
export const messageAPI = {
  getThreads: () => api.get('/messages/threads'),

  getThread: (threadId: string) => api.get(`/messages/thread/${threadId}`),

  send: (data: {
    receiverId: string;
    content: string;
    attachments?: string[];
  }) => api.post('/messages', data),

  markAsRead: (messageId: string) => api.put(`/messages/${messageId}/read`),
};

// Medical History API
export const historyAPI = {
  getTimeline: () => api.get('/medical-history/timeline'),

  export: () => api.get('/medical-history/export', {
    responseType: 'blob',
  }),
};

// Clinic API
export const clinicAPI = {
  getAll: () => api.get('/hospitals/public/list'),

  getById: (id: string) => api.get(`/hospitals/${id}`),

  getDoctors: (userId?: string) => api.get(`/doctor-profile/public/list`, { params: { userId } }),
};

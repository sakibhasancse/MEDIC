import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Medicine API
export const medicineAPI = {
  search: (query: string, limit = 10) => api.get(`/medicines/search?q=${query}&limit=${limit}`),
  getRecent: () => api.get('/medicines/recent'),
  create: (data: any) => api.post('/medicines', data),
  seed: () => api.post('/medicines/seed'),
};

// Patient API
export const patientAPI = {
  createOrUpdate: (data: any) => api.post('/patients', data),
  getByPhone: (phone: string) => api.get(`/patients/${phone}`),
};

// Prescription API
export const prescriptionAPI = {
  create: (data: any) => api.post('/prescriptions', data),
  getAll: () => api.get('/prescriptions'),
  getById: (id: string) => api.get(`/prescriptions/${id}`),
  update: (id: string, data: any) => api.put(`/prescriptions/${id}`, data),
  delete: (id: string) => api.delete(`/prescriptions/${id}`),
  generateShareLink: (id: string) => api.post(`/prescriptions/${id}/share`),
  getByShareToken: async (token: string) => {
    // No auth header for public share access
    const response = await axios.get(`${API_URL}/prescriptions/share/${token}`);
    return response.data;
  },
  downloadPDF: async (id: string) => {
    const response = await api.get(`/prescriptions/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  getPatientHistory: (patientId: string, filters?: any) =>
    api.get(`/prescriptions/patient/${patientId}/history`, { params: filters }),
};

// Template API
export const templateAPI = {
  getAll: () => api.get('/templates'),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

// Hospital API
export const hospitalAPI = {
  getAll: () => api.get('/hospitals'),
  getDefault: () => api.get('/hospitals/default'),
  getById: (id: string) => api.get(`/hospitals/${id}`),
  create: (data: any) => api.post('/hospitals', data),
  update: (id: string, data: any) => api.put(`/hospitals/${id}`, data),
  setDefault: (id: string) => api.put(`/hospitals/${id}/set-default`),
  delete: (id: string) => api.delete(`/hospitals/${id}`),
};

// Feature Settings API
export const featureSettingsAPI = {
  get: () => api.get('/feature-settings'),
  update: (data: any) => api.put('/feature-settings', data),
};

// Stats API
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
};

// Print Template API
export const printTemplateAPI = {
  getAll: () => api.get('/print-templates'),
  getById: (id: string) => api.get(`/print-templates/${id}`),
  seed: () => api.post('/print-templates/seed'),
  create: (data: any) => api.post('/print-templates', data),
  clone: (id: string, colorScheme: any) => api.post(`/print-templates/${id}/clone`, colorScheme),
  getByDoctor: (doctorId: string) => api.get(`/print-templates/doctor/${doctorId}`),
  updateLayout: (id: string, layout: any) => api.put(`/print-templates/${id}/layout`, layout),
  update: (id: string, data: any) => api.put(`/print-templates/${id}`, data),
  delete: (id: string) => api.delete(`/print-templates/${id}`),
  getPreviewData: (id: string) => api.get(`/print-templates/${id}/preview-data`),
  customize: (id: string, doctorId: string) => api.post(`/print-templates/${id}/customize`, { doctorId }),
  resetToDefault: (id: string, doctorId: string) => api.post(`/print-templates/${id}/reset`, { doctorId }),
};

// Doctor Profile API
export const doctorProfileAPI = {
  get: () => api.get('/doctor-profile'),
  createOrUpdate: (data: any) => api.post('/doctor-profile', data),
};

// Upload API
export const uploadAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hospitalAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/Layout/AppLayout';

export default function HospitalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadHospitals();
  }, [router]);

  const loadHospitals = async () => {
    try {
      const response = await hospitalAPI.getAll();
      setHospitals(response.data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await hospitalAPI.setDefault(id);
      toast.success('Default hospital updated');
      loadHospitals();
    } catch (error: any) {
      toast.error('Error setting default: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?\n\nThis action cannot be undone.`)) return;

    try {
      await hospitalAPI.delete(id);
      toast.success('Hospital deleted successfully');
      loadHospitals();
    } catch (error: any) {
      toast.error('Error deleting hospital: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospitals & Clinics</h1>
            <p className="text-gray-600 mt-1">Manage your hospital and clinic information</p>
          </div>
          <button
            onClick={() => router.push('/hospitals/new')}
            className="md-button-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Hospital
          </button>
        </div>

        {/* Hospitals Grid */}
        {loading ? (
          <div className="md-card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading hospitals...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="md-card p-12 text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Hospitals Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first hospital/clinic to get started
            </p>
            <button
              onClick={() => router.push('/hospitals/new')}
              className="md-button-primary"
            >
              Create Your First Hospital
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => (
              <div
                key={hospital._id}
                className="md-card hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header with Default Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {hospital.name}
                      </h3>
                      {hospital.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Default
                        </span>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🏥</span>
                    </div>
                  </div>

                  {/* Hospital Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {hospital.headerMode === 'richtext' ? (
                      <p className="flex items-center gap-2">
                        <span>📝</span>
                        <span>Rich Text Header</span>
                      </p>
                    ) : (
                      <>
                        {hospital.headerStructured?.clinicName && (
                          <p className="flex items-center gap-2">
                            <span>🏥</span>
                            <span className="truncate">{hospital.headerStructured.clinicName}</span>
                          </p>
                        )}
                        {hospital.headerStructured?.phone && (
                          <p className="flex items-center gap-2">
                            <span>📞</span>
                            <span>{hospital.headerStructured.phone}</span>
                          </p>
                        )}
                        {hospital.headerStructured?.email && (
                          <p className="flex items-center gap-2">
                            <span>✉️</span>
                            <span className="truncate">{hospital.headerStructured.email}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/hospitals/${hospital._id}`)}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    {!hospital.isDefault && (
                      <button
                        onClick={() => handleSetDefault(hospital._id)}
                        className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(hospital._id, hospital.name)}
                      className="md-icon-button text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

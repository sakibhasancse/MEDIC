'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { prescriptionAPI } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/Layout/AppLayout';

export default function PrescriptionListPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadPrescriptions();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [prescriptions, searchQuery, dateFilter, sortBy]);

  const loadPrescriptions = async () => {
    try {
      const response = await prescriptionAPI.getAll();
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...prescriptions];

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.prescriptionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(p => new Date(p.createdAt) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(p => new Date(p.createdAt) >= monthAgo);
    }

    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'patient-asc') {
      filtered.sort((a, b) => (a.patientId?.name || '').localeCompare(b.patientId?.name || ''));
    }

    setFilteredPrescriptions(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrescriptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);

  const handleDelete = async (id: string, prescriptionNumber: string) => {
    if (!confirm(`Delete prescription #${prescriptionNumber}?\n\nThis cannot be undone.`)) {
      return;
    }

    try {
      await prescriptionAPI.delete(id);
      toast.success('Prescription deleted successfully');
      loadPrescriptions();
    } catch (error) {
      toast.error('Failed to delete prescription');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-600 mt-1">
            {filteredPrescriptions.length} of {prescriptions.length} prescriptions
          </p>
        </div>

        {/* Filters */}
        <div className="md-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, patient, or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-100 focus:outline-none transition-all"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="patient-asc">Patient A-Z</option>
            </select>
          </div>
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="md-card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading prescriptions...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentItems.map((prescription) => (
                <div key={prescription._id} className="md-card hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">
                            {prescription.patientId?.name?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {prescription.patientId?.name || 'Unknown Patient'}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              #{prescription.prescriptionNumber}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {prescription.diagnosis || 'No diagnosis'}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>📅 {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}</span>
                            <span>💊 {prescription.medicines?.length || 0} medicines</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/prescriptions/${prescription._id}`)}
                          className="md-icon-button"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => router.push(`/prescription/new?edit=${prescription._id}`)}
                          className="md-icon-button"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(prescription._id, prescription.prescriptionNumber)}
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
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="md-button-primary px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full font-medium text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="md-button-primary px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="md-card p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first prescription to get started'}
            </p>
            {!searchQuery && dateFilter === 'all' && (
              <button
                onClick={() => router.push('/prescription/new')}
                className="md-button-primary"
              >
                Create Prescription
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

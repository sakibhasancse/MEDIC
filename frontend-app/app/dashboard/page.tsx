'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { statsAPI } from '@/lib/api';
import { format } from 'date-fns';
import AppLayout from '@/components/Layout/AppLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await statsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="md-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Today</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.prescriptionsToday || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="md-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-indigo-600">{stats?.prescriptionsThisWeek || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="md-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.prescriptionsThisMonth || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="md-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalPatients || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Link
              href="/prescription/new"
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">�</div>
              <h2 className="text-xl font-bold mb-2">New Prescription</h2>
              <p className="text-blue-100">Create in under 30 seconds</p>
            </Link>

            <Link
              href="/prescriptions"
              className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">📂</div>
              <h2 className="text-xl font-bold mb-2">My Prescriptions</h2>
              <p className="text-teal-100">View all created prescriptions</p>
            </Link>

            <Link
              href="/hospitals"
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">🏥</div>
              <h2 className="text-xl font-bold mb-2">Hospitals</h2>
              <p className="text-indigo-100">Manage hospitals/clinics</p>
            </Link>

            <Link
              href="/templates"
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">📋</div>
              <h2 className="text-xl font-bold mb-2">Templates</h2>
              <p className="text-purple-100">Prescription templates</p>
            </Link>

            <Link
              href="/settings"
              className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">⚙️</div>
              <h2 className="text-xl font-bold mb-2">Settings</h2>
              <p className="text-green-100">Features & print settings</p>
            </Link>

            <Link
              href="/profile"
              className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">👨‍⚕️</div>
              <h2 className="text-xl font-bold mb-2">Profile</h2>
              <p className="text-pink-100">Edit doctor details</p>
            </Link>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="md-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h3>
            {stats?.recentPrescriptions?.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{stats.recentPrescriptions.length} recent items</p>
            )}
          </div>
          <div className="p-0">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : stats?.recentPrescriptions?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {stats.recentPrescriptions.map((prescription: any) => (
                  <div
                    key={prescription._id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/prescriptions/${prescription._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {prescription.patientId?.name?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {prescription.patientId?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {prescription.diagnosis || 'No diagnosis'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{prescription.prescriptionNumber}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <button className="md-icon-button">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 font-medium">No prescriptions yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first prescription to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { prescriptionAPI } from '@/lib/api';
import PrescriptionView from '@/components/PrescriptionView';

export default function SharedPrescriptionPage() {
  const params = useParams();
  const [prescription, setPrescription] = useState<any>(null);
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrescription = async () => {
      try {
        const token = params.token as string;
        const data = await prescriptionAPI.getByShareToken(token);
        setPrescription(data);
        setHospital(data.hospitalId);
      } catch (err: any) {
        console.error('Error loading shared prescription:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load prescription');
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      loadPrescription();
    }
  }, [params.token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Prescription</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            This link may have expired or the prescription may no longer be available.
          </p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Prescription not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>

      {/* Header - Hidden on print */}
      <header className="bg-white shadow-sm border-b border-gray-200 no-print sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shared Prescription</h1>
              <p className="text-sm text-gray-500 mt-1">
                {prescription.prescriptionNumber} • {new Date(prescription.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md flex items-center gap-2"
            >
              <span>🖨️</span>
              Print
            </button>
          </div>
        </div>
      </header>

      {/* Prescription Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        <PrescriptionView
          mode="share"
          prescription={prescription}
          hospital={hospital}
        />
      </main>

      {/* Footer - Hidden on print */}
      <footer className="bg-white border-t border-gray-200 mt-8 py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>This is a shared prescription. For medical use only.</p>
          {prescription.shareTokenExpiry && (
            <p className="mt-1">
              This link expires on {new Date(prescription.shareTokenExpiry).toLocaleDateString()}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

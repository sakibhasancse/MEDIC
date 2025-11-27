'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { prescriptionAPI } from '@/lib/api';
import PrescriptionView from '@/components/PrescriptionView';

export default function PrescriptionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (params.id) {
      loadPrescription(params.id as string);
    }
  }, [params.id, router]);

  const loadPrescription = async (id: string) => {
    try {
      const response = await prescriptionAPI.getById(id);
      setPrescription(response.data);
    } catch (error) {
      console.error('Error loading prescription:', error);
      alert('Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we should auto-print
    if (typeof window !== 'undefined' && prescription) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('print') === 'true') {
        setTimeout(() => {
          window.print();
        }, 1000); // Small delay to ensure rendering
      }
    }
  }, [prescription]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await prescriptionAPI.downloadPDF(prescription._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${prescription.prescriptionNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!prescription) {
    return <div className="min-h-screen flex items-center justify-center">Prescription not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
        {/* Action Buttons - Hidden on print */}
        <div className="mb-6 flex justify-between items-center no-print">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to List
          </button>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  const response = await prescriptionAPI.generateShareLink(prescription._id);
                  await navigator.clipboard.writeText(response.data.url);
                  alert('Share link copied to clipboard! ✅\n\n' + response.data.url);
                } catch (error) {
                  console.error('Error generating share link:', error);
                  alert('Failed to generate share link');
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              🔗 Share
            </button>
            <button
              onClick={() => router.push(`/prescription/new?edit=${prescription._id}`)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handlePrint}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              📥 Download PDF
            </button>
          </div>
        </div>

        {/* Prescription Content - Using Unified Component */}
        <PrescriptionView
          mode="print"
          prescription={prescription}
          hospital={prescription.hospitalId}
        />
      </div>
    </div>
  );
}

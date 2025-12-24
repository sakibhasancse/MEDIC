'use client';

import { useEffect, useState } from 'react';
import { prescriptionAPI } from '@/lib/api';
import { format } from 'date-fns';

interface PatientHistoryProps {
  patientId: string;
}

export default function PatientHistory({ patientId }: PatientHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const loadHistory = async () => {
    try {
      const response = await prescriptionAPI.getPatientHistory(patientId);
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient History</h2>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        📋 Patient History ({history.length})
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No previous prescriptions
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {history.map((prescription) => (
            <div
              key={prescription._id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition cursor-pointer"
              onClick={() => setSelectedPrescription(
                selectedPrescription?._id === prescription._id ? null : prescription
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {prescription.diagnosis || 'No diagnosis'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {prescription.medicines?.length || 0} meds
                </span>
              </div>

              {selectedPrescription?._id === prescription._id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {prescription.medicines?.map((med: any, idx: number) => (
                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-gray-600">{med.dose} - {med.duration}</p>
                    </div>
                  ))}
                  {prescription.advice?.length > 0 && (
                    <div className="text-xs">
                      <p className="font-medium text-gray-700 mb-1">Advice:</p>
                      <ul className="space-y-1">
                        {prescription.advice.map((adv: string, idx: number) => (
                          <li key={idx} className="text-gray-600">• {adv}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

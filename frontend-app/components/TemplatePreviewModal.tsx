'use client';

import { useState, useEffect } from 'react';
import { printTemplateAPI } from '@/lib/api';
import { templateDataService } from '@/lib/templateDataService';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  hospitalData?: any;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  templateId,
  hospitalData,
}: TemplatePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && templateId) {
      loadPreviewData();
    }
  }, [isOpen, templateId]);

  const loadPreviewData = async () => {
    setLoading(true);
    try {
      const response = await printTemplateAPI.getPreviewData(templateId!);
      setPreviewData(response.data);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dummyData = templateDataService.getDummyData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-bold text-gray-900">👁️ Template Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading preview...</p>
            </div>
          ) : (
            <div
              className="bg-white shadow-2xl mx-auto rounded-lg p-8"
              style={{ width: '210mm', minHeight: '297mm' }}
            >
              {/* Header Section */}
              <div className="border-b-2 border-gray-300 pb-6 mb-6">
                <div className="text-center">
                  {/* Doctor Info (Rich Text or Structured Fallback) */}
                  {hospitalData?.doctorInfoRichText ? (
                    <div dangerouslySetInnerHTML={{ __html: hospitalData.doctorInfoRichText }} />
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {hospitalData?.doctorInfo?.name || 'Dr. John Doe'}
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        {hospitalData?.doctorInfo?.degrees?.join(', ') || 'MBBS, FCPS (Medicine)'}
                      </p>
                      {hospitalData?.doctorInfo?.bmdcNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          BMDC Reg: {hospitalData.doctorInfo.bmdcNumber}
                        </p>
                      )}
                    </>
                  )}

                  {/* Doctor Info Bangla (Rich Text or Structured Fallback) */}
                  {hospitalData?.doctorInfoRichTextBangla ? (
                    <div className="mt-2" dangerouslySetInnerHTML={{ __html: hospitalData.doctorInfoRichTextBangla }} />
                  ) : (
                    <>
                      {hospitalData?.doctorInfo?.nameInBangla && (
                        <h2 className="text-xl font-bold text-gray-800 mt-1">
                          {hospitalData.doctorInfo.nameInBangla}
                        </h2>
                      )}
                      {hospitalData?.doctorInfo?.degreesBangla && hospitalData.doctorInfo.degreesBangla.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {hospitalData.doctorInfo.degreesBangla.join(', ')}
                        </p>
                      )}
                    </>
                  )}

                  {/* Hospital Info (Rich Text or Structured Fallback) */}
                  <div className="mt-4">
                    {hospitalData?.hospitalInfoRichText ? (
                      <div dangerouslySetInnerHTML={{ __html: hospitalData.hospitalInfoRichText }} />
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700">
                          {hospitalData?.headerStructured?.clinicName || hospitalData?.name || 'City General Hospital'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {hospitalData?.headerStructured?.address || '123 Medical Road, City'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          📞 {hospitalData?.headerStructured?.phone || '01712345678'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Hospital Info Bangla (Rich Text or Structured Fallback) */}
                  <div className="mt-2">
                    {hospitalData?.hospitalInfoRichTextBangla ? (
                      <div dangerouslySetInnerHTML={{ __html: hospitalData.hospitalInfoRichTextBangla }} />
                    ) : (
                      <>
                        {hospitalData?.headerStructured?.clinicNameBangla && (
                          <p className="text-sm font-bold text-gray-700">
                            {hospitalData.headerStructured.clinicNameBangla}
                          </p>
                        )}
                        {hospitalData?.headerStructured?.addressBangla && (
                          <p className="text-xs text-gray-600">
                            {hospitalData.headerStructured.addressBangla}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* Patient Info */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Patient:</strong> {dummyData.patient.name}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Age:</strong> {dummyData.patient.age} years
                  </div>
                  <div>
                    <strong>Gender:</strong> {dummyData.patient.gender}
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                      🔍 Diagnosis
                    </h3>
                    <p className="text-sm text-gray-700">
                      {dummyData.diagnosis.join(', ')}
                    </p>
                  </div>

                  {/* Tests */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                      🧪 Investigations
                    </h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      {dummyData.tests.map((test, index) => (
                        <div key={index}>{index + 1}. {test}</div>
                      ))}
                    </div>
                  </div>

                  {/* Advice */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                      💡 Advice
                    </h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      {dummyData.advice.map((item, index) => (
                        <div key={index}>{index + 1}. {item}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Medicines */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    💊 Rx
                  </h3>
                  <div className="space-y-3">
                    {dummyData.medicines.map((med, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">
                          {index + 1}. {med.name}
                        </div>
                        <div className="text-gray-600 ml-4">
                          {med.dose} - {med.duration}
                        </div>
                        <div className="text-gray-500 text-xs ml-4">
                          {med.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <strong>Next Visit:</strong> {hospitalData?.footerSettings?.defaultNextVisitDay || '7 days'}
                  </div>
                  <div className="text-center">
                    {hospitalData?.footerStructured?.text && (
                      <p>{hospitalData.footerStructured.text}</p>
                    )}
                    {hospitalData?.footerStructured?.textBangla && (
                      <p>{hospitalData.footerStructured.textBangla}</p>
                    )}
                  </div>
                  <div>
                    <strong>Show Time:</strong> {hospitalData?.footerSettings?.showTime || '10:00 AM - 2:00 PM'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg flex items-center gap-2"
          >
            <span>🖨️</span>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

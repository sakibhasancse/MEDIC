'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { hospitalAPI, doctorProfileAPI } from '@/lib/api';

import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { TemplateGallery } from '@/components/template-editor/TemplateGallery';
import { printTemplateAPI } from '@/lib/api';
import HospitalSearch from '@/components/HospitalSearch';
import RichTextEditor from '@/components/RichTextEditor';

const PrintLayoutEditor = dynamic(() => import('@/components/PrintLayoutEditor'), {
  ssr: false,
  loading: () => <p>Loading layout editor...</p>,
});

export default function HospitalEditorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [isTemplateValid, setIsTemplateValid] = useState(true);
  const [hospital, setHospital] = useState<any>({
    name: '',
    isDefault: false,
    defaultPrintTemplateId: '',
    // Hospital Details (formerly headerStructured)
    headerStructured: {
      clinicName: '',
      address: '',
      phone: '',
      email: '',
      logo: '',
    },
    // Doctor Details
    doctorInfo: {
      name: '',
      nameInBangla: '',
      degrees: [],
      emails: [],
      bmdcNumber: '',
    },
    // Footer Settings
    footerSettings: {
      showTime: '',
      defaultNextVisitDay: '',
    },
    // Print Layout
    printLayout: {
      leftColumn: ['tests', 'advice', 'physicalExamination'],
      rightColumn: ['medicines'],
    },
    signature: '',
    doctorInfoRichText: '',
    doctorInfoRichTextBangla: '',
    hospitalInfoRichText: '',
    hospitalInfoRichTextBangla: '',
  });

  useEffect(() => {
    if (!isNew) {
      loadHospital();
    } else if (user?._id) {
      loadDoctorProfile();
    }
  }, [params.id, user]);

  const loadDoctorProfile = async () => {
    try {
      const res = await doctorProfileAPI.get(user!._id);
      if (res.data) {
        const profile = res.data;
        
        // Format Doctor Info (English)
        const doctorInfoHtml = `
          <p style="text-align: center;"><strong><span style="font-size: 14pt;">Dr. ${profile.name}</span></strong></p>
          <p style="text-align: center;">${profile.degrees.join(', ')}</p>
          <p style="text-align: center;">${profile.specialization || ''}</p>
          <p style="text-align: center;">BMDC Reg: ${profile.bmdcNumber || '...'}</p>
        `;

        // Format Doctor Info (Bangla)
        const doctorInfoBanglaHtml = `
          <p style="text-align: center;"><strong><span style="font-size: 14pt;">ডাঃ ${profile.nameBangla || profile.name}</span></strong></p>
          <p style="text-align: center;">${profile.degreesBangla.length > 0 ? profile.degreesBangla.join(', ') : profile.degrees.join(', ')}</p>
          <p style="text-align: center;">${profile.specialization || ''}</p>
          <p style="text-align: center;">বিএমডিসি রেজিঃ ${profile.bmdcNumber || '...'}</p>
        `;

        setHospital((prev: any) => ({
          ...prev,
          doctorInfo: {
            name: profile.name,
            nameInBangla: profile.nameBangla,
            degrees: profile.degrees,
            emails: [profile.email],
            bmdcNumber: profile.bmdcNumber,
          },
          doctorInfoRichText: doctorInfoHtml,
          doctorInfoRichTextBangla: doctorInfoBanglaHtml,
          signature: profile.signature || prev.signature,
        }));
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHospital = async () => {
    try {
      const response = await hospitalAPI.getById(params.id as string);
      setHospital(response.data);
    } catch (error) {
      console.error('Error loading hospital:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch template name when ID changes
  useEffect(() => {
    const fetchTemplateName = async () => {
      if (hospital.defaultPrintTemplateId) {
        try {
          const res = await printTemplateAPI.getById(hospital.defaultPrintTemplateId);
          if (res.data) {
            setTemplateName(res.data.name);
            setIsTemplateValid(true);
          } else {
            setTemplateName('Template Not Found');
            setIsTemplateValid(false);
          }
        } catch (error) {
          console.error('Error fetching template name:', error);
          setTemplateName('Template Not Found');
          setIsTemplateValid(false);
        }
      } else {
        setTemplateName('');
        setIsTemplateValid(false);
      }
    };
    fetchTemplateName();
  }, [hospital.defaultPrintTemplateId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure we don't send deprecated fields if they exist in the object
      const payload = {
        ...hospital,
        headerMode: 'structured', // Force structured
        footerMode: 'structured', // Force structured
      };

      if (isNew) {
        await hospitalAPI.create(payload);
      } else {
        await hospitalAPI.update(params.id as string, payload);
      }
      alert('Hospital saved successfully! ✅');
      router.push('/hospitals');
    } catch (error: any) {
      alert('Error saving hospital: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (field === 'signature') {
            setHospital({ ...hospital, signature: event.target?.result });
          } else if (field === 'logo') {
            setHospital({
              ...hospital,
              headerStructured: {
                ...hospital.headerStructured,
                logo: event.target?.result,
              },
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            {isNew ? '➕ New Hospital' : '✏️ Edit Hospital'}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Hospital'}
            </button>
            <button
              onClick={() => router.push('/hospitals')}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* General Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
            
            <HospitalSearch 
              onSelect={(selectedHospital) => {
                // Format Hospital Info (English)
                const hospitalInfoHtml = `
                  <p style="text-align: center;"><strong><span style="font-size: 18pt;">${selectedHospital.name}</span></strong></p>
                  <p style="text-align: center;">${selectedHospital.address}</p>
                  <p style="text-align: center;">Phone: ... | Email: ...</p>
                `;

                // Format Hospital Info (Bangla)
                const hospitalInfoBanglaHtml = `
                  <p style="text-align: center;"><strong><span style="font-size: 18pt;">${selectedHospital.nameBangla || selectedHospital.name}</span></strong></p>
                  <p style="text-align: center;">${selectedHospital.address}</p>
                  <p style="text-align: center;">Phone: ... | Email: ...</p>
                `;

                setHospital((prev: any) => ({
                  ...prev,
                  name: selectedHospital.name,
                  hospitalInfoRichText: hospitalInfoHtml,
                  hospitalInfoRichTextBangla: hospitalInfoBanglaHtml,
                  headerStructured: {
                    ...prev.headerStructured,
                    clinicName: selectedHospital.name,
                    clinicNameBangla: selectedHospital.nameBangla,
                    address: selectedHospital.address,
                    addressBangla: selectedHospital.address,
                  }
                }));
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital/Clinic Name *
                </label>
                <input
                  type="text"
                  value={hospital.name}
                  onChange={(e) => setHospital({ ...hospital, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., City General Hospital"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hospital.isDefault}
                    onChange={(e) => setHospital({ ...hospital, isDefault: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Set as default hospital
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Hospital Details (Rich Text) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hospital Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Information (English)
                </label>
                <RichTextEditor
                  value={hospital.hospitalInfoRichText || ''}
                  onChange={(content) => setHospital({ ...hospital, hospitalInfoRichText: content })}
                  height={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default Format: <strong>Clinic Name</strong><br/>Address<br/>Phone: ... | Email: ...
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Information (Bangla)
                </label>
                <RichTextEditor
                  value={hospital.hospitalInfoRichTextBangla || ''}
                  onChange={(content) => setHospital({ ...hospital, hospitalInfoRichTextBangla: content })}
                  height={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Logo</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleImageUpload('logo')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {hospital.headerStructured?.logo ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {hospital.headerStructured?.logo && (
                    <img
                      src={hospital.headerStructured.logo}
                      alt="Logo"
                      className="h-16 object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Doctor Information (Rich Text) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Information (English)
                </label>
                <RichTextEditor
                  value={hospital.doctorInfoRichText || ''}
                  onChange={(content) => setHospital({ ...hospital, doctorInfoRichText: content })}
                  height={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default Format: <strong>Dr. Name</strong><br/>Degrees<br/>BMDC Reg: ...
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Information (Bangla)
                </label>
                <RichTextEditor
                  value={hospital.doctorInfoRichTextBangla || ''}
                  onChange={(content) => setHospital({ ...hospital, doctorInfoRichTextBangla: content })}
                  height={200}
                />
              </div>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Text (English)
                </label>
                <input
                  type="text"
                  value={hospital.footerStructured?.text || ''}
                  onChange={(e) =>
                    setHospital({
                      ...hospital,
                      footerStructured: { ...hospital.footerStructured, text: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Additional footer text..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Text (Bangla)
                </label>
                <input
                  type="text"
                  value={hospital.footerStructured?.textBangla || ''}
                  onChange={(e) =>
                    setHospital({
                      ...hospital,
                      footerStructured: { ...hospital.footerStructured, textBangla: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="ফুটার টেক্সট..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Show Time
                </label>
                <input
                  type="text"
                  value={hospital.footerSettings?.showTime || ''}
                  onChange={(e) =>
                    setHospital({
                      ...hospital,
                      footerSettings: { ...hospital.footerSettings, showTime: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="10 AM - 2 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Next Visit Day
                </label>
                <select
                  value={hospital.footerSettings?.defaultNextVisitDay || ''}
                  onChange={(e) =>
                    setHospital({
                      ...hospital,
                      footerSettings: {
                        ...hospital.footerSettings,
                        defaultNextVisitDay: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select day...</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </div>
          </div>



          {/* Signature */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature</h2>
            <button
              onClick={() => handleImageUpload('signature')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {hospital.signature ? 'Change Signature' : 'Upload Signature'}
            </button>
            {hospital.signature && (
              <img
                src={hospital.signature}
                alt="Signature"
                className="mt-4 h-24 object-contain border border-gray-200 rounded p-2"
              />
            )}
          </div>

          {/* Prescription Template */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Prescription Template</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select the design template for this hospital's prescriptions.
                </p>
              </div>
              {hospital.defaultPrintTemplateId && (
                <button
                  onClick={() => setShowTemplatePreview(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <span className="text-lg">👁️</span> Preview
                </button>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg border flex items-center justify-center text-2xl shadow-sm ${
                    isTemplateValid ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'
                  }`}>
                    {hospital.defaultPrintTemplateId && isTemplateValid ? '📄' : '⚠️'}
                  </div>
                  <div>
                    <h3 className={`font-medium text-lg ${isTemplateValid ? 'text-gray-900' : 'text-red-600'}`}>
                      {templateName || 'No Template Selected'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {hospital.defaultPrintTemplateId 
                        ? (isTemplateValid ? 'Ready for printing' : 'Selected template no longer exists')
                        : 'Please select a template to enable printing'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowGallery(true)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
                  >
                    {hospital.defaultPrintTemplateId ? 'Change Template' : 'Select Template'}
                  </button>
                  
                  {hospital.defaultPrintTemplateId && (
                    <button
                      onClick={() => router.push(`/templates/${hospital.defaultPrintTemplateId}/edit`)}
                      disabled={!isTemplateValid}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 ${
                        isTemplateValid 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={!isTemplateValid ? 'Template not found. Please select a different template.' : ''}
                    >
                      <span>🎨</span> Edit Design
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Template Gallery Modal */}
      {showGallery && (
        <TemplateGallery
          selectedTemplateId={hospital.defaultPrintTemplateId}
          doctorId={hospital.doctorId}
          onSelectTemplate={(id) => {
            setHospital({ ...hospital, defaultPrintTemplateId: id });
            setShowGallery(false);
          }}
          onEditTemplate={(id) => {
            setHospital({ ...hospital, defaultPrintTemplateId: id });
            setShowGallery(false);
            router.push(`/templates/${id}/edit`);
          }}
          onClose={() => setShowGallery(false)}
        />
      )}



      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        templateId={hospital.defaultPrintTemplateId}
        hospitalData={hospital}
      />
    </div>
  );
}

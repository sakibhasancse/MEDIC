'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { featureSettingsAPI, settingsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/Layout/AppLayout';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  
  const [featureSettings, setFeatureSettings] = useState<any>(null);
  const [doctorSettings, setDoctorSettings] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const [featuresRes, settingsRes] = await Promise.all([
        featureSettingsAPI.get(),
        settingsAPI.get(),
      ]);
      setFeatureSettings(featuresRes.data);
      setDoctorSettings(settingsRes.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        featureSettingsAPI.update(featureSettings),
        settingsAPI.update(doctorSettings),
      ]);
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error('Error saving settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setFeatureSettings({
      ...featureSettings,
      enabledSections: {
        ...featureSettings.enabledSections,
        [section]: !featureSettings.enabledSections?.[section],
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Configure your prescription features and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="md-button-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Tabs */}
        <div className="md-card">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'features'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Feature Toggles
              </button>
              <button
                onClick={() => setActiveTab('print')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'print'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Print Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <>
                {/* Feature Toggles Tab */}
                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Enable/Disable Prescription Sections
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Control which sections appear on the prescription creation page
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'chiefComplaint', label: 'Chief Complaint' },
                        { key: 'historyOfPresentIllness', label: 'History of Present Illness' },
                        { key: 'previousLabReports', label: 'Previous Lab Reports' },
                        { key: 'physicalExamination', label: 'Physical Examination' },
                        { key: 'vitalSigns', label: 'Vital Signs' },
                        { key: 'diagnosis', label: 'Diagnosis' },
                        { key: 'medicines', label: 'Medicines (Always Enabled)', disabled: true },
                        { key: 'tests', label: 'Tests' },
                        { key: 'advice', label: 'Advice' },
                        { key: 'nextVisit', label: 'Next Visit' },
                      ].map((section) => (
                        <label
                          key={section.key}
                          className={`flex items-center p-4 border-2 rounded-lg transition-colors ${
                            section.disabled
                              ? 'bg-gray-50 cursor-not-allowed border-gray-200'
                              : 'cursor-pointer hover:bg-blue-50 hover:border-blue-200 border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              section.disabled || featureSettings?.enabledSections?.[section.key]
                            }
                            onChange={() => !section.disabled && toggleSection(section.key)}
                            disabled={section.disabled}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {section.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Print Settings Tab */}
                {activeTab === 'print' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Prescription Print Settings
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={featureSettings?.printSettings?.printBodyOnly || false}
                          onChange={(e) =>
                            setFeatureSettings({
                              ...featureSettings,
                              printSettings: {
                                ...featureSettings.printSettings,
                                printBodyOnly: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Print body only (exclude header/footer)
                        </span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size: {featureSettings?.printSettings?.fontSize || 12}pt
                        </label>
                        <input
                          type="range"
                          min="8"
                          max="16"
                          value={featureSettings?.printSettings?.fontSize || 12}
                          onChange={(e) =>
                            setFeatureSettings({
                              ...featureSettings,
                              printSettings: {
                                ...featureSettings.printSettings,
                                fontSize: parseInt(e.target.value),
                              },
                            })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paper Size
                          </label>
                          <select
                            value={featureSettings?.printSettings?.paperSize || 'A4'}
                            onChange={(e) =>
                              setFeatureSettings({
                                ...featureSettings,
                                printSettings: {
                                  ...featureSettings.printSettings,
                                  paperSize: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                          >
                            <option value="A4">A4</option>
                            <option value="Letter">Letter</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orientation
                          </label>
                          <select
                            value={featureSettings?.printSettings?.orientation || 'portrait'}
                            onChange={(e) =>
                              setFeatureSettings({
                                ...featureSettings,
                                printSettings: {
                                  ...featureSettings.printSettings,
                                  orientation: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                          >
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

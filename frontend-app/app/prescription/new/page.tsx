'use client';

import { toast } from 'react-hot-toast';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MedicineSearch from '@/components/MedicineSearch';
import PatientHistory from '@/components/PatientHistory';
import PrescriptionView from '@/components/PrescriptionView';
import { patientAPI, prescriptionAPI, hospitalAPI, featureSettingsAPI } from '@/lib/api';
import { db } from '@/lib/db';
import { useFormValidation } from '@/lib/useFormValidation';
import FormError from '@/components/FormError';
import { 
  validateRequired, 
  validatePhone, 
  validateAge, 
  validateName, 
  validateSelection,
  validateMedicine
} from '@/lib/validation';

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dose: string;
  duration: string;
  instructions: string;
}

// Sortable Medicine Item Component
function SortableMedicineItem({ medicine, index, onUpdate, onRemove, dosePresets, error }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: medicine.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl p-3 shadow-sm border hover:shadow-md transition-all group ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-100'}`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        
        {/* Medicine Name & Generic */}
        <div className="w-1/4 min-w-[150px]">
          <h3 className="text-sm font-bold text-gray-900 truncate" title={medicine.name}>{medicine.name}</h3>
          {medicine.genericName && (
            <p className="text-xs text-gray-500 truncate" title={medicine.genericName}>{medicine.genericName}</p>
          )}
        </div>

        {/* Inputs Row */}
        <div className="flex-1 grid grid-cols-12 gap-2 items-center">
          {/* Dose */}
          <div className="col-span-4 relative group/dose">
            <input
              type="text"
              value={medicine.dose}
              onChange={(e) => onUpdate(index, 'dose', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Dose (1+0+1)"
            />
            {/* Quick Dose Presets Popover on Hover/Focus */}
            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-2 z-20 hidden group-focus-within/dose:flex flex-wrap gap-1 w-48 border border-gray-100">
               {dosePresets.slice(0, 6).map((preset: string) => (
                  <button
                    key={preset}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onUpdate(index, 'dose', preset); }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded"
                  >
                    {preset}
                  </button>
               ))}
            </div>
          </div>

          {/* Duration */}
          <div className="col-span-3">
            <input
              type="text"
              value={medicine.duration}
              onChange={(e) => onUpdate(index, 'duration', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Duration"
            />
          </div>

          {/* Instructions */}
          <div className="col-span-5">
            <input
              type="text"
              value={medicine.instructions}
              onChange={(e) => onUpdate(index, 'instructions', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Instruction"
            />
          </div>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition flex-shrink-0"
          title="Remove"
        >
          ✕
        </button>
      </div>
      {error && <div className="mt-2 text-xs text-red-500 px-8">{error}</div>}
    </div>
  );
}

// Sortable List Item Component
function SortableListItem({ item, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white border border-gray-100 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <span className="text-sm">{item.text}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 text-sm opacity-0 group-hover:opacity-100 transition"
      >
        Remove
      </button>
    </li>
  );
}

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [featureSettings, setFeatureSettings] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editPrescriptionId, setEditPrescriptionId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hospitalId: '',
    patientPhone: '',
    patientName: '',
    patientAge: '',
    patientGender: 'male',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    previousLabReports: '',
    physicalExamination: '',
    vitalSigns: {
      bloodPressure: '',
      pulse: '',
      temperature: '',
      weight: '',
      height: '',
    },
    diagnosis: '',
    medicines: [] as Medicine[],
    advice: [] as Array<{ id: string; text: string }>,
    tests: [] as Array<{ id: string; text: string }>,
    nextVisitDuration: '',
    language: 'en',
  });

  const [currentAdvice, setCurrentAdvice] = useState('');
  const [currentTest, setCurrentTest] = useState('');

  const { errors, validateField, setError, clearError, hasErrors } = useFormValidation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadInitialData();
    
    // Check if we're in edit mode
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get('edit');
    if (editId) {
      setEditMode(true);
      setEditPrescriptionId(editId);
      loadPrescriptionForEdit(editId);
    }
  }, [router]);

  const loadInitialData = async () => {
    try {
      const [hospitalsRes, settingsRes] = await Promise.all([
        hospitalAPI.getAll(),
        featureSettingsAPI.get(),
      ]);
      
      setHospitals(hospitalsRes.data);
      setFeatureSettings(settingsRes.data);
      
      // Set default hospital and auto-populate footer settings
      const defaultHospital = hospitalsRes.data.find((h: any) => h.isDefault);
      if (defaultHospital && !editMode) {
        setFormData(prev => ({
          ...prev,
          hospitalId: defaultHospital._id,
          showTime: defaultHospital.footerSettings?.showTime || '',
          nextVisitDay: defaultHospital.footerSettings?.defaultNextVisitDay || '',
        }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadPrescriptionForEdit = async (id: string) => {
    try {
      setLoading(true);
      const response = await prescriptionAPI.getById(id);
      const prescription = response.data;
      const patient = prescription.patientId;

      // Populate form with existing data
      setFormData({
        hospitalId: prescription.hospitalId?._id || '',
        patientPhone: patient?.phone || '',
        patientName: patient?.name || '',
        patientAge: patient?.age?.toString() || '',
        patientGender: patient?.gender || 'male',
        chiefComplaint: prescription.chiefComplaint || '',
        historyOfPresentIllness: prescription.historyOfPresentIllness || '',
        previousLabReports: prescription.previousLabReports || '',
        physicalExamination: prescription.physicalExamination || '',
        vitalSigns: prescription.vitalSigns || {
          bloodPressure: '',
          pulse: '',
          temperature: '',
          weight: '',
          height: '',
        },
        diagnosis: prescription.diagnosis || '',
        medicines: prescription.medicines.map((med: any, index: number) => ({
          id: `med-${Date.now()}-${index}`,
          ...med,
        })),
        advice: prescription.advice.map((adv: string, index: number) => ({
          id: `adv-${Date.now()}-${index}`,
          text: adv,
        })),
        tests: prescription.tests.map((test: string, index: number) => ({
          id: `test-${Date.now()}-${index}`,
          text: test,
        })),
        nextVisitDuration: prescription.nextVisitDuration || '',
        language: prescription.language || 'en',
      });

      setPatient(patient);
      setShowHistory(!!patient);
    } catch (error) {
      console.error('Error loading prescription for edit:', error);
      toast.error('Failed to load prescription for editing');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = async (phone: string) => {
    setFormData({ ...formData, patientPhone: phone });

    if (phone.length >= 10) {
      try {
        const response = await patientAPI.getByPhone(phone);
        if (response.data) {
          setPatient(response.data);
          setFormData({
            ...formData,
            patientPhone: phone,
            patientName: response.data.name,
            patientAge: response.data.age?.toString() || '',
            patientGender: response.data.gender || 'male',
          });
          setShowHistory(true);
        }
      } catch (error) {
        setShowHistory(false);
      }
    }
  };

  const handleAddMedicine = (medicine: any) => {
    const newMedicine: Medicine = {
      id: `med-${Date.now()}-${Math.random()}`,
      name: medicine.name,
      genericName: medicine.genericName,
      dose: medicine.commonDoses?.[0] || '1+1+1',
      duration: '7 days',
      instructions: 'After meal',
    };
    setFormData({ ...formData, medicines: [...formData.medicines, newMedicine] });
  };

  const handleRemoveMedicine = (index: number) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMedicines });
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setFormData({ ...formData, medicines: newMedicines });
  };

  const handleDragEndMedicines = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formData.medicines.findIndex((m) => m.id === active.id);
      const newIndex = formData.medicines.findIndex((m) => m.id === over.id);
      setFormData({
        ...formData,
        medicines: arrayMove(formData.medicines, oldIndex, newIndex),
      });
    }
  };

  const handleDragEndAdvice = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formData.advice.findIndex((a) => a.id === active.id);
      const newIndex = formData.advice.findIndex((a) => a.id === over.id);
      setFormData({
        ...formData,
        advice: arrayMove(formData.advice, oldIndex, newIndex),
      });
    }
  };

  const handleDragEndTests = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formData.tests.findIndex((t) => t.id === active.id);
      const newIndex = formData.tests.findIndex((t) => t.id === over.id);
      setFormData({
        ...formData,
        tests: arrayMove(formData.tests, oldIndex, newIndex),
      });
    }
  };

  const handleAddAdvice = () => {
    if (currentAdvice.trim()) {
      setFormData({
        ...formData,
        advice: [...formData.advice, { id: `adv-${Date.now()}`, text: currentAdvice.trim() }],
      });
      setCurrentAdvice('');
    }
  };

  const handleAddTest = () => {
    if (currentTest.trim()) {
      setFormData({
        ...formData,
        tests: [...formData.tests, { id: `test-${Date.now()}`, text: currentTest.trim() }],
      });
      setCurrentTest('');
    }
  };

  const createPrescription = async () => {
    // Offline Support
    if (!navigator.onLine) {
      const offlineData = {
        patient: {
          phone: formData.patientPhone,
          name: formData.patientName,
          age: parseInt(formData.patientAge),
          gender: formData.patientGender,
        },
        prescription: {
          hospitalId: formData.hospitalId,
          // patientId will be set during sync
          chiefComplaint: formData.chiefComplaint,
          historyOfPresentIllness: formData.historyOfPresentIllness,
          previousLabReports: formData.previousLabReports,
          physicalExamination: formData.physicalExamination,
          vitalSigns: formData.vitalSigns,
          diagnosis: formData.diagnosis,
          medicines: formData.medicines.map(({ id, ...rest }) => rest),
          advice: formData.advice.map((a) => a.text),
          tests: formData.tests.map((t) => t.text),
          nextVisitDuration: formData.nextVisitDuration,
          language: formData.language,
        }
      };

      await db.offlinePrescriptions.add({
        patientId: formData.patientPhone,
        data: offlineData,
        synced: false,
        createdAt: new Date(),
      });

      return { 
        _id: 'offline-' + Date.now(), 
        prescriptionNumber: 'OFFLINE',
        createdAt: new Date().toISOString()
      };
    }

    const patientResponse = await patientAPI.createOrUpdate({
      phone: formData.patientPhone,
      name: formData.patientName,
      age: parseInt(formData.patientAge),
      gender: formData.patientGender,
    });

    const response = await prescriptionAPI.create({
      hospitalId: formData.hospitalId,
      patientId: patientResponse.data._id,
      chiefComplaint: formData.chiefComplaint,
      historyOfPresentIllness: formData.historyOfPresentIllness,
      previousLabReports: formData.previousLabReports,
      physicalExamination: formData.physicalExamination,
      vitalSigns: formData.vitalSigns,
      diagnosis: formData.diagnosis,
      medicines: formData.medicines.map(({ id, ...rest }) => rest),
      advice: formData.advice.map((a) => a.text),
      tests: formData.tests.map((t) => t.text),
      nextVisitDuration: formData.nextVisitDuration,
      language: formData.language,
    });

    return response.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const hospitalValid = validateField('hospitalId', () => validateSelection(formData.hospitalId, 'Hospital'));
    const phoneValid = validateField('patientPhone', () => validatePhone(formData.patientPhone));
    const nameValid = validateField('patientName', () => validateName(formData.patientName));
    const ageValid = validateField('patientAge', () => validateAge(formData.patientAge));
    
    // Medicine Validation
    let medicinesValid = true;
    if (formData.medicines.length === 0 && formData.advice.length === 0 && formData.tests.length === 0) {
      setError('medicines', 'At least one medicine, advice, or test is required');
      medicinesValid = false;
    } else {
      clearError('medicines');
    }

    // Validate individual medicines
    formData.medicines.forEach((med, index) => {
      const medValidation = validateMedicine(med);
      if (!medValidation.isValid) {
        setError(`medicine-${index}`, medValidation.error || 'Invalid medicine');
        medicinesValid = false;
      } else {
        clearError(`medicine-${index}`);
      }
    });

    if (!hospitalValid || !phoneValid || !nameValid || !ageValid || !medicinesValid) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      if (editMode && editPrescriptionId) {
        // Update existing prescription
        const patientResponse = await patientAPI.createOrUpdate({
          phone: formData.patientPhone,
          name: formData.patientName,
          age: parseInt(formData.patientAge),
          gender: formData.patientGender,
        });

        await prescriptionAPI.update(editPrescriptionId, {
          hospitalId: formData.hospitalId,
          patientId: patientResponse.data._id,
          chiefComplaint: formData.chiefComplaint,
          historyOfPresentIllness: formData.historyOfPresentIllness,
          previousLabReports: formData.previousLabReports,
          physicalExamination: formData.physicalExamination,
          vitalSigns: formData.vitalSigns,
          diagnosis: formData.diagnosis,
          medicines: formData.medicines.map(({ id, ...rest }) => rest),
          advice: formData.advice.map((a) => a.text),
          tests: formData.tests.map((t) => t.text),
          nextVisitDuration: formData.nextVisitDuration,
          language: formData.language,
        });
        toast.success('Prescription updated successfully!');
      } else {
        // Create new prescription
        await createPrescription();
        toast.success('Prescription created successfully!');
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(`Error ${editMode ? 'updating' : 'creating'} prescription: ` + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const prescription = await createPrescription();
      const pdfBlob = await prescriptionAPI.downloadPDF(prescription._id);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescription.prescriptionNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      toast.error('Error downloading PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPrint = async () => {
    setLoading(true);
    try {
      const prescription = await createPrescription();
      router.push(`/prescriptions/${prescription._id}?print=true`);
    } catch (error: any) {
      toast.error('Error creating prescription: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const dosePresets = ['1+1+1', '1+0+1', '0+1+0', '1+0+0', '0+0+1', 'SOS'];
  const commonAdvice = [
    'Take after meal',
    'Drink plenty of water',
    'Avoid oily food',
    'Rest properly',
    'Complete the course',
  ];

  const isEnabled = (section: string) => {
    return featureSettings?.enabledSections?.[section] !== false;
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col overflow-hidden">
        {/* Top Controls */}
        <div className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100 flex-shrink-0">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
             {/* Hospital Selector - MD3 Filled Input Style */}
            <div className="relative group min-w-[250px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">🏥</span>
              </div>
              <select
                value={formData.hospitalId}
                onChange={(e) => {
                  setFormData({ ...formData, hospitalId: e.target.value });
                  if (errors.hospitalId) validateField('hospitalId', () => validateSelection(e.target.value, 'Hospital'));
                }}
                className={`block w-full pl-10 pr-10 py-2.5 bg-gray-100 border-none rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer hover:bg-gray-200 ${errors.hospitalId ? 'ring-2 ring-red-500' : ''}`}
              >
                <option value="">Select Hospital...</option>
                {hospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name} {hospital.isDefault && '(Default)'}
                  </option>
                ))}
              </select>
              <FormError error={errors.hospitalId} />
            </div>

            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-200 transition-all"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 max-w-[1920px] mx-auto w-full overflow-hidden flex flex-col relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          
          {/* LEFT PANEL - Patient (Fixed) & Clinical Info (Scrollable) */}
          <div className="lg:col-span-4 h-full flex flex-col border-r border-gray-200 bg-gray-50/30">
            {/* Patient Information - Fixed at Top */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100 bg-white z-10">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">👤</span>
                  Patient Info
                </h2>
                
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <input
                      type="tel"
                      required
                      value={formData.patientPhone}
                      onChange={(e) => {
                        handlePhoneChange(e.target.value);
                        if (errors.patientPhone) validateField('patientPhone', () => validatePhone(e.target.value));
                      }}
                      className={`w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${errors.patientPhone ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="Phone"
                    />
                    <FormError error={errors.patientPhone} />
                  </div>

                  <div className="col-span-8">
                    <input
                      type="text"
                      required
                      value={formData.patientName}
                      onChange={(e) => {
                        setFormData({ ...formData, patientName: e.target.value });
                        if (errors.patientName) validateField('patientName', () => validateName(e.target.value));
                      }}
                      className={`w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${errors.patientName ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="Patient Name"
                    />
                    <FormError error={errors.patientName} />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) => {
                        setFormData({ ...formData, patientAge: e.target.value });
                        if (errors.patientAge) validateField('patientAge', () => validateAge(e.target.value));
                      }}
                      className={`w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${errors.patientAge ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="Age"
                    />
                    <FormError error={errors.patientAge} />
                  </div>
                  <div className="col-span-4">
                    <select
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                   <div className="col-span-5">
                    {showHistory && (
                      <button
                        type="button"
                        onClick={() => {/* TODO: Open History Modal */}}
                        className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>🕒</span> History
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Details Header - Fixed */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 z-10">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs">🩺</span>
                Clinical Details
              </h2>
            </div>

            {/* Clinical Details Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 custom-scrollbar bg-white">
              <div className="space-y-4 pb-20"> {/* Added pb-20 for footer clearance */}

                {isEnabled('chiefComplaint') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Chief Complaint</label>
                    <textarea
                      value={formData.chiefComplaint}
                      onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none text-sm"
                      rows={2}
                      placeholder="e.g. Fever..."
                    />
                  </div>
                )}

                {isEnabled('diagnosis') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Diagnosis</label>
                    <input
                      type="text"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
                      placeholder="e.g. Viral Fever"
                    />
                  </div>
                )}

                {isEnabled('vitalSigns') && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500 ml-1">Vital Signs</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.vitalSigns.bloodPressure}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, bloodPressure: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="BP"
                      />
                      <input
                        type="text"
                        value={formData.vitalSigns.pulse}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, pulse: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Pulse"
                      />
                      <input
                        type="text"
                        value={formData.vitalSigns.temperature}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, temperature: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Temp"
                      />
                      <input
                        type="text"
                        value={formData.vitalSigns.weight}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, weight: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Weight"
                      />
                    </div>
                  </div>
                )}
                
                {isEnabled('historyOfPresentIllness') && (
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">History</label>
                     <textarea
                       value={formData.historyOfPresentIllness}
                       onChange={(e) => setFormData({ ...formData, historyOfPresentIllness: e.target.value })}
                       className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                       rows={2}
                       placeholder="History..."
                     />
                  </div>
                )}

                {/* Tests Section */}
                {isEnabled('tests') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Lab Tests</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={currentTest}
                        onChange={(e) => setCurrentTest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTest())}
                        className="flex-1 px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Add test..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTest}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {formData.tests.map((test, index) => (
                        <div key={test.id} className="flex items-center justify-between px-3 py-2 bg-purple-50 rounded-lg group hover:bg-purple-100 transition-colors">
                          <span className="text-sm text-purple-900 font-medium">{test.text}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, tests: formData.tests.filter((_, i) => i !== index) })}
                            className="text-purple-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advice Section */}
                {isEnabled('advice') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Advice</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={currentAdvice}
                        onChange={(e) => setCurrentAdvice(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAdvice())}
                        className="flex-1 px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Add advice..."
                      />
                      <button
                        type="button"
                        onClick={handleAddAdvice}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {formData.advice.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-yellow-50 rounded-lg group hover:bg-yellow-100 transition-colors border border-yellow-100">
                          <span className="text-sm text-yellow-900 font-medium">{item.text}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, advice: formData.advice.filter((_, i) => i !== index) })}
                            className="text-yellow-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Medicine List */}
          <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-gray-50/50">
            <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 pb-32">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                {/* Fixed Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-sm">💊</span>
                    Medicines
                  </h2>
                  <div className="text-sm text-gray-500">
                    {formData.medicines.length} items
                  </div>
                </div>

                {/* Fixed Search Area */}
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 z-10">
                  <MedicineSearch onSelect={handleAddMedicine} />
                </div>

                {/* Scrollable Medicine List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-20"> {/* Added pb-20 */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndMedicines}
                  >
                    <SortableContext
                      items={formData.medicines.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {errors.medicines && (
                        <div className="mb-4 px-4">
                          <FormError error={errors.medicines} />
                        </div>
                      )}
                      
                      {formData.medicines.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                          <span className="text-4xl mb-3 opacity-50">💊</span>
                          <p>No medicines added yet.</p>
                          <p className="text-sm">Search above to add medicines.</p>
                        </div>
                      ) : (
                        formData.medicines.map((medicine, index) => (
                          <SortableMedicineItem
                            key={medicine.id}
                            medicine={medicine}
                            index={index}
                            onUpdate={handleMedicineChange}
                            onRemove={handleRemoveMedicine}
                            dosePresets={dosePresets}
                            error={errors[`medicine-${index}`]}
                          />
                        ))
                      )}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-2xl z-40">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Next Visit Input (Centered) */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <span className="text-sm font-medium text-gray-600">Next Visit:</span>
              <div className="relative">
                <input
                  type="number"
                  value={formData.nextVisitDuration}
                  onChange={(e) => setFormData({ ...formData, nextVisitDuration: e.target.value })}
                  className="w-24 pl-3 pr-8 py-2 bg-gray-100 border-none rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">Days</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePreview}
                className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
              >
                👁️ Preview
              </button>
              <button
                type="button"
                onClick={handleSaveAndPrint}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? '...' : '🖨️ Save & Print'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? '...' : editMode ? '💾 Update' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Prescription Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
              <PrescriptionView
                mode="preview"
                hospital={hospitals.find((h) => h._id === formData.hospitalId)}
                prescription={{
                  patient: {
                    name: formData.patientName,
                    age: formData.patientAge,
                    gender: formData.patientGender,
                  },
                  medicines: formData.medicines,
                  tests: formData.tests.map((t) => t.text),
                  advice: formData.advice.map((a) => a.text),
                  diagnosis: formData.diagnosis,
                  chiefComplaint: formData.chiefComplaint,
                  vitalSigns: formData.vitalSigns,
                  nextVisitDuration: formData.nextVisitDuration,
                }}
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  );
}

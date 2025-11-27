import React, { useState, useEffect } from 'react';

import { toast } from 'react-hot-toast';
import { doctorProfileAPI, uploadAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import FormError from './FormError';
import { useFormValidation } from '@/lib/useFormValidation';
import { validateRequired, validatePhone } from '@/lib/validation';
import ImageCropper from './ImageCropper';
import getCroppedImg from '@/lib/cropImage';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

interface DoctorProfileFormProps {
  onSave?: () => void;
  initialData?: any;
}

export default function DoctorProfileForm({ onSave, initialData }: DoctorProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Image Cropping State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    nameBangla: '',
    degrees: [] as string[],
    degreesBangla: [] as string[],
    specialization: '',
    bmdcNumber: '',
    phone: user?.phone || '',
    email: user?.email || '',
    signature: '',
    avatar: '',
    profileImage: '',
    lifeHistory: '',
    address: '',
    chamber: '',
    experience: 0,
    hospitalAffiliations: [] as string[],
    socialLinks: {
      facebook: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
  });

  const { errors, validateField, setError, clearError, hasErrors } = useFormValidation();

  useEffect(() => {
    if (initialData) {
      setProfile({ ...profile, ...initialData });
    } else {
      loadProfile();
    }
  }, [user, initialData]);

  const loadProfile = async () => {
    try {
      const res = await doctorProfileAPI.get();
      if (res.data) {
        setProfile((prev) => ({
          ...prev,
          ...res.data,
          socialLinks: {
            ...prev.socialLinks,
            ...(res.data.socialLinks || {}),
          },
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc!, croppedAreaPixels!);
      const file = new File([croppedImageBlob], 'profile.jpg', { type: 'image/jpeg' });
      
      // Upload to S3/MinIO
      const res = await uploadAPI.upload(file);
      setProfile({ ...profile, profileImage: res.data.url });
      setShowCropper(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload image');
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile({ ...profile, signature: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDegreeChange = (index: number, value: string, lang: 'en' | 'bn') => {
    const field = lang === 'en' ? 'degrees' : 'degreesBangla';
    const newDegrees = [...profile[field]];
    newDegrees[index] = value;
    setProfile({ ...profile, [field]: newDegrees });
  };

  const addDegree = (lang: 'en' | 'bn') => {
    const field = lang === 'en' ? 'degrees' : 'degreesBangla';
    setProfile({ ...profile, [field]: [...profile[field], ''] });
  };

  const removeDegree = (index: number, lang: 'en' | 'bn') => {
    const field = lang === 'en' ? 'degrees' : 'degreesBangla';
    const newDegrees = profile[field].filter((_, i) => i !== index);
    setProfile({ ...profile, [field]: newDegrees });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValid = validateField('name', () => validateRequired(profile.name, 'Name'));
    const phoneValid = validateField('phone', () => validatePhone(profile.phone));
    
    if (!nameValid || !phoneValid) return;

    setLoading(true);
    try {
      await doctorProfileAPI.createOrUpdate(profile);
      if (onSave) onSave();
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'professional', label: 'Professional' },
    { id: 'biography', label: 'Biography' },
    { id: 'contact', label: 'Contact & Social' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      👤
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                  📷
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                </label>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{profile.name || 'Your Name'}</h3>
                <p className="text-gray-500">{profile.specialization || 'Specialization'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                <FormError error={errors.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Bangla)</label>
                <input
                  type="text"
                  value={profile.nameBangla}
                  onChange={(e) => setProfile({ ...profile, nameBangla: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="বাংলায় নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                <FormError error={errors.phone} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={profile.specialization}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BMDC Reg. No.</label>
                <input
                  type="text"
                  value={profile.bmdcNumber}
                  onChange={(e) => setProfile({ ...profile, bmdcNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Degrees (English)</label>
                {profile.degrees.map((degree, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => handleDegreeChange(index, e.target.value, 'en')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button type="button" onClick={() => removeDegree(index, 'en')} className="text-red-500 px-2">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => addDegree('en')} className="text-blue-600 text-sm font-medium">+ Add Degree</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Degrees (Bangla)</label>
                {profile.degreesBangla.map((degree, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => handleDegreeChange(index, e.target.value, 'bn')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button type="button" onClick={() => removeDegree(index, 'bn')} className="text-red-500 px-2">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => addDegree('bn')} className="text-blue-600 text-sm font-medium">+ Add Degree</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Digital Signature</label>
              <div className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <input type="file" accept="image/*" onChange={handleSignatureUpload} className="text-sm text-gray-500" />
                {profile.signature && <img src={profile.signature} alt="Signature" className="h-12 object-contain" />}
              </div>
            </div>
          </div>
        )}

        {/* Biography Tab */}
        {activeTab === 'biography' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Life History & Achievements</label>
              <RichTextEditor
                value={profile.lifeHistory}
                onChange={(content) => setProfile({ ...profile, lifeHistory: content })}
                height={400}
              />
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chamber Details</label>
              <textarea
                value={profile.chamber}
                onChange={(e) => setProfile({ ...profile, chamber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 pt-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input
                  type="text"
                  value={profile.socialLinks.facebook}
                  onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, facebook: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={profile.socialLinks.linkedin}
                  onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="text"
                  value={profile.socialLinks.twitter}
                  onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, twitter: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={profile.socialLinks.website}
                  onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, website: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {showCropper && imageSrc && (
        <ImageCropper
          imageSrc={imageSrc}
          onCropComplete={setCroppedAreaPixels}
          onCancel={() => {
            setShowCropper(false);
            setImageSrc(null);
          }}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Avatar, Divider, Chip, MenuItem, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { Card } from '@/components/UI/Card';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningIcon from '@mui/icons-material/Warning';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    allergies: [] as string[],
    chronicDiseases: [] as string[],
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        bloodGroup: (user as any).bloodGroup || '',
        allergies: (user as any).allergies || [],
        chronicDiseases: (user as any).chronicDiseases || [],
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const handleAddCondition = () => {
    if (newCondition.trim() && !formData.chronicDiseases.includes(newCondition.trim())) {
      setFormData(prev => ({
        ...prev,
        chronicDiseases: [...prev.chronicDiseases, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.filter(c => c !== condition)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      };
      const response = await authAPI.updateProfile(dataToSave);
      
      // Update auth context for immediate state sync
      updateUser(response.data);
      
      toast.success('Profile updated successfully!');
      
      // Attempt to refresh user data in context (if there was a dedicated getProfile)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your personal and health information
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Logout
          </Button>
        </Box>

        {/* Profile Details */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Left Column: Photo & Basic */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: 40,
                  }}
                >
                  {(formData.name || 'P').charAt(0)}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {formData.name || 'Patient'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.phone || 'No phone number'}
                </Typography>
              </Box>
            </Card>

            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Button variant="outlined" fullWidth color="error" startIcon={<LogoutIcon />} onClick={logout} sx={{ justifyContent: 'flex-start' }}>
                Logout from this device
              </Button>
            </Card>
          </Box>

          {/* Right Column: Detailed Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Personal Information
              </Typography>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  disabled // Phone is usually fixed as ID
                  fullWidth
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Health Information
              </Typography>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <TextField
                  select
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  fullWidth
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                    <MenuItem key={group} value={group}>{group}</MenuItem>
                  ))}
                </TextField>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" fontSize="small" /> Allergies
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formData.allergies.map(allergy => (
                      <Chip
                        key={allergy}
                        label={allergy}
                        onDelete={() => handleRemoveAllergy(allergy)}
                        size="small"
                      />
                    ))}
                    {formData.allergies.length === 0 && (
                      <Typography variant="body2" color="text.secondary">None listed</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add allergy"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                      fullWidth
                    />
                    <Button variant="outlined" size="small" onClick={handleAddAllergy}>Add</Button>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospitalIcon color="error" fontSize="small" /> Chronic Conditions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formData.chronicDiseases.map(condition => (
                      <Chip
                        key={condition}
                        label={condition}
                        onDelete={() => handleRemoveCondition(condition)}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    ))}
                    {formData.chronicDiseases.length === 0 && (
                      <Typography variant="body2" color="text.secondary">None listed</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add condition"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCondition()}
                      fullWidth
                    />
                    <Button variant="outlined" size="small" onClick={handleAddCondition}>Add</Button>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Save Button */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outlined" fullWidth size="large" onClick={() => router.back()}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
      <MobileBottomNav />
    </Box>
  );
}

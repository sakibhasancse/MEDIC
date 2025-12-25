'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card as MuiCard,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { useRouter } from '@/lib/navigation';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { Card } from '@/components/UI/Card';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { appointmentAPI, clinicAPI } from '@/lib/api';
import { syncService } from '@/lib/syncService';
import { toast } from 'react-hot-toast';

const steps = ['Select Clinic', 'Choose Doctor', 'Visit Type', 'Date & Time', 'Confirm'];

const mockTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [visitType, setVisitType] = useState<'online' | 'physical'>('physical');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate real dates for the next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  useEffect(() => {
    if (activeStep === 0) {
      loadClinics();
    }
  }, [activeStep]);

  useEffect(() => {
    if (activeStep === 1 && selectedClinic) {
      const clinic = clinics.find(c => c._id === selectedClinic);
      if (clinic?.doctorId) {
        loadDoctors(clinic.doctorId);
      }
    }
  }, [activeStep, selectedClinic]);

  const loadClinics = async () => {
    setLoading(true);
    try {
      const response = await clinicAPI.getAll();
      setClinics(response.data);
    } catch (error) {
      console.error('Failed to load clinics', error);
      toast.error('Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async (doctorId: string) => {
    setLoading(true);
    try {
      const response = await clinicAPI.getDoctors(doctorId);
      setDoctors(response.data);
      // Auto-select if only one doctor
      if (response.data.length === 1) {
        setSelectedDoctor(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load doctors', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const bookingData = {
      clinicId: selectedClinic,
      doctorId: doctors.find(d => d._id === selectedDoctor)?.userId || selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      visitType,
    };

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await syncService.addToQueue('appointment', 'create', bookingData, Date.now().toString());
        toast.success('Offline mode: Booking saved and will sync when online.');
      } else {
        await appointmentAPI.book(bookingData);
        toast.success('Appointment booked successfully!');
      }
      router.push('/appointments');
    } catch (error) {
      console.error(error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = () => {
    switch (activeStep) {
      case 0: return !!selectedClinic;
      case 1: return !!selectedDoctor;
      case 2: return !!visitType;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return true;
      default: return false;
    }
  };

  const getSelectedClinicData = () => clinics.find(c => c._id === selectedClinic);
  const getSelectedDoctorData = () => doctors.find(d => d._id === selectedDoctor);

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Book Appointment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule a visit with your doctor
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {/* Step 1: Select Clinic */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Select a Clinic
              </Typography>
              <Grid container spacing={2}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Grid size={12} key={i}>
                      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))
                ) : (
                  clinics.map((clinic) => (
                    <Grid size={12} key={clinic._id}>
                      <Card
                        interactive
                        onClick={() => setSelectedClinic(clinic._id)}
                        sx={{
                          border: selectedClinic === clinic._id ? '2px solid' : '1px solid',
                          borderColor: selectedClinic === clinic._id ? 'primary.main' : 'divider',
                        }}
                      >
                        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2,
                              bgcolor: 'primary.light',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                            }}
                          >
                            <LocalHospitalIcon />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {clinic.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {clinic.address}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label="Clinic" size="small" />
                              <Chip label={clinic.phone} size="small" variant="outlined" />
                            </Box>
                          </Box>
                          {selectedClinic === clinic._id && (
                            <CheckCircleIcon color="primary" sx={{ fontSize: 32 }} />
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          )}

          {/* Step 2: Choose Doctor */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Choose a Doctor
              </Typography>
              <Grid container spacing={2}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Grid size={12} key={i}>
                      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))
                ) : (
                  doctors.map((doctor) => (
                    <Grid size={12} key={doctor._id}>
                      <Card
                        interactive
                        onClick={() => setSelectedDoctor(doctor._id)}
                        sx={{
                          border: selectedDoctor === doctor._id ? '2px solid' : '1px solid',
                          borderColor: selectedDoctor === doctor._id ? 'primary.main' : 'divider',
                        }}
                      >
                        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                            {doctor.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {doctor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {doctor.specialization}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={`${doctor.experience} experience`} size="small" />
                              {doctor.fee && (
                                <Chip label={`Fee: ৳${doctor.fee}`} size="small" color="primary" variant="outlined" />
                              )}
                            </Box>
                          </Box>
                          {selectedDoctor === doctor._id && (
                            <CheckCircleIcon color="primary" sx={{ fontSize: 32 }} />
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          )}

          {/* Step 3: Visit Type */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Select Visit Type
              </Typography>
              <RadioGroup value={visitType} onChange={(e) => setVisitType(e.target.value as any)}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card
                      interactive
                      onClick={() => setVisitType('physical')}
                      sx={{
                        border: visitType === 'physical' ? '2px solid' : '1px solid',
                        borderColor: visitType === 'physical' ? 'primary.main' : 'divider',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <LocationOnIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Physical Visit
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Visit the clinic in person
                        </Typography>
                        <FormControlLabel
                          value="physical"
                          control={<Radio />}
                          label=""
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card
                      interactive
                      onClick={() => setVisitType('online')}
                      sx={{
                        border: visitType === 'online' ? '2px solid' : '1px solid',
                        borderColor: visitType === 'online' ? 'success.main' : 'divider',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <VideocamIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Online Consultation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Video call with doctor
                        </Typography>
                        <FormControlLabel
                          value="online"
                          control={<Radio />}
                          label=""
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Box>
          )}

          {/* Step 4: Date & Time */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Select Date & Time
              </Typography>
              
              {/* Date Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Choose Date
                </Typography>
                <Grid container spacing={1}>
                  {availableDates.map((date) => (
                    <Grid size={{ xs: 4, sm: 2 }} key={date}>
                      <Button
                        fullWidth
                        variant={selectedDate === date ? 'contained' : 'outlined'}
                        onClick={() => setSelectedDate(date)}
                        sx={{ py: 1.5 }}
                      >
                        {date}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Time Selection */}
              {selectedDate && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Available Time Slots
                  </Typography>
                  <Grid container spacing={1}>
                    {mockTimeSlots.map((time) => (
                      <Grid size={{ xs: 6, sm: 4 }} key={time}>
                        <Button
                          fullWidth
                          variant={selectedTime === time ? 'contained' : 'outlined'}
                          onClick={() => setSelectedTime(time)}
                          sx={{ py: 1.5 }}
                        >
                          {time}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}

          {/* Step 5: Confirmation */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Confirm Appointment
              </Typography>
              <Card>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Clinic
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {getSelectedClinicData()?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getSelectedClinicData()?.address}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Doctor
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {getSelectedDoctorData()?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getSelectedDoctorData()?.specialization}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Visit Type
                    </Typography>
                    <Chip
                      label={visitType === 'online' ? 'Online Consultation' : 'Physical Visit'}
                      color={visitType === 'online' ? 'success' : 'primary'}
                      icon={visitType === 'online' ? <VideocamIcon /> : <LocationOnIcon />}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date & Time
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip icon={<CalendarMonthIcon />} label={selectedDate} />
                      <Chip icon={<AccessTimeIcon />} label={selectedTime} />
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          )}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            fullWidth
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleConfirm}
              fullWidth
              disabled={!isStepComplete() || isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              fullWidth
              disabled={!isStepComplete()}
            >
              Continue
            </Button>
          )}
        </Box>
      </Container>

      <MobileBottomNav />
    </Box>
  );
}

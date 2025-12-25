'use client';

import { Box, Container, Typography, Button, Divider, Chip, IconButton } from '@mui/material';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { Card } from '@/components/UI/Card';
import { StatusChip } from '@/components/UI/StatusChip';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import MedicationIcon from '@mui/icons-material/Medication';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import { useState, useEffect } from 'react';
import { prescriptionAPI } from '@/lib/api';
import { CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';

export default function PrescriptionViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRequestingRefill, setIsRequestingRefill] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await prescriptionAPI.getById(params.id);
        setPrescription(response.data);
      } catch (error) {
        console.error('Failed to fetch prescription:', error);
        toast.error('Failed to load prescription');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await prescriptionAPI.downloadPDF(params.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${params.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleRequestRefill = async () => {
    if (!prescription) return;
    setIsRequestingRefill(true);
    try {
      const medicines = prescription.medicines.map((m: any) => m.name);
      await prescriptionAPI.requestRefill(params.id, medicines);
      toast.success('Refill request sent successfully!');
    } catch (error) {
      console.error('Refill request failed:', error);
      toast.error('Failed to send refill request');
    } finally {
      setIsRequestingRefill(false);
    }
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !prescription ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Prescription not found
            </Typography>
            <Button onClick={() => router.back()} sx={{ mt: 2 }}>
              Go Back
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Prescription Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  RX-{prescription._id?.slice(-8).toUpperCase() || 'UNKNOWN'}
                </Typography>
              </Box>
              <StatusChip status="synced" />
            </Box>

            {/* Doctor & Clinic Info */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Prescribed by
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {prescription.doctorId?.name || 'Doctor'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {prescription.doctorId?.specialization || 'General Physician'}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {prescription.clinicId?.name || 'Clinic'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {prescription.clinicId?.address || 'Physical Address'}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  Date: {new Date(prescription.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Card>

            {/* Patient Info */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Patient Information
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {prescription.patientId?.name || 'Patient'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age: 32 • Gender: Male
                </Typography>
              </Box>
            </Card>

            {/* Diagnosis */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Diagnosis
                </Typography>
                <Typography variant="body1">
                  {prescription.diagnosis || 'No diagnosis provided'}
                </Typography>
              </Box>
            </Card>

            {/* Medicines */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MedicationIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Prescribed Medicines
                  </Typography>
                </Box>
                {(prescription.medicines || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No medicines prescribed.</Typography>
                ) : (
                  prescription.medicines.map((medicine: any, index: number) => (
                    <Box key={index}>
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {medicine.genericName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1 }}>
                          <Chip label={`Dose: ${medicine.dose}`} size="small" color="primary" variant="outlined" />
                          <Chip label={`Duration: ${medicine.duration}`} size="small" variant="outlined" />
                        </Box>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                          {medicine.instructions}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Card>

            {/* Advice */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Advice
                  </Typography>
                </Box>
                {(prescription.advice || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No specific advice provided.</Typography>
                ) : (
                  prescription.advice.map((item: string, index: number) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="body2">•</Typography>
                      <Typography variant="body2">{item}</Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Card>

            {/* Tests */}
            {(prescription.tests || []).length > 0 && (
              <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ScienceIcon color="warning" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recommended Tests
                    </Typography>
                  </Box>
                  {prescription.tests.map((test: string, index: number) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="body2">•</Typography>
                      <Typography variant="body2">{test}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}

            {/* QR Code */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <QrCode2Icon sx={{ fontSize: 80, color: 'text.secondary', mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Scan to verify authenticity
                </Typography>
              </Box>
            </Card>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />} 
                fullWidth 
                sx={{ flex: 1, minWidth: 140 }}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />} 
                fullWidth 
                sx={{ flex: 1, minWidth: 140 }}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ShareIcon />} 
                fullWidth 
                sx={{ flex: 1, minWidth: 140 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Prescription',
                      text: `Prescription from ${prescription.clinicId?.name}`,
                      url: window.location.href,
                    });
                  } else {
                    toast.error('Sharing not supported on this browser');
                  }
                }}
              >
                Share
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<RefreshIcon />} 
                fullWidth 
                sx={{ flex: 1, minWidth: 140 }}
                onClick={handleRequestRefill}
                disabled={isRequestingRefill}
              >
                {isRequestingRefill ? <CircularProgress size={20} /> : 'Request Refill'}
              </Button>
            </Box>
          </>
        )}
      </Container>
      <MobileBottomNav />
    </Box>
  );
}

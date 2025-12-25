'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Fab,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  CalendarToday as DateIcon,
  Person as DoctorIcon,
  Business as ClinicIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { medicalRecordsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface MedicalRecord {
  _id: string;
  title: string;
  recordType: 'prescription' | 'report' | 'other';
  fileUrl: string;
  doctorName?: string;
  clinicName?: string;
  date: string;
  notes?: string;
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    recordType: 'prescription',
    doctorName: '',
    clinicName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const fetchRecords = async () => {
    try {
      const response = await medicalRecordsAPI.getAll();
      setRecords(response.data);
    } catch (error) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUploadClick = () => setOpenUpload(true);
  const handleCloseUpload = () => {
    setOpenUpload(false);
    setFile(null);
    setFormData({
      title: '',
      recordType: 'prescription',
      doctorName: '',
      clinicName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploadLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('recordType', formData.recordType);
    data.append('doctorName', formData.doctorName);
    data.append('clinicName', formData.clinicName);
    data.append('date', formData.date);
    data.append('notes', formData.notes);

    try {
      await medicalRecordsAPI.upload(data);
      toast.success('Record uploaded successfully');
      handleCloseUpload();
      fetchRecords();
    } catch (error) {
      toast.error('Failed to upload record');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await medicalRecordsAPI.delete(id);
      toast.success('Record deleted');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const getRecordTypeChip = (type: string) => {
    const colors: Record<string, "primary" | "secondary" | "default" | "error" | "info" | "success" | "warning"> = {
      prescription: 'primary',
      report: 'secondary',
      other: 'default',
    };
    return <Chip label={type.toUpperCase()} size="small" color={colors[type] || 'default'} />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Medical Records
        </Typography>
        <Fab color="primary" variant="extended" onClick={handleUploadClick}>
          <AddIcon sx={{ mr: 1 }} />
          Upload New
        </Fab>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : records.length === 0 ? (
        <Box textAlign="center" py={10} bgcolor="background.paper" borderRadius={4} border="1px dashed" borderColor="divider">
          <FileIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No medical records found
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Upload your old prescriptions, test reports, and other medical documents.
          </Typography>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={handleUploadClick}>
            Upload your first record
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {records.map((record) => (
            <Grid item xs={12} sm={6} md={4} key={record._id}>
              <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    {getRecordTypeChip(record.recordType)}
                    <IconButton size="small" color="error" onClick={() => handleDelete(record._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                    {record.title}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                    <DateIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  {record.doctorName && (
                    <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                      <DoctorIcon sx={{ fontSize: 18, mr: 1 }} />
                      <Typography variant="body2" noWrap>
                        {record.doctorName}
                      </Typography>
                    </Box>
                  )}

                  {record.clinicName && (
                    <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                      <ClinicIcon sx={{ fontSize: 18, mr: 1 }} />
                      <Typography variant="body2" noWrap>
                        {record.clinicName}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    href={record.fileUrl}
                    target="_blank"
                    sx={{ mt: 'auto', borderRadius: 2 }}
                  >
                    View Document
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={openUpload} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Upload Medical Record</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Blood Test Report, Heart Clinic Prescription"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Record Type"
                  name="recordType"
                  value={formData.recordType}
                  onChange={handleInputChange}
                  variant="outlined"
                >
                  <MenuItem value="prescription">Prescription</MenuItem>
                  <MenuItem value="report">Test Report</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.date}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Doctor Name"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Clinic/Hospital Name"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{ py: 2, borderStyle: 'dashed' }}
                >
                  {file ? file.name : 'Choose File (PDF or Image)'}
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseUpload}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploadLoading}
              startIcon={uploadLoading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploadLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

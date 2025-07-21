import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PatientContract from '../../abis/PatientContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import { uploadFile } from '../../services/uploadFile';
import DoctorContract from '../../abis/DoctorContract.json';
import EHRSystem from '../../abis/EHRSystem.json';
import DiagnosticContract from '../../abis/DiagnosticContract.json';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar, TextField, Select, MenuItem, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider, Pagination
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SearchIcon from '@mui/icons-material/Search';
import Fade from '@mui/material/Fade';
import Collapse from '@mui/material/Collapse';
import GroupIcon from '@mui/icons-material/Group';
import { useTheme } from '../../contexts/ThemeContext';
import StatCard from '../../components/StatCard';
import ProfileForm from '../../components/ProfileForm';
import SnackbarAlert from '../../components/SnackbarAlert';
import SearchBar from '../../components/SearchBar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';

const ActivityCard = ({ activity }) => {
  const { theme } = useTheme();
  return (
    <Card elevation={2} sx={{ mb: 2, borderRadius: 2, background: theme === 'dark' ? '#223a5f' : undefined, color: theme === 'dark' ? '#fff' : 'inherit' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <NotificationsActiveIcon color="primary" />
        <Box>
          <Typography variant="body1">{activity}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [ipfsFile, setIpfsFile] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [provider, setProvider] = useState('pinata');
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [consultancyReports, setConsultancyReports] = useState([]);
  const [diagnosticReports, setDiagnosticReports] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [doctorDetailsMap, setDoctorDetailsMap] = useState({});
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  // Add state for pagination
  const [recordsPage, setRecordsPage] = useState(1);
  const [consultancyPage, setConsultancyPage] = useState(1);
  const [diagnosticPage, setDiagnosticPage] = useState(1);
  const recordsPerPage = 5;
  // Filter states
  const [recordFilter, setRecordFilter] = useState('');
  const [consultancyFilter, setConsultancyFilter] = useState('');
  const [diagnosticFilter, setDiagnosticFilter] = useState('');

  const user = JSON.parse(localStorage.getItem('ehr_user'));
  const { theme } = useTheme();

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      window.location.href = '/login/patient';
      return;
    }
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts[0].toLowerCase() !== user.wallet.toLowerCase()) {
        setTxStatus('Connected wallet does not match patient account. Please switch MetaMask account.');
      } else {
        loadData();
        loadDoctors();
      }
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'patient') return;
    if (!permissions.length) return;
    fetchConsultancyReports();
    fetchDiagnosticReports();
    // eslint-disable-next-line
  }, [permissions]);

  const loadData = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractWithSigner = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const p = await contractWithSigner.patients(user.wallet);
      setProfile(p);
      setForm({
        name: p.name,
        bloodGroup: p.bloodGroup,
        homeAddress: p.homeAddress,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        email: p.email
      });
      const recs = await contractWithSigner.getMedicalRecords(user.wallet);
      setRecords(recs);
      const perms = await contractWithSigner.getPermissions(user.wallet);
      setPermissions(perms);
    } catch (err) {
      if (err.message && err.message.includes('Not authorized')) {
        setTxStatus('You are not authorized to view these records.');
      } else {
        setTxStatus('Error loading data: ' + err.message);
      }
    }
    setLoading(false);
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setTxStatus('');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const tx = await contract.updateProfile(
        form.name,
        form.bloodGroup,
        form.homeAddress,
        form.dateOfBirth,
        form.gender,
        form.email
      );
      setTxStatus('Profile update sent. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Profile updated!');
      setEditMode(false);
      loadData();
    } catch (err) {
      setTxStatus('Profile update failed: ' + err.message);
    }
  };

  const handleFileChange = e => setIpfsFile(e.target.files[0]);

  const handleUpload = async () => {
    setTxStatus('');
    if (!ipfsFile || !recordType) {
      setTxStatus('Select a file and record type.');
      return;
    }
    try {
      setTxStatus(`Uploading file to ${provider === 'pinata' ? 'Pinata' : 'IPFS'}...`);
      const hash = await uploadFile(ipfsFile, provider);
      setTxStatus(`File uploaded to ${provider === 'pinata' ? 'Pinata' : 'IPFS'}. Storing on blockchain...`);
      const providerEth = new ethers.providers.Web3Provider(window.ethereum);
      const signer = providerEth.getSigner();
      const contract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const tx = await contract.uploadMedicalRecord(hash, recordType);
      setTxStatus('Record upload sent. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Record uploaded!');
      setIpfsFile(null);
      setRecordType('');
      loadData();
    } catch (err) {
      setTxStatus('Record upload failed: ' + err.message);
    }
  };

  const handleGrant = async () => {
    setTxStatus('');
    if (!selectedDoctor) {
      setTxStatus('Select a doctor.');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const tx = await contract.grantPermission(selectedDoctor);
      setTxStatus('Permission grant sent. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Permission granted!');
      setSelectedDoctor('');
      loadData();
    } catch (err) {
      setTxStatus('Permission grant failed: ' + err.message);
    }
  };

  const handleRevoke = async doctorAddr => {
    setTxStatus('');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const tx = await contract.revokePermission(doctorAddr);
      setTxStatus('Permission revoke sent. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Permission revoked!');
      loadData();
    } catch (err) {
      setTxStatus('Permission revoke failed: ' + err.message);
    }
  };

  const loadDoctors = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
      const doctorAddresses = await ehrSystem.getAllDoctors();
      const doctorDetails = await Promise.all(
        doctorAddresses.map(async (addr) => {
          const doc = await doctorContract.doctors(addr);
          if (doc.exists) {
            return {
              address: addr,
              name: doc.name,
              specialization: doc.specialization,
              hNumber: doc.hNumber
            };
          }
          return null;
        })
      );
      const detailsMap = {};
      doctorDetails.filter(Boolean).forEach(doc => {
        detailsMap[doc.address.toLowerCase()] = doc;
      });
      setDoctorDetailsMap(detailsMap);
      setDoctorList(doctorDetails.filter(Boolean));
    } catch (err) {
      // Optionally handle error
    }
  };

  const fetchConsultancyReports = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      
      // Get ALL doctors (not just active permissions) to check for any reports they may have created
      const allDoctors = await ehrSystem.getAllDoctors();
      
      const doctorDetails = await Promise.all(
        allDoctors.map(async (addr) => {
          try {
            const doc = await doctorContract.doctors(addr);
            return doc.exists ? { address: addr, name: doc.name, specialization: doc.specialization } : null;
          } catch {
            return null;
          }
        })
      );
      
      const reportsByDoctor = await Promise.all(
        allDoctors.map(async (addr, idx) => {
          try {
            // Try to get reports from each doctor for this patient
            // The contract function will only return reports if the doctor has/had access
            const reports = await doctorContract.getConsultancyReportsForPatientByDoctor(addr, user.wallet);
            return {
              doctor: doctorDetails[idx],
              reports: reports
            };
          } catch (err) {
            // If doctor doesn't have access, just return empty reports
            return { doctor: doctorDetails[idx], reports: [] };
          }
        })
      );
      
      setConsultancyReports(reportsByDoctor.filter(r => r.doctor && r.reports.length > 0));
    } catch (err) {
      console.log('Error fetching consultancy reports:', err.message);
    }
  };

  const fetchDiagnosticReports = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const diagnosticContract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);
      
      // Get diagnostic reports for this patient
      const reports = await diagnosticContract.getReportsForUser(user.wallet);
      
      // Get diagnostic center names for each report
      const reportsWithCenterNames = await Promise.all(
        reports.map(async (report) => {
          try {
            // Get the diagnostic center address from the report
            const diagnosticCenterAddress = await diagnosticContract.getDiagnosticCenterFromReport(report.reportId);
            const centerName = await diagnosticContract.getDiagnosticCenterName(diagnosticCenterAddress);
            return { ...report, centerName };
          } catch {
            return { ...report, centerName: 'Unknown Center' };
          }
        })
      );
      
      setDiagnosticReports(reportsWithCenterNames);
    } catch (err) {
      console.log('Error fetching diagnostic reports:', err.message);
    }
  };

  // Compose recent activity (example: uploads, grants, etc.)
  const recentActivity = [];
  if (records && records.length) recentActivity.push(`Uploaded ${records.length} medical record${records.length > 1 ? 's' : ''}.`);
  if (permissions && permissions.length) recentActivity.push(`Granted access to ${permissions.length} doctor${permissions.length > 1 ? 's' : ''}.`);
  if (consultancyReports && consultancyReports.length) recentActivity.push(`Received ${consultancyReports.length} consultancy report${consultancyReports.length > 1 ? 's' : ''}.`);
  if (diagnosticReports && diagnosticReports.length) recentActivity.push(`Received ${diagnosticReports.length} diagnostic report${diagnosticReports.length > 1 ? 's' : ''}.`);

  if (loading) return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress color="primary" />
    </Box>
  );

  // StatCard gradients
  const statGradients = {
    records: 'linear-gradient(120deg, #b6d0f6 0%, #ffffff 100%)',
    doctors: 'linear-gradient(120deg, #b2e9db 0%, #ffffff 100%)',
    diagnostics: 'linear-gradient(120deg, #eac8ff 0%, #ffffff 100%)',
  };

  // Group consultancy reports by doctor
  const groupedConsultancy = consultancyReports.reduce((acc, rep) => {
    const key = rep.doctor.name + rep.doctor.wallet;
    if (!acc[key]) acc[key] = { doctor: rep.doctor, reports: [] };
    acc[key].reports.push(rep.reports[0]);
    return acc;
  }, {});
  const consultancyGroups = Object.values(groupedConsultancy);
  // Group diagnostic reports by center
  const groupedDiagnostic = diagnosticReports.reduce((acc, rep) => {
    const key = rep.centerName || 'Unknown Center';
    if (!acc[key]) acc[key] = { center: rep.centerName, reports: [] };
    acc[key].reports.push(rep);
    return acc;
  }, {});
  const diagnosticGroups = Object.values(groupedDiagnostic);

  // Filtered data
  const filteredRecords = records.filter(rec => {
    if (!recordFilter) return true;
    const filter = recordFilter.toLowerCase();
    const typeMatch = rec.recordType && rec.recordType.toLowerCase().includes(filter);
    const dateMatch = rec.timestamp && new Date(Number(rec.timestamp) * 1000).toLocaleDateString().includes(filter);
    return typeMatch || dateMatch;
  });
  const filteredConsultancy = consultancyReports.filter(rep => {
    if (!consultancyFilter) return true;
    const filter = consultancyFilter.toLowerCase();
    const doctorMatch = rep.doctor.name && rep.doctor.name.toLowerCase().includes(filter);
    const dateMatch = rep.reports[0].timestamp && new Date(Number(rep.reports[0].timestamp) * 1000).toLocaleDateString().includes(filter);
    return doctorMatch || dateMatch;
  });
  const filteredDiagnostic = diagnosticReports.filter(rep => {
    if (!diagnosticFilter) return true;
    const filter = diagnosticFilter.toLowerCase();
    const typeMatch = rep.testType && rep.testType.toLowerCase().includes(filter);
    const dateMatch = rep.timestamp && new Date(Number(rep.timestamp) * 1000).toLocaleDateString().includes(filter);
    return typeMatch || dateMatch;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-bg)', background: theme === 'gradient' ? 'linear-gradient(140deg, #8bb6f9 0%, #6be7c1 50%, #e6b6ff 100%)' : 'none', py: 4, width: '100%', px: { xs: 1, md: 4 } }}>
      {/* Top Section: Profile | Stats & Activity (full width, separate cards) */}
      <Grid container spacing={4} alignItems="stretch" sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={6} sx={{ borderRadius: 4, p: 3, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #b6d0f6 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit', height: '100%', minWidth: 320, maxWidth: 420, mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'var(--color-primary)', mb: 1 }}>
                <PersonIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.name || 'Patient'}</Typography>
              <Chip icon={<AssignmentIndIcon sx={{ color: '#fff !important' }} />} label="Patient" sx={{ fontWeight: 600, bgcolor: '#1976d2', color: '#fff', '& .MuiChip-icon': { color: '#fff !important' } }} />
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>{profile?.email}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.bloodGroup && `Blood Group: ${profile.bloodGroup}`}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.dateOfBirth && `DOB: ${profile.dateOfBirth}`}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.gender && `Gender: ${profile.gender}`}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.homeAddress && `Address: ${profile.homeAddress}`}</Typography>
              <Typography variant="body2" color="text.secondary">{user.wallet}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card elevation={6} sx={{ borderRadius: 4, p: 3, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #b6d0f6 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit', height: '100%' }}>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <StatCard icon={<CloudUploadIcon color="primary" sx={{ fontSize: 40 }} />} label="Records" value={records.length} color="#1976d2" gradient={statGradients.records} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard icon={<LocalHospitalIcon color="secondary" sx={{ fontSize: 40 }} />} label="Doctors" value={permissions.length} color="#00bcd4" gradient={statGradients.doctors} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard icon={<ScienceIcon color="success" sx={{ fontSize: 40 }} />} label="Diagnostics" value={diagnosticReports.length} color="#43a047" gradient={statGradients.diagnostics} />
              </Grid>
            </Grid>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Activity
              </Typography>
              {recentActivity.length ? recentActivity.map((a, i) => <ActivityCard key={i} activity={a} />) : (
                <Typography variant="body2" color="text.secondary">No recent activity yet.</Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
      {/* Section: Manage Permissions */}
      <Card elevation={3} sx={{ mb: 4, p: 3, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #b6d0f6 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit' }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', fontWeight: 700 }}><AssignmentIndIcon sx={{ mr: 1 }} />Manage Permissions</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Select fullWidth value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} displayEmpty>
              <MenuItem value=""><em>Select Doctor</em></MenuItem>
              {doctorList.map(doc => (
                <MenuItem key={doc.address} value={doc.address}>
                  {doc.name} (H#: {doc.hNumber})<br /><span style={{ fontSize: 12, color: '#888' }}>{doc.address}</span>
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" color="primary" onClick={handleGrant}>Grant Access</Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Granted Doctors:</Typography>
          <Grid container spacing={2}>
            {permissions.map((perm, i) => {
              // Use lowercase for address lookup in doctorDetailsMap
              const doc = doctorDetailsMap[perm.doctor?.toLowerCase()] || {};
              return (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card elevation={4} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #f3f7ff 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}><LocalHospitalIcon /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{doc.name || 'Unknown Doctor'}</Typography>
                      <Typography variant="body2" color="text.secondary">H#: {doc.hNumber || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{perm.doctor}</Typography>
                    </Box>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleRevoke(perm.doctor)}>Revoke</Button>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Card>
      {/* Section: Medical Records */}
      <Fade in timeout={500}>
        <Card elevation={3} sx={{ mb: 4, p: 3, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #b6d0f6 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit', transition: 'box-shadow 0.3s' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}><CloudUploadIcon sx={{ mr: 1 }} />Medical Records</Typography>
            <TextField size="small" label="Search records" value={recordFilter} onChange={e => setRecordFilter(e.target.value)} sx={{ minWidth: 220, mr: 1 }} />
            <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={() => setShowUploadModal(true)} aria-label="Upload Medical Record">
              Upload Record
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {filteredRecords.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary">No medical records found.</Typography>
              </Grid>
            ) : (
              filteredRecords.slice((recordsPage-1)*recordsPerPage, recordsPage*recordsPerPage).map((rec, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card elevation={4} sx={{ borderRadius: 3, p: 2, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #f3f7ff 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Type: {rec.recordType}</Typography>
                    <Typography color="text.secondary">Date: {rec.timestamp && new Date(Number(rec.timestamp.toString()) * 1000).toLocaleString()}</Typography>
                    <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }} onClick={() => window.open(`https://ipfs.io/ipfs/${rec.ipfsHash}`, '_blank', 'noopener,noreferrer')}>View Record</Button>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
          {filteredRecords.length > recordsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={Math.ceil(filteredRecords.length/recordsPerPage)} page={recordsPage} onChange={(e, v) => setRecordsPage(v)} color="primary" />
            </Box>
          )}
        </Card>
      </Fade>
      {/* Section: Consultancy & Diagnostic Reports */}
      {/* Consultancy Reports Section */}
      <Card elevation={3} sx={{ mb: 4, p: 3, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #b6d0f6 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Consultancy Reports</Typography>
          <TextField size="small" label="Search reports" value={consultancyFilter} onChange={e => setConsultancyFilter(e.target.value)} sx={{ minWidth: 220, mr: 1 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {filteredConsultancy.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary">No consultancy reports found.</Typography>
            </Grid>
          ) : (
            filteredConsultancy.slice((consultancyPage-1)*recordsPerPage, consultancyPage*recordsPerPage).map((rep, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card elevation={4} sx={{ borderRadius: 3, p: 2, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #f3f7ff 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Doctor: {rep.doctor.name} ({rep.doctor.specialization})</Typography>
                <Typography color="text.secondary">Date: {rep.reports[0].timestamp && new Date(Number(rep.reports[0].timestamp.toString()) * 1000).toLocaleString()}</Typography>
                <Typography>Diagnosis: {rep.reports[0].diagnosis}</Typography>
                <Typography>Prescription: {rep.reports[0].prescription}</Typography>
              </Card>
            </Grid>
            ))
          )}
        </Grid>
        {filteredConsultancy.length > recordsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={Math.ceil(filteredConsultancy.length/recordsPerPage)} page={consultancyPage} onChange={(e, v) => setConsultancyPage(v)} color="primary" />
          </Box>
        )}
      </Card>
      {/* Diagnostic Reports Section */}
      <Card elevation={3} sx={{ mb: 4, p: 3, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #b6d0f6 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Diagnostic Reports</Typography>
          <TextField size="small" label="Search reports" value={diagnosticFilter} onChange={e => setDiagnosticFilter(e.target.value)} sx={{ minWidth: 220, mr: 1 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {filteredDiagnostic.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary">No diagnostic reports found.</Typography>
            </Grid>
          ) : (
            filteredDiagnostic.slice((diagnosticPage-1)*recordsPerPage, diagnosticPage*recordsPerPage).map((rep, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card elevation={4} sx={{ borderRadius: 3, p: 2, background: theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #f3f7ff 0%, #e3ecfa 100%)', color: theme === 'dark' ? '#fff' : 'inherit', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Type: {rep.testType}</Typography>
                <Typography color="text.secondary">Date: {rep.timestamp && new Date(Number(rep.timestamp.toString()) * 1000).toLocaleString()}</Typography>
                <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }} onClick={() => window.open(`https://ipfs.io/ipfs/${rep.ipfsHash}`, '_blank', 'noopener,noreferrer')}>View Record</Button>
              </Card>
            </Grid>
            ))
          )}
        </Grid>
        {filteredDiagnostic.length > recordsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={Math.ceil(filteredDiagnostic.length/recordsPerPage)} page={diagnosticPage} onChange={(e, v) => setDiagnosticPage(v)} color="primary" />
          </Box>
        )}
      </Card>
      {/* Upload Modal */}
      <Dialog open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <DialogTitle>Upload Medical Record</DialogTitle>
        <DialogContent>
          <TextField label="Record Type" fullWidth value={recordType} onChange={e => setRecordType(e.target.value)} sx={{ mb: 2 }} />
          <Button variant="contained" component="label" fullWidth startIcon={<CloudUploadIcon />}>
            Select File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>
      {/* Status Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default PatientDashboard; 
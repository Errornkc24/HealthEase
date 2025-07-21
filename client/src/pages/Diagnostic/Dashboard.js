import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DiagnosticContract from '../../abis/DiagnosticContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import { uploadFile } from '../../services/uploadFile';
import EHRSystem from '../../abis/EHRSystem.json';
import PatientContract from '../../abis/PatientContract.json';
import { Box, Grid, Card, CardContent, Typography, Button as MUIButton, Avatar, Chip, TextField, Snackbar, CircularProgress, Divider, MenuItem, Select } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import Fade from '@mui/material/Fade';
import Collapse from '@mui/material/Collapse';
import { useTheme } from '../../contexts/ThemeContext';
import StatCard from '../../components/StatCard';
import ProfileForm from '../../components/ProfileForm';
import SnackbarAlert from '../../components/SnackbarAlert';
import SearchBar from '../../components/SearchBar';
import Pagination from '@mui/material/Pagination';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DiagnosticDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientDetailsMap, setPatientDetailsMap] = useState({});
  const [testType, setTestType] = useState('');
  const [ipfsFile, setIpfsFile] = useState(null);
  const [txStatus, setTxStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [patientAddr, setPatientAddr] = useState('');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [reportsPage, setReportsPage] = useState(1);
  const reportsPerPage = 4;
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [innerPages, setInnerPages] = useState({});
  // Add filter states
  const [outerReportFilter, setOuterReportFilter] = useState('');
  const [innerReportFilters, setInnerReportFilters] = useState({});

  const user = JSON.parse(localStorage.getItem('ehr_user'));
  const { theme } = useTheme();

  useEffect(() => {
    if (!user || user.role !== 'diagnostic') {
      window.location.href = '/login/diagnostic';
      return;
    }
    loadData();
    fetchPatients();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);
      const c = await contract.centers(user.wallet);
      setProfile(c);
      setForm({
        name: c.name,
        location: c.location,
        contactNumber: c.contactNumber,
        email: c.email,
        licenseNumber: c.licenseNumber,
        establishedDate: c.establishedDate
      });
      const reps = await contract.getReportsByCenter(user.wallet);
      setReports(reps);
    } catch (err) {
      setTxStatus('Error loading data: ' + err.message);
    }
    setLoading(false);
  };

  const fetchPatients = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const allPatients = await ehrSystem.getAllPatients();
      const detailsMap = {};
      await Promise.all(allPatients.map(async addr => {
        try {
          const p = await patientContract.patients(addr);
          detailsMap[addr.toLowerCase()] = {
            name: p.name,
            hNumber: p.hNumber,
            wallet: addr
          };
        } catch {}
      }));
      setPatientDetailsMap(detailsMap);
      setPatients(allPatients);
    } catch (err) {
      // handle error if needed
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setTxStatus('');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);
      const tx = await contract.updateProfile(
        form.name,
        form.location,
        form.contactNumber,
        form.email,
        form.licenseNumber,
        form.establishedDate,
        [] // servicesOffered update omitted for brevity
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

  const handleCreateReport = async () => {
    setTxStatus('');
    if (!patientAddr || !testType || !ipfsFile) {
      setTxStatus('Fill all fields and select a file.');
      return;
    }
    try {
      setTxStatus('Uploading file to Pinata...');
      const hash = await uploadFile(ipfsFile);
      setTxStatus('File uploaded to Pinata. Storing on blockchain...');
      const providerEth = new ethers.providers.Web3Provider(window.ethereum);
      const signer = providerEth.getSigner();
      const contract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);
      const tx = await contract.createDiagnosticReport(patientAddr, patientAddr, testType, hash);
      setTxStatus('Report creation sent. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Diagnostic report created!');
      setPatientAddr('');
      setTestType('');
      setIpfsFile(null);
      loadData();
    } catch (err) {
      setTxStatus('Report creation failed: ' + err.message);
    }
  };

  if (loading) return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress color="secondary" />
    </Box>
  );

  // StatCard gradients
  const statGradients = {
    records: 'linear-gradient(120deg, #b6d0f6 0%, #ffffff 100%)',
    reports: 'linear-gradient(120deg, #eac8ff 0%, #ffffff 100%)',
    diagnostics: 'linear-gradient(120deg, #b2e9db 0%, #ffffff 100%)',
  };

  // Group diagnostic reports by patient
  const groupedReports = reports.reduce((acc, rep) => {
    const key = rep.patient.toLowerCase();
    if (!acc[key]) acc[key] = { patient: rep.patient, reports: [] };
    acc[key].reports.push(rep);
    return acc;
  }, {});
  const reportGroups = Object.values(groupedReports);

  // Filtered outer report groups
  const filteredReportGroups = reportGroups.filter(group => {
    const details = patientDetailsMap[group.patient?.toLowerCase()] || {};
    const filter = outerReportFilter.toLowerCase();
    return (
      (!filter) ||
      (details.name && details.name.toLowerCase().includes(filter)) ||
      (details.hNumber && details.hNumber.toLowerCase().includes(filter)) ||
      (group.patient && group.patient.toLowerCase().includes(filter))
    );
  });

  const innerFilter = expandedPatient ? (innerReportFilters[expandedPatient] || '') : '';
  const expandedGroup = expandedPatient ? reportGroups.find(g => g.patient === expandedPatient) : null;
  const filteredInnerReports = expandedGroup ? expandedGroup.reports.filter(rep => {
    if (!innerFilter) return true;
    const filter = innerFilter.toLowerCase();
    const typeMatch = rep.testType && rep.testType.toLowerCase().includes(filter);
    const dateMatch = rep.timestamp && new Date(Number(rep.timestamp) * 1000).toLocaleDateString().includes(filter);
    return typeMatch || dateMatch;
  }) : [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-bg)', background: theme === 'gradient' ? 'linear-gradient(140deg, #8bb6f9 0%, #6be7c1 50%, #e6b6ff 100%)' : 'none', px: { xs: 1, sm: 3, md: 6 }, py: { xs: 2, sm: 4, md: 6 } }}>
      {/* Top Section: Profile | Stats */}
      <Grid container spacing={4} alignItems="stretch" sx={{ mb: 4, maxWidth: 1400, mx: 'auto' }}>
        <Grid item xs={12} md={4}>
          <Card elevation={6} sx={{ borderRadius: 4, p: 3, background: 'linear-gradient(120deg, #eac8ff 0%, #f6eafd 100%)', height: '100%', minWidth: 280, maxWidth: 400, mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main', mb: 1 }}>
                <ScienceIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.name || 'Diagnostic Center'}</Typography>
              <Chip icon={<AssignmentIcon />} label="Diagnostic Center" color="secondary" sx={{ fontWeight: 600 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{profile?.location && `Location: ${profile.location}`}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.contactNumber && `Contact: ${profile.contactNumber}`}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
              <Typography variant="body2" color="text.secondary">License: {profile?.licenseNumber}</Typography>
              <Typography variant="body2" color="text.secondary">Established: {profile?.establishedDate}</Typography>
              <Typography variant="body2" color="text.secondary">{user.wallet}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card elevation={6} sx={{ borderRadius: 4, p: 3, background: 'linear-gradient(120deg, #ede7f6 0%, #eac8ff 100%)', height: '100%', minWidth: 280, maxWidth: 800, mx: 'auto' }}>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <StatCard icon={<DescriptionIcon color="secondary" sx={{ fontSize: 40 }} />} label="Reports" value={reports.length} color="#b57be4" gradient={statGradients.reports} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard icon={<PersonIcon color="primary" sx={{ fontSize: 40 }} />} label="Patients" value={patients.length} color="#1976d2" gradient={statGradients.records} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard icon={<CloudUploadIcon color="primary" sx={{ fontSize: 40 }} />} label="Records" value={reports.length} color="#1976d2" gradient={statGradients.records} />
              </Grid>
            </Grid>
            {/* Recent Activity */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Activity</Typography>
              {reports.length ? (
                <Box>
                  {reports.slice(0, 3).map((rep, i) => (
                    <Card elevation={2} sx={{ mb: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, p: 2, background: '#fff' }} key={i}>
                      <ScienceIcon color="secondary" />
                      <Box>
                        <Typography variant="body1">
                          Uploaded {rep.testType} report for {patientDetailsMap[rep.patient?.toLowerCase()]?.name || rep.patient} on {rep.timestamp && new Date(Number(rep.timestamp.toString()) * 1000).toLocaleString()}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No recent activity yet.</Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
      {/* Section: Create Diagnostic Report */}
      <Card elevation={3} sx={{ mb: 4, p: 3, background: 'linear-gradient(120deg, #eac8ff 0%, #f6eafd 100%)', transition: 'box-shadow 0.3s' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}><CloudUploadIcon sx={{ mr: 1 }} />Create Diagnostic Report</Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Select fullWidth value={patientAddr} onChange={e => setPatientAddr(e.target.value)} displayEmpty>
              <MenuItem value=""><em>Select Patient</em></MenuItem>
              {patients.map(addr => (
                <MenuItem key={addr} value={addr}>
                  {patientDetailsMap[addr?.toLowerCase()]?.name || addr} (H#: {patientDetailsMap[addr?.toLowerCase()]?.hNumber || 'N/A'})
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Test Type" fullWidth value={testType} onChange={e => setTestType(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MUIButton variant="contained" component="label" fullWidth startIcon={<CloudUploadIcon />}>
              Select File
              <input type="file" hidden onChange={handleFileChange} />
            </MUIButton>
            {ipfsFile && <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>{ipfsFile.name}</Typography>}
          </Grid>
          <Grid item xs={12} sm={2}>
            <MUIButton variant="contained" color="secondary" fullWidth sx={{ height: '100%' }} onClick={handleCreateReport}>Submit</MUIButton>
          </Grid>
        </Grid>
      </Card>
      {/* Section: Diagnostic Reports */}
      <Card elevation={3} sx={{ mb: 4, p: 3, background: 'linear-gradient(120deg, #eac8ff 0%, #f6eafd 100%)', transition: 'box-shadow 0.3s' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}><DescriptionIcon sx={{ mr: 1 }} />Diagnostic Reports</Typography>
          <TextField size="small" label="Search reports" value={outerReportFilter} onChange={e => setOuterReportFilter(e.target.value)} sx={{ minWidth: 220, mr: 1 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {filteredReportGroups.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>No diagnostic reports found.</Card>
            </Grid>
          ) : (
            filteredReportGroups.slice((reportsPage-1)*reportsPerPage, reportsPage*reportsPerPage).map((group, i) => {
              const details = patientDetailsMap[group.patient?.toLowerCase()] || {};
              const isExpanded = expandedPatient === group.patient;
              const innerPage = innerPages[group.patient] || 1;
              const reportsPerInnerPage = 4;
              const handleInnerPageChange = (e, v) => {
                e.stopPropagation();
                setInnerPages(pages => ({ ...pages, [group.patient]: v }));
              };
              return (
                <Grid item xs={12} sm={6} md={3} key={group.patient}>
                  <Card elevation={2}
                    sx={{ borderRadius: 3, p: 2, background: 'linear-gradient(120deg, #f3dbff 0%, #f6eafd 100%)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } }}
                    onClick={() => {
                      if (expandedPatient === group.patient) {
                        setExpandedPatient(null);
                      } else {
                        setExpandedPatient(group.patient);
                      }
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{details.name || group.patient}</Typography>
                    <Typography variant="body2" color="text.secondary">H#: {details.hNumber || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{group.patient}</Typography>
                    <Collapse in={isExpanded} unmountOnExit timeout={400}>
                      {expandedPatient === group.patient && (
                        <TextField size="small" label="Search patient reports" value={innerReportFilters[group.patient] || ''} onChange={e => setInnerReportFilters(f => ({ ...f, [group.patient]: e.target.value }))} sx={{ minWidth: 180, mb: 2 }} onClick={e => e.stopPropagation()} />
                      )}
                      {expandedPatient === group.patient && (
                        <Grid container spacing={2}>
                          {filteredInnerReports.slice((innerPages[group.patient] || 1 - 1)*4, (innerPages[group.patient] || 1)*4).map((rep, j) => (
                            <Grid item xs={12} sm={6} md={3} key={j}>
                              <Card
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 3,
                                  background: 'linear-gradient(120deg, #eac8ff 0%, #f6eafd 100%)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  minHeight: 100,
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  '&:hover': { transform: 'scale(1.02)', boxShadow: 8 }
                                }}
                              >
                                <Typography variant="subtitle1">Type: {rep.testType}</Typography>
                                <Typography color="text.secondary">
                                  Date: {rep.timestamp && new Date(Number(rep.timestamp.toString()) * 1000).toLocaleString()}
                                </Typography>
                                <MUIButton
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  onClick={() => window.open(`https://ipfs.io/ipfs/${rep.ipfsHash}`, '_blank', 'noopener,noreferrer')}
                                >
                                  View Record
                                </MUIButton>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                      {group.reports.length > reportsPerInnerPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <Pagination count={Math.ceil(group.reports.length/reportsPerInnerPage)} page={innerPage} onChange={handleInnerPageChange} color="primary" />
                        </Box>
                      )}
                    </Collapse>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
        {reportGroups.length > reportsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={Math.ceil(reportGroups.length/reportsPerPage)} page={reportsPage} onChange={(e, v) => setReportsPage(v)} color="primary" />
          </Box>
        )}
      </Card>
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default DiagnosticDashboard; 
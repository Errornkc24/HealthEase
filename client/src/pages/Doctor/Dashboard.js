import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DoctorContract from '../../abis/DoctorContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import PatientContract from '../../abis/PatientContract.json';
import EHRSystem from '../../abis/EHRSystem.json';
import DiagnosticContract from '../../abis/DiagnosticContract.json';
import Button from 'react-bootstrap/Button';
import { Box, Grid, Card, CardContent, Typography, Button as MUIButton, Avatar, Chip, TextField, Snackbar, CircularProgress, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ScienceIcon from '@mui/icons-material/Science';
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

const DoctorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [patientRecords, setPatientRecords] = useState([]);
  const [recordStatus, setRecordStatus] = useState('');
  const [patientDiagnosticReports, setPatientDiagnosticReports] = useState([]);
  const [patientDetailsMap, setPatientDetailsMap] = useState({});
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [reportsPage, setReportsPage] = useState(1);
  const reportsPerPage = 5;
  const [patientsPage, setPatientsPage] = useState(1);
  const patientsPerPage = 4;
  const [patientRecordsPage, setPatientRecordsPage] = useState(1);
  const [patientDiagnosticPage, setPatientDiagnosticPage] = useState(1);
  const recordsPerPage = 5;
  const [consultancyPage, setConsultancyPage] = useState(1);
  const consultancyPerPage = 4;
  // Add new state for separate expansions and per-patient report page
  const [expandedPermittedPatient, setExpandedPermittedPatient] = useState(null);
  const [expandedConsultancyPatient, setExpandedConsultancyPatient] = useState(null);
  const [consultancyReportPages, setConsultancyReportPages] = useState({});
  // Add a constant for inner report pagination
  const consultancyInnerPerPage = 3;
  // Add filter states
  const [permittedPatientFilter, setPermittedPatientFilter] = useState('');
  const [consultancyOuterFilter, setConsultancyOuterFilter] = useState('');
  const [consultancyInnerFilters, setConsultancyInnerFilters] = useState({});
  const [permittedInnerRecordFilters, setPermittedInnerRecordFilters] = useState({});
  const [permittedInnerDiagnosticFilters, setPermittedInnerDiagnosticFilters] = useState({});

  const user = JSON.parse(localStorage.getItem('ehr_user'));
  const { theme } = useTheme();

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      window.location.href = '/login/doctor';
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    setLoading(true);
    setTxStatus('');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      const d = await contract.doctors(user.wallet);
      setProfile(d);
      setForm({
        name: d.name,
        hospital: d.hospital,
        specialization: d.specialization,
        department: d.department,
        designation: d.designation,
        experience: d.experience && d.experience.toString(),
        email: d.email
      });
      // Fetch permitted patients from EHRSystem (on-chain)
      const permittedPatients = await ehrSystem.getPermittedPatientsForDoctor(user.wallet);
      // Fetch patient details for each address
      const detailsMap = {};
      await Promise.all(permittedPatients.map(async addr => {
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
      setPatients(permittedPatients.map(addr => ({ patient: addr, active: true })));
      const reps = await contract.getConsultancyReports(user.wallet);
      setReports(reps);
    } catch (err) {
      setTxStatus('Error loading data: ' + err.message);
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
      const contract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
      const tx = await contract.updateProfile(
        form.name,
        form.hospital,
        form.specialization,
        form.department,
        form.designation,
        Number(form.experience),
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

  const handleReport = async () => {
    setTxStatus('');
    if (!selectedPatient || !diagnosis || !prescription) {
      setTxStatus('Select patient and fill all fields.');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
      const tx = await contract.createConsultancyReport(selectedPatient, diagnosis, prescription);
      setTxStatus('Report creation sent. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Consultancy report created!');
      setDiagnosis('');
      setPrescription('');
      setSelectedPatient('');
      loadData();
    } catch (err) {
      setTxStatus('Report creation failed: ' + err.message);
    }
  };

  const handleViewRecords = async (patientAddress) => {
    setRecordStatus('');
    if (!patientAddress) {
      setRecordStatus('Select a patient.');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const diagnosticContract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);
      
      // Get medical records
      const recs = await contract.getMedicalRecords(patientAddress);
      setPatientRecords(recs);
      
      // Get diagnostic reports for the selected patient
      const diagnosticReports = await diagnosticContract.getReportsForUser(patientAddress);
      
      // Get diagnostic center names for each report
      const reportsWithCenterNames = await Promise.all(
        diagnosticReports.map(async (report) => {
          try {
            const diagnosticCenterAddress = await diagnosticContract.getDiagnosticCenterFromReport(report.reportId);
            const centerName = await diagnosticContract.getDiagnosticCenterName(diagnosticCenterAddress);
            return { ...report, centerName };
          } catch {
            return { ...report, centerName: 'Unknown Center' };
          }
        })
      );
      
      setPatientDiagnosticReports(reportsWithCenterNames);
    } catch (err) {
      if (err.message && err.message.includes('Not authorized')) {
        setRecordStatus('You are not authorized to view this patient\'s records.');
      } else {
        setRecordStatus('Error loading records: ' + err.message);
      }
      setPatientRecords([]);
      setPatientDiagnosticReports([]);
    }
  };

  if (loading) return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress color="success" />
    </Box>
  );

  // StatCard gradients
  const statGradients = {
    patients: 'linear-gradient(120deg, #b6d0f6 0%, #ffffff 100%)',
    consultations: 'linear-gradient(120deg, #b2e9db 0%, #ffffff 100%)',
    reports: 'linear-gradient(120deg, #eac8ff 0%, #ffffff 100%)',
    permissions: 'linear-gradient(120deg, #b6d0f6 0%, #ffffff 100%)',
  };

  // Group consultancy reports by patient
  const groupedConsultancy = reports.reduce((acc, rep) => {
    const key = rep.patient.toLowerCase();
    if (!acc[key]) acc[key] = { patient: rep.patient, reports: [] };
    acc[key].reports.push(rep);
    return acc;
  }, {});
  const consultancyGroups = Object.values(groupedConsultancy);

  // Permitted Patients filtered
  const filteredPatients = patients.filter(p => {
    const details = patientDetailsMap[p.patient?.toLowerCase()] || {};
    const filter = permittedPatientFilter.toLowerCase();
    return (
      (!filter) ||
      (details.name && details.name.toLowerCase().includes(filter)) ||
      (details.hNumber && details.hNumber.toLowerCase().includes(filter)) ||
      (p.patient && p.patient.toLowerCase().includes(filter))
    );
  });
  // Consultancy Reports filtered
  const filteredConsultancyGroups = consultancyGroups.filter(group => {
    const details = patientDetailsMap[group.patient?.toLowerCase()] || {};
    const filter = consultancyOuterFilter.toLowerCase();
    return (
      (!filter) ||
      (details.name && details.name.toLowerCase().includes(filter)) ||
      (details.hNumber && details.hNumber.toLowerCase().includes(filter)) ||
      (group.patient && group.patient.toLowerCase().includes(filter))
    );
  });

  // Move these variable declarations to the top of the component, after useState and before return
  const recordFilter = permittedInnerRecordFilters[expandedPermittedPatient] || '';
  const filteredPatientRecords = patientRecords.filter(rec => {
    if (!recordFilter) return true;
    const filter = recordFilter.toLowerCase();
    const typeMatch = rec.recordType && rec.recordType.toLowerCase().includes(filter);
    const dateMatch = rec.timestamp && new Date(Number(rec.timestamp) * 1000).toLocaleDateString().includes(filter);
    return typeMatch || dateMatch;
  });
  const diagnosticFilter = permittedInnerDiagnosticFilters[expandedPermittedPatient] || '';
  const filteredPatientDiagnosticReports = patientDiagnosticReports.filter(rep => {
    if (!diagnosticFilter) return true;
    const filter = diagnosticFilter.toLowerCase();
    const typeMatch = rep.testType && rep.testType.toLowerCase().includes(filter);
    const dateMatch = rep.timestamp && new Date(Number(rep.timestamp) * 1000).toLocaleDateString().includes(filter);
    return typeMatch || dateMatch;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-bg)', background: theme === 'gradient' ? 'linear-gradient(140deg, #8bb6f9 0%, #6be7c1 50%, #e6b6ff 100%)' : 'none', py: 4, width: '100%', px: { xs: 1, md: 4 } }}>
      {/* Top Section: Profile | Stats */}
      <Grid container spacing={4} alignItems="stretch" sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={6} sx={{ borderRadius: 4, p: 3, background: 'linear-gradient(120deg, #b2e9db 0%, #d0f5e8 100%)', height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#43a047', mb: 1 }}>
                <LocalHospitalIcon sx={{ fontSize: 48, color: '#fff' }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.name || 'Doctor'}</Typography>
              <Chip icon={<AssignmentIcon sx={{ color: '#fff !important' }} />} label={profile?.specialization || 'Specialization'} sx={{ fontWeight: 600, bgcolor: '#43a047', color: '#fff' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, color: 'var(--color-text-secondary)' }}>{profile?.hospital && `Hospital: ${profile.hospital}`}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: 'var(--color-text-secondary)' }}>{profile?.department && `Dept: ${profile.department}`}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: 'var(--color-text-secondary)' }}>{profile?.designation && `Designation: ${profile.designation}`}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: 'var(--color-text-secondary)' }}>{profile?.experience && `Experience: ${profile.experience} yrs`}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: 'var(--color-text-secondary)' }}>{profile?.email}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: 'var(--color-text-secondary)' }}>{user.wallet}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<GroupIcon color="success" sx={{ fontSize: 40 }} />} label="Patients" value={patients.length} color="#43a047" gradient={statGradients.patients} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<AssignmentIcon color="info" sx={{ fontSize: 40 }} />} label="Consultations" value={reports.length} color="#00bcd4" gradient={statGradients.consultations} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<DescriptionIcon color="warning" sx={{ fontSize: 40 }} />} label="Reports" value={reports.length} color="#ffa726" gradient={statGradients.reports} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard icon={<PersonIcon color="secondary" sx={{ fontSize: 40 }} />} label="Permissions" value={patients.length} color="#ab47bc" gradient={statGradients.permissions} />
            </Grid>
          </Grid>
          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <MUIButton variant="contained" color="success" onClick={handleEdit} startIcon={<EditIcon />}>Edit Profile</MUIButton>
          </Box>
        </Grid>
      </Grid>
      {/* Main Section: Patient List */}
      <Card elevation={3} sx={{ mb: 4, p: 3, background: 'linear-gradient(120deg, #b2e9db 0%, #e3faf3 100%)', transition: 'box-shadow 0.3s' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}><GroupIcon sx={{ mr: 1 }} />Permitted Patients</Typography>
          <TextField size="small" label="Search patients" value={permittedPatientFilter} onChange={e => setPermittedPatientFilter(e.target.value)} sx={{ minWidth: 220, mr: 1 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            {filteredPatients.slice((patientsPage-1)*patientsPerPage, patientsPage*patientsPerPage).map((p, i) => {
              const details = patientDetailsMap[p.patient?.toLowerCase()] || {};
              return (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card elevation={2}
                    sx={{ borderRadius: 3, p: 2, background: 'linear-gradient(120deg, #e3faf3 0%, #fafdff 100%)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } }}
                    onClick={() => {
                      if (expandedPermittedPatient === p.patient) {
                        setExpandedPermittedPatient(null);
                      } else {
                        setExpandedPermittedPatient(p.patient);
                        setSelectedPatient(p.patient);
                        handleViewRecords(p.patient);
                      }
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{details.name || p.patient}</Typography>
                    <Typography variant="body2" color="text.secondary">H#: {details.hNumber || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{p.patient}</Typography>
                    <Collapse in={expandedPermittedPatient === p.patient} unmountOnExit timeout={400}>
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Patient Records</Typography>
                        {recordStatus && <Typography color="error" sx={{ mb: 2 }}>{recordStatus}</Typography>}
                        {expandedPermittedPatient === p.patient && (
                          <TextField size="small" label="Search records" value={permittedInnerRecordFilters[p.patient] || ''} onChange={e => setPermittedInnerRecordFilters(f => ({ ...f, [p.patient]: e.target.value }))} sx={{ minWidth: 180, mb: 2 }} onClick={e => e.stopPropagation()} />
                        )}
                        {filteredPatientRecords.length === 0 && filteredPatientDiagnosticReports.length === 0 && !recordStatus ? (
                          <Typography color="text.secondary">No records found for this patient.</Typography>
                        ) : (
                          <>
                          <Grid container spacing={2}>
                                {filteredPatientRecords.slice((patientRecordsPage-1)*recordsPerPage, patientRecordsPage*recordsPerPage).map((rec, i) => (
                                <Grid item xs={12} sm={6} md={6} key={i}>
                                <Card elevation={3} sx={{ mb: 2, p: 2, borderRadius: 3, background: 'linear-gradient(120deg, #e3faf3 0%, #fafdff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: 120, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 8 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FolderOpenIcon color="info" sx={{ mr: 1 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{rec.recordType}</Typography>
                                  </Box>
                                  <Typography color="text.secondary" sx={{ mb: 1 }}>Date: {rec.timestamp && new Date(Number(rec.timestamp.toString()) * 1000).toLocaleString()}</Typography>
                                  <MUIButton variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => window.open(`https://ipfs.io/ipfs/${rec.ipfsHash}`, '_blank', 'noopener,noreferrer')}>View Record</MUIButton>
                                </Card>
                              </Grid>
                            ))}
                            </Grid>
                            {patientRecords.length > recordsPerPage && (
                              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} onClick={e => e.stopPropagation()}>
                                <Pagination count={Math.ceil(patientRecords.length/recordsPerPage)} page={patientRecordsPage} onChange={(e, v) => setPatientRecordsPage(v)} color="primary" />
                              </Box>
                            )}
                            {/* Diagnostic Reports Section */}
                            {expandedPermittedPatient === p.patient && filteredPatientDiagnosticReports.length > 0 && (
                              <>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>Diagnostic Reports</Typography>
                                <TextField size="small" label="Search diagnostic reports" value={permittedInnerDiagnosticFilters[p.patient] || ''} onChange={e => setPermittedInnerDiagnosticFilters(f => ({ ...f, [p.patient]: e.target.value }))} sx={{ minWidth: 180, mb: 2, mt: 2 }} onClick={e => e.stopPropagation()} />
                                <Grid container spacing={2}>
                                  {filteredPatientDiagnosticReports.slice((patientDiagnosticPage-1)*recordsPerPage, patientDiagnosticPage*recordsPerPage).map((rep, i) => (
                                    <Grid item xs={12} sm={6} md={6} key={i}>
                                <Card elevation={3} sx={{ mb: 2, p: 2, borderRadius: 3, background: 'linear-gradient(120deg, #e3faf3 0%, #fafdff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: 120, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 8 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <ScienceIcon color="info" sx={{ mr: 1 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{rep.testType}</Typography>
                                  </Box>
                                  <Typography color="text.secondary" sx={{ mb: 1 }}>Date: {rep.timestamp && new Date(Number(rep.timestamp.toString()) * 1000).toLocaleString()}</Typography>
                                  <Typography color="text.secondary">Center: {rep.centerName}</Typography>
                                  <MUIButton variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => window.open(`https://ipfs.io/ipfs/${rep.ipfsHash}`, '_blank', 'noopener,noreferrer')}>View Record</MUIButton>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                                {patientDiagnosticReports.length > recordsPerPage && (
                                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} onClick={e => e.stopPropagation()}>
                                    <Pagination count={Math.ceil(patientDiagnosticReports.length/recordsPerPage)} page={patientDiagnosticPage} onChange={(e, v) => setPatientDiagnosticPage(v)} color="primary" />
                                  </Box>
                                )}
                              </>
                            )}
                          </>
                        )}
                        {/* Create Consultancy Report Form */}
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>Create Consultancy Report</Typography>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={5}>
                            <TextField label="Diagnosis" fullWidth value={diagnosis} onChange={e => setDiagnosis(e.target.value)} sx={{ mb: 2 }} onClick={e => e.stopPropagation()} />
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <TextField label="Prescription" fullWidth value={prescription} onChange={e => setPrescription(e.target.value)} sx={{ mb: 2 }} onClick={e => e.stopPropagation()} />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <MUIButton variant="contained" color="success" fullWidth sx={{ height: '100%' }} onClick={e => { e.stopPropagation(); handleReport(); }}>Submit</MUIButton>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Fade>
        {patients.length > patientsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} onClick={e => e.stopPropagation()}>
            <Pagination count={Math.ceil(patients.length/patientsPerPage)} page={patientsPage} onChange={(e, v) => setPatientsPage(v)} color="primary" />
          </Box>
        )}
      </Card>
      {/* Main Section: Consultancy Reports */}
      <Card elevation={3} sx={{ mb: 4, p: 3, background: 'linear-gradient(120deg, #b2e9db 0%, #e3faf3 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}><DescriptionIcon sx={{ mr: 1 }} />Consultancy Reports</Typography>
          <TextField size="small" label="Search reports" value={consultancyOuterFilter} onChange={e => setConsultancyOuterFilter(e.target.value)} sx={{ minWidth: 220, mr: 1 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {filteredConsultancyGroups.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary">No consultancy reports found.</Typography>
            </Grid>
          ) : (
            filteredConsultancyGroups.slice((consultancyPage-1)*consultancyPerPage, consultancyPage*consultancyPerPage).map((group, i) => {
              const details = patientDetailsMap[group.patient?.toLowerCase()] || {};
              const isExpanded = expandedConsultancyPatient === group.patient;
              const reportPage = consultancyReportPages[group.patient] || 1;
              const innerFilter = consultancyInnerFilters[expandedConsultancyPatient] || '';
              const filteredInnerReports = (consultancyGroups.find(g => g.patient === expandedConsultancyPatient)?.reports || []).filter(rep => {
                if (!innerFilter) return true;
                const dateMatch = rep.timestamp && new Date(Number(rep.timestamp) * 1000).toLocaleDateString().includes(innerFilter);
                return dateMatch;
              });
              return (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card elevation={2}
                    sx={{ borderRadius: 3, p: 2, background: 'linear-gradient(120deg, #e3faf3 0%, #fafdff 100%)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } }}
                    onClick={() => {
                      if (expandedConsultancyPatient === group.patient) {
                        setExpandedConsultancyPatient(null);
                      } else {
                        setExpandedConsultancyPatient(group.patient);
                      }
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{details.name || group.patient}</Typography>
                    <Typography variant="body2" color="text.secondary">H#: {details.hNumber || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{group.patient}</Typography>
                    <Collapse in={isExpanded} unmountOnExit timeout={400}>
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 1 }} />
                        <Grid container spacing={2}>
                          {filteredInnerReports.slice((reportPage-1)*consultancyInnerPerPage, reportPage*consultancyInnerPerPage).map((rep, j) => (
                            <Grid item xs={12} sm={6} md={4} key={j}>
                              <Card elevation={3} sx={{ mb: 2, p: 2, borderRadius: 3, background: 'linear-gradient(120deg, #e3faf3 0%, #fafdff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: 100, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 8 } }}>
                                <Typography color="text.secondary">Diagnosis: {rep.diagnosis}</Typography>
                                <Typography color="text.secondary">Prescription: {rep.prescription}</Typography>
                                <Typography color="text.secondary">Date: {rep.timestamp && new Date(Number(rep.timestamp) * 1000).toLocaleString()}</Typography>
                              </Card>
            </Grid>
          ))}
                        </Grid>
                        {group.reports.length > consultancyInnerPerPage && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} onClick={e => e.stopPropagation()}>
                            <Pagination count={Math.ceil(group.reports.length/consultancyInnerPerPage)} page={reportPage} onChange={(e, v) => {
                              setConsultancyReportPages(pages => ({ ...pages, [group.patient]: v }));
                            }} color="primary" />
                          </Box>
                        )}
                        {expandedConsultancyPatient === group.patient && (
                          <TextField size="small" label="Search by date" value={consultancyInnerFilters[group.patient] || ''} onChange={e => setConsultancyInnerFilters(f => ({ ...f, [group.patient]: e.target.value }))} sx={{ minWidth: 180, mb: 2, mt: 2 }} onClick={e => e.stopPropagation()} />
                        )}
                      </Box>
                    </Collapse>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
        {consultancyGroups.length > consultancyPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} onClick={e => e.stopPropagation()}>
            <Pagination count={Math.ceil(consultancyGroups.length/consultancyPerPage)} page={consultancyPage} onChange={(e, v) => setConsultancyPage(v)} color="primary" />
          </Box>
        )}
      </Card>
      {/* Snackbar for status */}
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default DoctorDashboard; 
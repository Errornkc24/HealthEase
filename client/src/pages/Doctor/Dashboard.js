import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DoctorContract from '../../abis/DoctorContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import PatientContract from '../../abis/PatientContract.json';
import EHRSystem from '../../abis/EHRSystem.json';
import DiagnosticContract from '../../abis/DiagnosticContract.json';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import Pagination from '../../components/Pagination';
import {
  User, 
  FileText, 
  Shield, 
  Users, 
  Calendar,
  Heart,
  Activity,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Stethoscope,
  Hospital,
  UserCheck,
  ClipboardList,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  FilePlus,
  Microscope,
  Pill,
  UserPlus,
  UserX,
  Mail,
  MapPin,
  Phone,
  Printer,
  File
} from 'lucide-react';

const DoctorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [recordStatus, setRecordStatus] = useState('');
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for managing the currently viewed report
  const [viewingReport, setViewingReport] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  // Function to handle view report - opens file directly in new tab
  const handleViewReport = (record) => {
    let fileUrl = '';
    
    // Determine the file URL
    if (record.ipfsHash) {
      fileUrl = `https://ipfs.io/ipfs/${record.ipfsHash}`;
    } else if (record.fileUrl) {
      fileUrl = record.fileUrl;
    } else if (record.attachments && record.attachments.length > 0) {
      fileUrl = record.attachments[0].url;
    }
    
    if (fileUrl) {
      // Open the file directly in a new tab
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to showing details in modal if no file URL is found
      setViewingReport({ ...record });
      setIsViewerOpen(true);
    }
  };
  
  // Function to render file preview based on file type
  const renderFilePreview = (url) => {
    if (!url) return null;
    
    const fileExtension = url.split('.').pop().toLowerCase();
    
    // Handle different file types
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <img 
            src={url} 
            alt="Medical record" 
            className="w-full h-auto max-h-96 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M3YzVjZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxNnY0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0ydi0xNGEyIDIgMCAwIDEgMi0yaDhsMiAyaDlhMiAyIDAgMCAxIDIgMnoiPjwvcGF0aD48L3N2Zz4=';
            }}
          />
        </div>
      );
    } else if (fileExtension === 'pdf') {
      return (
        <div className="mt-4 w-full h-[500px] border rounded-lg overflow-hidden">
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-full"
            title="PDF Viewer"
          ></iframe>
        </div>
      );
    } else {
      // For unsupported file types, show a download link
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">This file type cannot be previewed.</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <Download className="h-4 w-4 mr-2" />
            Download File
          </a>
        </div>
      );
    }
  };

  // State for wallet connection and pagination
  const [wallet, setWallet] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [medicalRecordsPage, setMedicalRecordsPage] = useState(1);
  const [diagnosticReportsPage, setDiagnosticReportsPage] = useState(1);
  const [recordsPerPage] = useState(5);
  const [patientSearch, setPatientSearch] = useState('');
  
  // State for patient data and records
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientDetailsMap, setPatientDetailsMap] = useState({});
  const [reports, setReports] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [patientDiagnosticReports, setPatientDiagnosticReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  
  // Load patient records when selected patient changes
  useEffect(() => {
    const loadPatientRecords = async () => {
      if (!selectedPatient) {
        setPatientRecords([]);
        setPatientDiagnosticReports([]);
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
        const diagnosticContract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);

        // Load medical records
        const records = await doctorContract.getPatientMedicalRecords(selectedPatient);
        console.log('Loaded patient records:', records);
        const formattedRecords = Array.isArray(records) ? records
          .map(record => ({
            ...record,
            patientAddress: selectedPatient,
            timestamp: record.timestamp ? parseInt(record.timestamp.toString()) * 1000 : 0, // Convert to milliseconds
            type: 'consultation',
            displayDate: record.timestamp ? new Date(parseInt(record.timestamp.toString()) * 1000).toLocaleDateString() : 'N/A',
            displayTime: record.timestamp ? new Date(parseInt(record.timestamp.toString()) * 1000).toLocaleTimeString() : 'N/A'
          }))
          .sort((a, b) => b.timestamp - a.timestamp) : [];
        
        setPatientRecords(formattedRecords);

        // Load diagnostic reports
        const reports = await diagnosticContract.getPatientDiagnosticReports(selectedPatient);
        console.log('Loaded diagnostic reports:', reports);
        const formattedReports = Array.isArray(reports) ? reports
          .map(report => ({
            ...report,
            patientAddress: selectedPatient,
            timestamp: report.timestamp ? parseInt(report.timestamp.toString()) * 1000 : 0, // Convert to milliseconds
            type: 'diagnostic',
            displayDate: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleDateString() : 'N/A',
            displayTime: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleTimeString() : 'N/A',
            displayType: report.reportType || 'Diagnostic Report' // Add displayType for consistency
          }))
          .sort((a, b) => b.timestamp - a.timestamp) : [];
        
        setPatientDiagnosticReports(formattedReports);
      } catch (error) {
        console.error('Error loading patient records:', error);
        setPatientRecords([]);
        setPatientDiagnosticReports([]);
      }
    };

    if (selectedPatient) {
      console.log('Selected patient changed, loading records...');
      loadPatientRecords();
    } else {
      setPatientRecords([]);
      setPatientDiagnosticReports([]);
    }
  }, [selectedPatient]);
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    // Reset selected patient when switching away from consultations tab
    if (activeTab === 'consultations' && tabId !== 'consultations') {
      setSelectedPatient('');
      setPatientRecords([]);
      setPatientDiagnosticReports([]);
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('ehr_user'));
    if (!userData || userData.role !== 'doctor') {
      window.location.href = '/login/doctor';
      return;
    }
    setWallet(userData.wallet);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (wallet && isConnected) {
      loadData();
    } else {
      // Reset patients and filtered patients when wallet disconnects
      setPatients([]);
      setFilteredPatients([]);
    }
  }, [wallet, isConnected]);
  
  // Initialize filteredPatients when patients data changes
  useEffect(() => {
    if (patients.length > 0) {
      setFilteredPatients(patients);
    }
  }, [patients]);

  // Update filtered patients when search or patients change
  useEffect(() => {
    if (!patientSearch) {
      setFilteredPatients(patients);
      return;
    }
    
    const searchLower = patientSearch.toLowerCase().trim();
    const filtered = patients.filter(patient => {
      return (
        (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
        (patient.hNumber && patient.hNumber.toLowerCase().includes(searchLower)) ||
        (patient.address && patient.address.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredPatients(filtered);
    
    // Auto-select if only one patient matches
    if (filtered.length === 1) {
      setSelectedPatient(filtered[0].address);
    } else if (filtered.length === 0) {
      setSelectedPatient('');
    }
  }, [patientSearch, patients]);

  const loadData = async () => {
    setLoading(true);
    setTxStatus('');
    try {
      console.log('Loading doctor data for wallet:', wallet);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      
      // Get doctor's H-number from EHRSystem
      try {
        const doctorUserData = await ehrSystem.users(wallet);
        if (doctorUserData && doctorUserData.hNumber) {
          setProfile(prev => ({ ...prev, hNumber: doctorUserData.hNumber }));
        }
      } catch (error) {
        console.error('Error fetching doctor H-number:', error);
      }

      console.log('Getting doctor profile...');
      // Get doctor profile
      const doctorData = await doctorContract.doctors(wallet);
      console.log('Doctor data:', doctorData);
      
      const profileData = {
        name: doctorData.name,
        specialization: doctorData.specialization,
        hospital: doctorData.hospital,
        department: doctorData.department,
        designation: doctorData.designation,
        experience: doctorData.experience && doctorData.experience.toString(),
        email: doctorData.email,
        dateOfBirth: doctorData.dateOfBirth,
        gender: doctorData.gender
      };
      
      setProfile(profileData);
      setForm(profileData);

      console.log('Getting permitted patients...');
      // Get permitted patients
      const permittedPatients = await ehrSystem.getPermittedPatientsForDoctor(wallet);
      console.log('Permitted patients:', permittedPatients);
      
      if (!permittedPatients || permittedPatients.length === 0) {
        console.log('No permitted patients found');
        setPatients([]);
        setLoading(false);
        return;
      }

      // First, load patient addresses from EHRSystem
      const patientsData = await Promise.all(
        permittedPatients.map(async (patientAddress) => {
          try {
            // Get patient details from PatientContract
            const patientContract = new ethers.Contract(
              contractAddresses.PatientContract, 
              PatientContract.abi, 
              signer
            );
            
            // Get patient data which includes the H-number
            const patientData = await patientContract.patients(patientAddress);
            
            // Debug: Log the raw patient data structure
            console.log('Raw patient data for', patientAddress, ':', patientData);
            console.log('Patient data keys:', Object.keys(patientData));
            console.log('Patient data values:', Object.values(patientData));
            
            // Try to get H-number from different possible field names
            const hNumber = patientData.hNumber || patientData[1] || '';
            
            const patientDetails = {
              address: patientAddress,
              hNumber: hNumber,
              // Access fields by both name and index since Solidity returns a tuple
              name: patientData.name || patientData[2] || 'Unknown',
              bloodGroup: patientData.bloodGroup || patientData[3] || '',
              homeAddress: patientData.homeAddress || patientData[4] || '',
              dateOfBirth: patientData.dateOfBirth || patientData[5] || '',
              gender: patientData.gender || patientData[6] || '',
              email: patientData.email || patientData[7] || ''
            };
            
            console.log('Patient details with H-number:', patientDetails);
            
            console.log('Patient details with H-number:', patientDetails);
            
            console.log('Fetched patient details:', patientDetails);
            return patientDetails;
          } catch (error) {
            console.error('Error loading patient data:', error);
            return null;
          }
        })
      );

      // Filter out any null entries and set the patients state
      const validPatients = patientsData.filter(patient => patient !== null);
      console.log('Setting patients state:', JSON.stringify(validPatients, null, 2));
      
      // Process the patients data
      const updatedPatients = validPatients.map(patient => {
        // Ensure all required fields exist
        return {
          ...patient,
          name: patient.name || 'Unknown Patient',
          hNumber: patient.hNumber || ''
        };
      });
      
      console.log('Processed patients data:', JSON.stringify(updatedPatients, null, 2));
      setPatients(updatedPatients);
      
      // Initialize patient details map with all patients
      const newPatientDetailsMap = updatedPatients.reduce((acc, patient) => {
        acc[patient.address] = patient;
        return acc;
      }, {});
      console.log('Setting patient details map:', newPatientDetailsMap);
      setPatientDetailsMap(newPatientDetailsMap);

      console.log('Getting consultancy reports...');
      try {
        // First, get all patients this doctor has access to
        const accessiblePatients = patientsData.filter(p => p !== null);
        console.log('Accessible patients:', accessiblePatients);
        
        // Get reports for each patient
        const reportsByPatient = [];
        for (const patient of accessiblePatients) {
          try {
            const patientReports = await doctorContract.getConsultancyReportsForPatientByDoctor(wallet, patient.address);
            console.log(`Reports for patient ${patient.address}:`, patientReports);
            
            if (patientReports && patientReports.length > 0) {
              const processedReports = patientReports.map(report => ({
                ...report,
                patientAddress: patient.address,
                patientName: patient.name,
                diagnosis: report.diagnosis || '',
                prescription: report.prescription || '',
                timestamp: report.timestamp ? report.timestamp.toString() : '0',
                doctorAddress: wallet
              }));
              
              reportsByPatient.push(...processedReports);
            }
          } catch (error) {
            console.error(`Error getting reports for patient ${patient.address}:`, error);
          }
        }
        
        // Also get all reports created by this doctor (as a fallback)
        let allDoctorReports = [];
        try {
          allDoctorReports = await doctorContract.getConsultancyReports(wallet);
          console.log('All reports from getConsultancyReports:', allDoctorReports);
          
          // Process the reports to include patient names
          const processedDoctorReports = allDoctorReports.map(report => {
            const patient = accessiblePatients.find(p => 
              p.address.toLowerCase() === report.patient.toString().toLowerCase()
            );
            
            return {
              ...report,
              patientAddress: report.patient,
              patientName: patient ? patient.name : 'Unknown Patient',
              diagnosis: report.diagnosis || '',
              prescription: report.prescription || '',
              timestamp: report.timestamp ? report.timestamp.toString() : '0',
              doctorAddress: wallet
            };
          });
          
          reportsByPatient.push(...processedDoctorReports);
        } catch (error) {
          console.error('Error getting all doctor reports:', error);
        }
        
        // Remove duplicates based on patient address and timestamp
        const uniqueReports = Array.from(new Map(
          reportsByPatient.map(report => [
            `${report.patientAddress}-${report.timestamp}`,
            {
              ...report,
              patientAddress: report.patientAddress || '',
              patientName: report.patientName || (patientDetailsMap[report.patientAddress]?.name || 'Unknown Patient'),
              diagnosis: report.diagnosis || '',
              prescription: report.prescription || '',
              timestamp: report.timestamp || '0'
            }
          ])
        ).values());
        
        console.log('Final processed reports:', uniqueReports);
        setReports(uniqueReports);
        
      } catch (error) {
        console.error('Error in processing reports:', error);
        setReports([]);
      }

    } catch (err) {
      console.error('Error loading doctor data:', err);
      setTxStatus('Error loading data: ' + err.message);
    } finally {
      console.log('Finished loading doctor data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ehr_user');
    window.location.href = '/';
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setTxStatus('Updating profile...');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);

      const tx = await doctorContract.updateProfile(
        form.name,
        form.hospital,
        form.specialization,
        form.department,
        form.designation,
        Number(form.experience)
      );

      setTxStatus('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Profile updated successfully!');
      setEditMode(false);
      loadData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setTxStatus('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);
      
      const reports = await doctorContract.getAllConsultancyReports();
      // Format reports to ensure consistent structure and sort by timestamp
      const formattedReports = Array.isArray(reports) ? reports
        .map(report => ({
          ...report,
          timestamp: report.timestamp ? parseInt(report.timestamp.toString()) * 1000 : 0, // Convert to milliseconds
          displayDate: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleDateString() : 'N/A',
          displayTime: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleTimeString() : 'N/A',
          type: 'consultation',
          displayType: 'Consultation Report'
        }))
        .sort((a, b) => b.timestamp - a.timestamp) : [];
      
      setReports(formattedReports);
      console.log('Loaded all reports:', formattedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadPatientRecords = async (patientAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const diagnosticContract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);

      // Get and sort medical records
      const records = await patientContract.getMedicalRecords(patientAddress);
      const formattedRecords = Array.isArray(records) ? records
        .map(record => ({
          ...record,
          timestamp: record.timestamp ? parseInt(record.timestamp.toString()) * 1000 : 0,
          displayDate: record.timestamp ? new Date(parseInt(record.timestamp.toString()) * 1000).toLocaleDateString() : 'N/A',
          displayTime: record.timestamp ? new Date(parseInt(record.timestamp.toString()) * 1000).toLocaleTimeString() : 'N/A'
        }))
        .sort((a, b) => b.timestamp - a.timestamp) : [];
      
      setPatientRecords(formattedRecords);

      // Get diagnostic reports
      try {
        const reports = await diagnosticContract.getReportsForUser(patientAddress);
        // Format and sort diagnostic reports
        const formattedDiagnosticReports = Array.isArray(reports) ? reports
          .map(report => ({
            ...report,
            timestamp: report.timestamp ? parseInt(report.timestamp.toString()) * 1000 : 0,
            displayDate: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleDateString() : 'N/A',
            displayTime: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleTimeString() : 'N/A',
            type: 'diagnostic',
            displayType: report.reportType || 'Diagnostic Report'
          }))
          .sort((a, b) => b.timestamp - a.timestamp) : [];
        
        setPatientDiagnosticReports(formattedDiagnosticReports);
      } catch (err) {
        console.log('No diagnostic reports found for patient');
        setPatientDiagnosticReports([]);
        setPatientDiagnosticReports([]);
      }
    } catch (error) {
      console.error('Error loading patient records:', error);
      setRecordStatus('Error loading records: ' + error.message);
    }
  };

  const createConsultancyReport = async (patientAddress) => {
    if (!diagnosis || !prescription) {
      setTxStatus('Please fill in both diagnosis and prescription');
      return;
    }

    setLoading(true);
    setTxStatus('Creating consultancy report...');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, DoctorContract.abi, signer);

      const reportData = {
        diagnosis,
        prescription,
        timestamp: Date.now()
      };

      const tx = await doctorContract.createConsultancyReport(patientAddress, diagnosis, prescription);
      setTxStatus('Transaction submitted. Waiting for confirmation...');

      await tx.wait();
      setTxStatus('Consultancy report created successfully!');
      
      // Reset form
      setDiagnosis('');
      setPrescription('');
      setSelectedPatient('');
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error creating consultancy report:', error);
      setTxStatus('Error creating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPatientRecords = async () => {
      if (!selectedPatient) return;
      
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
        
        // Load medical records
        const records = await ehrSystem.getPatientRecords(selectedPatient);
        
        // Sort records by timestamp in descending order (newest first)
        const sortedRecords = records
          .filter(record => record.recordType !== 'consultation')
          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        
        setPatientRecords(sortedRecords);
        
        // Load consultation reports
        const allReports = await ehrSystem.getConsultationReports(selectedPatient);
        
        // Sort reports by timestamp in descending order (newest first)
        const sortedReports = allReports
          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        
        setReports(sortedReports);
        
      } catch (error) {
        console.error('Error loading patient records:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPatientRecords();
  }, [selectedPatient]);

  // Filter and sort patients based on search
  const searchedPatients = filteredPatients.filter(patient => {
    if (!patient) return false;
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
      (patient.hNumber && patient.hNumber.toLowerCase().includes(searchLower)) ||
      (patient.address && patient.address.toLowerCase().includes(searchLower))
    );
  })
    .sort((a, b) => {
      // Sort by dateOfBirth in descending order (most recent first)
      if (a.dateOfBirth && b.dateOfBirth) {
        return b.dateOfBirth - a.dateOfBirth;
      }
      return 0;
    });

  // Pagination logic for patients
  const indexOfLastPatient = currentPage * recordsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - recordsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPatientPages = Math.ceil(filteredPatients.length / recordsPerPage);

  // Reports pagination
  const indexOfLastReport = reportsPage * recordsPerPage;
  const indexOfFirstReport = indexOfLastReport - recordsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalReportPages = Math.ceil(reports.length / recordsPerPage);
  
  // Medical Records pagination
  const indexOfLastMedicalRecord = medicalRecordsPage * recordsPerPage;
  const indexOfFirstMedicalRecord = indexOfLastMedicalRecord - recordsPerPage;
  const currentMedicalRecords = patientRecords.slice(indexOfFirstMedicalRecord, indexOfLastMedicalRecord);
  const totalMedicalRecordPages = Math.ceil(patientRecords.length / recordsPerPage);
  
  // Diagnostic Reports pagination
  const indexOfLastDiagnosticReport = diagnosticReportsPage * recordsPerPage;
  const indexOfFirstDiagnosticReport = indexOfLastDiagnosticReport - recordsPerPage;
  const currentDiagnosticReports = patientDiagnosticReports.slice(indexOfFirstDiagnosticReport, indexOfLastDiagnosticReport);
  const totalDiagnosticReportPages = Math.ceil(patientDiagnosticReports.length / recordsPerPage);

  // Pagination handlers
  const paginatePatients = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const paginateReports = (pageNumber) => {
    setReportsPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const paginateMedicalRecords = (pageNumber) => {
    setMedicalRecordsPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const paginateDiagnosticReports = (pageNumber) => {
    setDiagnosticReportsPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    {
      title: "Total Patients",
      value: patients && Array.isArray(patients) ? patients.length.toString() : "0",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      change: "Permitted",
      changeType: "positive"
    },
    {
      title: "Consultations",
      value: reports && Array.isArray(reports) ? reports.length.toString() : "0",
      icon: <Stethoscope className="h-6 w-6 text-green-600" />,
      change: "Completed",
      changeType: "positive"
    },
    {
      title: "Experience",
      value: profile?.experience ? `${profile.experience} years` : "0 years",
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      change: "Professional",
      changeType: "neutral"
    },
    {
      title: "Specialization",
      value: profile?.specialization || "General",
      icon: <Heart className="h-6 w-6 text-red-600" />,
      change: "Active",
      changeType: "positive"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          {txStatus && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{txStatus}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, Dr. {profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Wallet:</span> {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transaction Status */}
        {txStatus && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{txStatus}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
          </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
            { id: 'patients', label: 'Patients', icon: <Users className="h-4 w-4" /> },
            { id: 'patient-consultations', label: 'Patient Consults', icon: <UserCheck className="h-4 w-4" /> },
            { id: 'consultations', label: 'All Consultations', icon: <Stethoscope className="h-4 w-4" /> },
            { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your professional details and credentials</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('profile')}
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 bg-green-100">
                      <AvatarFallback className="text-green-600 font-semibold text-lg">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Dr. {profile?.name}</h3>
                      <p className="text-sm text-gray-600">{profile?.specialization}</p>
                      <p className="text-xs text-gray-500">{profile?.hospital}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Department</p>
                      <p className="text-gray-600">{profile?.department}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Designation</p>
                      <p className="text-gray-600">{profile?.designation}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Experience</p>
                      <p className="text-gray-600">{profile?.experience} years</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{profile?.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
                                </Card>

            {/* Recent Patients */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Patients</CardTitle>
                    <CardDescription>Patients with access permissions</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('patients')}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.length > 0 ? (
                    patients.slice(0, 4).map((patient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10 bg-green-100">
                            <AvatarFallback className="text-green-600 font-semibold">
                              {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.bloodGroup} • {patient.gender}</p>
                          </div>
                        </div>
                        <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedPatient(patient.address);
                        loadPatientRecords(patient.address);
                        setActiveTab('consultations');
                      }}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No patients with permissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
                  </Card>
          </div>
        )}

        {activeTab === 'patients' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permitted Patients</CardTitle>
                  <CardDescription>Patients who have granted you access to their records</CardDescription>
                </div>
                <div className="flex space-x-2">
                    <Input
                      role="doctor"
                      placeholder="Search patients..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-64"
                    />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentPatients.map((patient, index) => (
                    <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <Avatar className="w-16 h-16 mx-auto mb-2 bg-green-100">
                            <AvatarFallback className="text-green-600 font-semibold text-lg">
                              {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                          <p className="text-sm text-gray-600">{patient.bloodGroup} • {patient.gender}</p>
                          {patient.hNumber && (
                            <p className="text-xs text-gray-500 mt-1">H No: {patient.hNumber}</p>
                          )}
                        </div>
                        <div className="space-y-2 text-xs text-gray-600">
                          {patient.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {patient.email}
                            </div>
                          )}
                          {patient.homeAddress && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {patient.homeAddress}
                            </div>
                          )}
                          <p className="text-xs font-mono break-all">{patient.address}</p>
                        </div>
                        <div className="mt-3 space-y-2">
                          <Button 
                            className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            onClick={() => {
                              setSelectedPatient(patient.address);
                              loadPatientRecords(patient.address);
                              setActiveTab('consultations');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Records
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                    onClick={async () => {
                              setSelectedPatient(patient.address);
                              await loadPatientRecords(patient.address);
                              setActiveTab('consultations');
                            }}
                          >
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Create Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPatientPages}
                onPageChange={paginatePatients}
                totalItems={filteredPatients.length}
                itemsPerPage={recordsPerPage}
                startIndex={indexOfFirstPatient}
                endIndex={indexOfLastPatient}
                itemName="patients"
              />
            </CardContent>
                              </Card>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-6">
            {/* Create Consultancy Report */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FilePlus className="h-5 w-5 mr-2 text-green-600" />
                      Create Consultancy Report
                    </CardTitle>
                    <CardDescription>Create a new consultation report for a patient</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Patient
                    </label>
                    <div className="relative">
                      <select
                        value={selectedPatient}
                        onChange={async (e) => {
                          const patientAddress = e.target.value;
                          console.log('Selected patient address:', patientAddress);
                          setSelectedPatient(patientAddress);
                          await loadPatientRecords(patientAddress);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Choose a patient...</option>
                        {patients && patients.length > 0 ? (
                          patients.map((patient, index) => {
                            console.log(`Patient ${index}:`, patient);
                            return (
                              <option key={index} value={patient.address}>
                                {patient.name || 'Unknown Patient'} {patient.hNumber ? `(H No. ${patient.hNumber})` : ''}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>Loading patients...</option>
                        )}
                      </select>
                      {patients && patients.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {patients.length} patient(s) found
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis
                    </label>
                    <Input
                      role="doctor"
                      placeholder="Enter diagnosis..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prescription
                    </label>
                    <Input
                      role="doctor"
                      placeholder="Enter prescription..."
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => createConsultancyReport(selectedPatient)}
                  disabled={!selectedPatient || !diagnosis || !prescription}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </CardContent>
            </Card>

            {/* Patient Records */}
            {selectedPatient && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Medical Records */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Medical Records</CardTitle>
                    <CardDescription>Patient's uploaded medical documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentMedicalRecords.length > 0 ? (
                        currentMedicalRecords.map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{record.recordType || 'Medical Record'}</p>
                                <p className="text-sm text-gray-600">
                                  {record.displayDate || 'N/A'} • {record.displayTime || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewReport(record)}
                              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No medical records found</p>
                        </div>
                      )}
                      
                      {patientRecords.length > 0 && (
                        <Pagination
                          currentPage={medicalRecordsPage}
                          totalPages={totalMedicalRecordPages}
                          onPageChange={paginateMedicalRecords}
                          totalItems={patientRecords.length}
                          itemsPerPage={recordsPerPage}
                          startIndex={indexOfFirstMedicalRecord}
                          endIndex={Math.min(indexOfLastMedicalRecord, patientRecords.length)}
                          itemName="medical records"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Diagnostic Reports */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Diagnostic Reports</CardTitle>
                    <CardDescription>Patient's test results and reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentDiagnosticReports.length > 0 ? (
                        currentDiagnosticReports.map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Microscope className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{record.testType || 'Diagnostic Report'}</p>
                                <p className="text-sm text-gray-600">
                                  {record.displayDate || 'N/A'} • {record.displayTime || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewReport(record)}
                              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Microscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No diagnostic reports found</p>
                        </div>
                      )}
                      
                      {patientDiagnosticReports.length > 0 && (
                        <Pagination
                          currentPage={diagnosticReportsPage}
                          totalPages={totalDiagnosticReportPages}
                          onPageChange={paginateDiagnosticReports}
                          totalItems={patientDiagnosticReports.length}
                          itemsPerPage={recordsPerPage}
                          startIndex={indexOfFirstDiagnosticReport}
                          endIndex={Math.min(indexOfLastDiagnosticReport, patientDiagnosticReports.length)}
                          itemName="diagnostic reports"
                        />
                      )}
                    </div>
                  </CardContent>
                  </Card>
              </div>
            )}
          </div>
        )}

        {/* Patient Consultations Tab */}
        {activeTab === 'patient-consultations' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle>Patient Consultations</CardTitle>
                  <CardDescription>View and manage consultations for a specific patient</CardDescription>
                </div>
                
                <div className="flex flex-row items-center gap-2 w-full">
                  {/* Search Bar */}
                  <div className="relative w-1/2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      role="doctor"
                      type="text"
                      placeholder="Search patients..."
                      className="pl-6 h-8 text-xs w-full"
                      value={patientSearch}
                      onChange={(e) => {
                        const searchValue = e.target.value;
                        setPatientSearch(searchValue);
                        // Clear selection if search is empty
                        if (!searchValue.trim()) {
                          setSelectedPatient('');
                        }
                      }}
                    />
                  </div>
                  
                  {/* Patient Dropdown */}
                  <div className="w-1/2">
                    <select
                      className="w-full h-8 px-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                    >
                      <option value="">Select a patient</option>
                      {filteredPatients.map((patient) => (
                          <option key={patient.address} value={patient.address}>
                            {patient.hNumber ? `${patient.name} (H No.: ${patient.hNumber})` : patient.name} - {patient.address.slice(0, 6)}...{patient.address.slice(-4)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {console.log('Selected patient:', selectedPatient, 'Patient details:', patientDetailsMap[selectedPatient])}
              {console.log('All reports:', reports)}
              {console.log('Filtered reports for patient:', reports.filter(report => 
                report.patientAddress && selectedPatient && 
                report.patientAddress.toLowerCase() === selectedPatient.toLowerCase()
              ))}
              {!selectedPatient && patientSearch && filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No patient found matching "{patientSearch}"</p>
                  <p className="text-xs mt-1">Try a different search term or select from the dropdown</p>
                </div>
              )}
              
              {!selectedPatient && !patientSearch && (
                <div className="text-center py-12 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p>Search for a patient to view their consultations</p>
                  <p className="text-xs mt-1">Type in the search box or select from the dropdown</p>
                </div>
              )}
              
              {selectedPatient ? (
                <div className="space-y-4">
                  {(() => {
                    // Process and combine records
                    const filteredReports = reports.filter(report => {
                      if (!selectedPatient) return false;
                      const patientAddress = report.patientAddress ? report.patientAddress.toString() : '';
                      return patientAddress && patientAddress.toLowerCase() === selectedPatient.toLowerCase();
                    });

                    const allRecords = [
                      ...patientRecords.map(record => ({
                        ...record,
                        timestamp: record.timestamp ? parseInt(record.timestamp.toString()) * 1000 : 0,
                        displayDate: record.timestamp ? new Date(parseInt(record.timestamp.toString()) * 1000).toLocaleDateString() : 'N/A',
                        displayTime: record.timestamp ? new Date(parseInt(record.timestamp.toString()) * 1000).toLocaleTimeString() : 'N/A'
                      })),
                      ...filteredReports.map(report => ({
                        ...report,
                        timestamp: report.timestamp ? parseInt(report.timestamp.toString()) * 1000 : 0,
                        displayDate: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleDateString() : 'N/A',
                        displayTime: report.timestamp ? new Date(parseInt(report.timestamp.toString()) * 1000).toLocaleTimeString() : 'N/A'
                      }))
                    ];

                    // If no records found, show message
                    if (allRecords.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500">
                          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No consultation records found for this patient</p>
                        </div>
                      );
                    }

                    // Sort by timestamp in descending order
                    const sortedRecords = [...allRecords].sort((a, b) => b.timestamp - a.timestamp);
                    
                    // Apply pagination
                    const paginatedRecords = sortedRecords.slice(
                      (reportsPage - 1) * recordsPerPage, 
                      reportsPage * recordsPerPage
                    );

                    return paginatedRecords.map((report, index) => (
                      <div key={report.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">
                                {patientDetailsMap[selectedPatient]?.name || 'Patient'}
                                {report.type === 'diagnostic' && ' - Diagnostic Report'}
                              </h3>
                              <span className="text-sm text-gray-500">
                                {patientDetailsMap[selectedPatient]?.hNumber ? 
                                  `(H No.: ${patientDetailsMap[selectedPatient].hNumber})` : 
                                  selectedPatient ? `(H No.: ${selectedPatient.slice(0, 6).toUpperCase()})` : ''
                                }
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {report.displayDate || 'N/A'} • {report.displayTime || 'N/A'}
                            </p>
                            {report.diagnosis && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                                <p className="text-gray-600">{report.diagnosis}</p>
                              </div>
                            )}
                            {report.prescription && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Prescription:</p>
                                <p className="text-gray-600">{report.prescription}</p>
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {report.status || 'Completed'}
                          </Badge>
                        </div>
                      </div>
                    ));
                  })()}
                  
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Please select a patient to view their consultation history</p>
                </div>
              )}
            </CardContent>
            {selectedPatient && reports.filter(report => report.patientAddress && selectedPatient && 
              report.patientAddress.toLowerCase() === selectedPatient.toLowerCase()).length > 0 && (
              <div className="px-6 pb-6">
                <Pagination
                  currentPage={reportsPage}
                  totalPages={Math.ceil(reports.filter(report => 
                    report.patientAddress && selectedPatient && 
                    report.patientAddress.toLowerCase() === selectedPatient.toLowerCase()
                  ).length / recordsPerPage)}
                  onPageChange={paginateReports}
                />
              </div>
            )}
          </Card>
        )}

        {activeTab === 'profile' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your professional information</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {editMode ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditMode(false);
                        setForm(profile);
                      }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleUpdateProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setEditMode(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Input
                    role="doctor"
                    value={form.name || ''}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    disabled={!editMode}
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <Input
                    role="doctor"
                    value={form.specialization || ''}
                    onChange={(e) => setForm({...form, specialization: e.target.value})}
                    disabled={!editMode}
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
                  <Input
                    role="doctor"
                    value={form.hospital || ''}
                    onChange={(e) => setForm({...form, hospital: e.target.value})}
                    disabled={!editMode}
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <Input
                    role="doctor"
                    value={form.department || ''}
                    onChange={(e) => setForm({...form, department: e.target.value})}
                    disabled={!editMode}
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <Input
                    role="doctor"
                    value={form.designation || ''}
                    onChange={(e) => setForm({...form, designation: e.target.value})}
                    disabled={!editMode}
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                  <Input
                    role="doctor"
                    value={form.experience || ''}
                    onChange={(e) => setForm({...form, experience: e.target.value})}
                    disabled={!editMode}
                    type="number"
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    role="doctor"
                    value={form.email || ''}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    disabled={!editMode}
                    type="email"
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <Input
                    role="doctor"
                    value={form.dateOfBirth || ''}
                    onChange={(e) => setForm({...form, dateOfBirth: e.target.value})}
                    disabled={!editMode}
                    type="date"
                    className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Report Viewer Modal */}
      {isViewerOpen && viewingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {viewingReport.recordType || viewingReport.testType || 'Record Details'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsViewerOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* File Preview Section */}
                {viewingReport.fileUrl && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h4>
                    {renderFilePreview(viewingReport.fileUrl)}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {viewingReport.timestamp 
                        ? new Date(Number(viewingReport.timestamp.toString()) * 1000).toLocaleString() 
                        : 'N/A'}
                    </p>
                  </div>
                  
                  {viewingReport.doctorName && (
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-medium">{viewingReport.doctorName}</p>
                    </div>
                  )}
                </div>

                {viewingReport.diagnosis && (
                  <div>
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p className="whitespace-pre-line">{viewingReport.diagnosis}</p>
                  </div>
                )}

                {viewingReport.prescription && (
                  <div>
                    <p className="text-sm text-gray-500">Prescription</p>
                    <p className="whitespace-pre-line">{viewingReport.prescription}</p>
                  </div>
                )}

                {viewingReport.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="whitespace-pre-line">{viewingReport.notes}</p>
                  </div>
                )}

                {viewingReport.testType && (
                  <div>
                    <p className="text-sm text-gray-500">Test Type</p>
                    <p>{viewingReport.testType}</p>
                  </div>
                )}

                {viewingReport.testResults && (
                  <div>
                    <p className="text-sm text-gray-500">Test Results</p>
                    <p className="whitespace-pre-line">{viewingReport.testResults}</p>
                  </div>
                )}

                {viewingReport.attachments && viewingReport.attachments.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Attachments</p>
                    <div className="space-y-2">
                      {viewingReport.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <File className="h-4 w-4 mr-2" />
                          {attachment.name || `Attachment ${idx + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  variant="default"
                  onClick={() => setIsViewerOpen(false)}
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
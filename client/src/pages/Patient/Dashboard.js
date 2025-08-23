import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PatientContract from '../../abis/PatientContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import EHRSystem from '../../abis/EHRSystem.json';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { uploadFile } from '../../services/uploadFile';
import Pagination from '../../components/Pagination';
import {
  User, 
  FileText, 
  Shield, 
  Users, 
  Calendar,
  Heart,
  TrendingUp,
  Bell,
  File,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Stethoscope,
  Microscope,
  Building2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Upload,
  UserPlus,
  UserX,
  MapPin,
  Phone,
  Mail,
  X,
  CalendarDays
} from 'lucide-react';

const PatientDashboard = () => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [diagnosticReports, setDiagnosticReports] = useState([]);
  const [consultationReports, setConsultationReports] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionHistory, setPermissionHistory] = useState([]);
  const [wallet, setWallet] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [customRecordType, setCustomRecordType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [showGrantPermission, setShowGrantPermission] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [grantingPermission, setGrantingPermission] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [diagnosticPage, setDiagnosticPage] = useState(1);
  const [consultationPage, setConsultationPage] = useState(1);
  const [recordsPerPage] = useState(5);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('ehr_user'));
    if (!userData || userData.role !== 'patient') {
      window.location.href = '/login/patient';
      return;
    }
    setUser(userData);
    setWallet(userData.wallet);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (wallet && isConnected) {
      loadPatientData();
      loadDoctors();
    }
  }, [wallet, isConnected]);

  // Function to load permissions separately
  const loadPermissions = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, require('../../abis/DoctorContract.json').abi, signer);
      
      console.log('Refreshing permissions...');
      const patientPermissions = await patientContract.getPermissions(wallet);
      console.log('Refreshed permissions:', patientPermissions);
      
      // Filter active permissions and get doctor details
      const activePermissions = [];
      for (let i = 0; i < patientPermissions.length; i++) {
        const permission = patientPermissions[i];
        if (permission.active) {
          try {
            const doctorData = await doctorContract.doctors(permission.doctor);
            activePermissions.push({
              type: 'doctor',
              address: permission.doctor,
              status: 'active',
              grantedAt: permission.grantedAt,
              doctorName: doctorData.name,
              specialization: doctorData.specialization,
              hospital: doctorData.hospital,
              hNumber: doctorData.hNumber
            });
          } catch (error) {
            console.error('Error loading doctor data for permission:', error);
          }
        }
      }
      
      return activePermissions;
    } catch (error) {
      console.error('Error loading permissions:', error);
      return [];
    }
  };

  const loadPatientData = async () => {
    // Don't prevent re-initialization if called from permission changes
    if (initialized && !permissions.length === 0) return;
    setInitialized(true);
    try {
      console.log('Loading patient data for wallet:', wallet);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, require('../../abis/DoctorContract.json').abi, signer);
      
      // Load permission history from local storage
      const savedPermissionHistory = JSON.parse(localStorage.getItem('permissionHistory') || '[]');
      setPermissionHistory(savedPermissionHistory);
      
      console.log('Getting patient profile...');
      // Get patient profile
      const patientData = await patientContract.patients(wallet);
      console.log('Patient data:', patientData);
      
      console.log('Getting medical records...');
      // Get medical records and sort by timestamp in descending order
      const records = await patientContract.getMedicalRecords(wallet);
      // Create a new array before sorting to avoid modifying the read-only array
      const recordsArray = [...records];
      const sortedRecords = recordsArray.sort((a, b) => 
        Number(b.timestamp) - Number(a.timestamp)
      );
      console.log('Medical records:', sortedRecords);
      setMedicalRecords(sortedRecords);

            // Get diagnostic reports (if any)
      try {
        console.log('Getting diagnostic reports...');
        const diagnosticContract = new ethers.Contract(contractAddresses.DiagnosticContract, require('../../abis/DiagnosticContract.json').abi, signer);
        
        // Debug: Check if the contract has the method
        console.log('Contract methods:', Object.keys(diagnosticContract.functions));
        
        // Try alternative method if getReportsForUser doesn't exist
        let reports = [];
        try {
          reports = await diagnosticContract.getReportsForUser(wallet);
          console.log('Raw reports from getReportsForUser:', reports);
        } catch (err) {
          console.log('getReportsForUser failed, trying alternative approach...', err);
          // Try getting reports by center
          const allReports = await diagnosticContract.getAllReports();
          reports = allReports.filter(report => 
            report.patient && report.patient.toLowerCase() === wallet.toLowerCase()
          );
          console.log('Filtered reports from getAllReports:', reports);
        }
        
        if (!reports || reports.length === 0) {
          console.log('No diagnostic reports found for this wallet');
          setDiagnosticReports([]);
          return;
        }
        
        // Create a new array before sorting to avoid modifying the read-only array
        const reportsArray = [...reports];
        const sortedReports = reportsArray.sort((a, b) => 
          Number(b.timestamp || 0) - Number(a.timestamp || 0)
        );
        console.log('Processed diagnostic reports:', sortedReports);
        setDiagnosticReports(sortedReports);
    } catch (err) {
        console.log('No diagnostic reports found:', err.message);
      }

            // Get consultation reports
      try {
        console.log('Getting consultation reports...');
        const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, require('../../abis/DoctorContract.json').abi, signer);
        
        // Query ConsultancyReportCreated events for this patient
        const filter = doctorContract.filters.ConsultancyReportCreated(null, wallet);
        const events = await doctorContract.queryFilter(filter);
        console.log('Consultation events:', events);
        
        const allConsultations = [];
        const processedReports = new Set(); // To track unique reports
        
        for (const event of events) {
          try {
            const reports = await doctorContract.getConsultancyReportsForPatientByDoctor(event.args.doctor, wallet);
            if (reports && reports.length > 0) {
              reports.forEach(report => {
                // Create a unique key for each report to avoid duplicates
                const reportKey = `${event.args.doctor}-${report.timestamp.toString()}-${report.diagnosis}-${report.prescription}`;
                
                if (!processedReports.has(reportKey)) {
                  processedReports.add(reportKey);
                  allConsultations.push({
                    ...report,
                    doctor: event.args.doctor
                  });
                }
              });
            }
          } catch (error) {
            console.log(`Error getting reports from doctor ${event.args.doctor}:`, error.message);
          }
        }
        
        // Create a new array before sorting to avoid modifying the read-only array
        const consultationsArray = [...allConsultations];
        const sortedConsultations = consultationsArray.sort((a, b) => 
          Number(b.timestamp) - Number(a.timestamp)
        );
        console.log('All consultations:', sortedConsultations);
        setConsultationReports(sortedConsultations);
      } catch (err) {
        console.log('No consultation reports found:', err.message);
        setConsultationReports([]);
      }

      // Load permissions using the dedicated function
      const activePermissions = await loadPermissions();
      setPermissions(activePermissions);

    } catch (err) {
      console.error('Error loading patient data:', err);
      setTxStatus('Error loading data: ' + err.message);
    } finally {
      console.log('Finished loading patient data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ehr_user');
    window.location.href = '/';
  };

  const loadDoctors = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      const doctorContract = new ethers.Contract(contractAddresses.DoctorContract, require('../../abis/DoctorContract.json').abi, signer);
      
      // Get all registered doctors
      const doctorAddresses = await ehrSystem.getAllDoctors();
      const doctorsData = await Promise.all(
        doctorAddresses.map(async (address) => {
          try {
            const doctorData = await doctorContract.doctors(address);
            return {
              address,
              name: doctorData.name,
              specialization: doctorData.specialization,
              hospital: doctorData.hospital,
              department: doctorData.department,
              email: doctorData.email,
              hNumber: doctorData.hNumber
            };
          } catch (error) {
            console.error('Error loading doctor data:', error);
          return null;
          }
        })
      );
      
      setDoctors(doctorsData.filter(doctor => doctor !== null));
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleFileUpload = async () => {
    const finalRecordType = recordType === 'other' ? customRecordType : recordType;
    if (!selectedFile || !finalRecordType) {
      setTxStatus('Please select a file and enter record type');
      return;
    }

    setUploading(true);
    setTxStatus('Uploading file to IPFS...');

    try {
      // Upload file to IPFS
      const ipfsHash = await uploadFile(selectedFile);
      setTxStatus('File uploaded to IPFS. Creating record on blockchain...');

      // Create record on blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);

      const tx = await patientContract.uploadMedicalRecord(ipfsHash, finalRecordType);
      setTxStatus('Transaction submitted. Waiting for confirmation...');

      await tx.wait();
      setTxStatus('Medical record uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setRecordType('');
      setCustomRecordType('');
      
      // Reload data
      loadPatientData();
    } catch (error) {
      console.error('Error uploading medical record:', error);
      if (error.message.includes('Pinata credentials not set')) {
        setTxStatus('Error: Pinata credentials not configured. Please check environment variables.');
      } else {
        setTxStatus('Error uploading record: ' + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleGrantPermission = async (doctorAddress) => {
    setGrantingPermission(true);
    setTxStatus('Granting permission...');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);

      const tx = await patientContract.grantPermission(doctorAddress);
      setTxStatus('Permission transaction submitted. Waiting for confirmation...');

      const receipt = await tx.wait();
      
      // Get doctor name from the list of available doctors
      const doctor = doctors.find(d => d.address.toLowerCase() === doctorAddress.toLowerCase());
      
      // Add to permission history
      const newPermissionEvent = {
        type: 'permission_granted',
        doctorAddress,
        doctorName: doctor ? doctor.name : 'Unknown Doctor',
        timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
        txHash: receipt.transactionHash
      };
      
      const updatedHistory = [newPermissionEvent, ...permissionHistory];
      setPermissionHistory(updatedHistory);
      localStorage.setItem('permissionHistory', JSON.stringify(updatedHistory));
      
      setTxStatus('Permission granted successfully!');
      
      // Force refresh all relevant data
      setPermissions([]); // Clear current permissions to show loading state
      const updatedPermissions = await loadPermissions();
      setPermissions(updatedPermissions);
      setShowGrantPermission(false);
      
      // Also update the overview stats by reloading the full data
      await loadPatientData();
    } catch (error) {
      console.error('Error granting permission:', error);
      setTxStatus('Error granting permission: ' + error.message);
    } finally {
      setGrantingPermission(false);
    }
  };

  const handleRevokePermission = async (doctorAddress) => {
    setGrantingPermission(true);
    setTxStatus('Revoking permission...');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);

      const tx = await patientContract.revokePermission(doctorAddress);
      setTxStatus('Revoke transaction submitted. Waiting for confirmation...');

      const receipt = await tx.wait();
      
      // Get doctor name from the list of available doctors
      const doctor = doctors.find(d => d.address.toLowerCase() === doctorAddress.toLowerCase());
      
      // Add to permission history
      const newRevokeEvent = {
        type: 'permission_revoked',
        doctorAddress,
        doctorName: doctor ? doctor.name : 'Unknown Doctor',
        timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
        txHash: receipt.transactionHash
      };
      
      const updatedHistory = [newRevokeEvent, ...permissionHistory];
      setPermissionHistory(updatedHistory);
      localStorage.setItem('permissionHistory', JSON.stringify(updatedHistory));
      
      setTxStatus('Permission revoked successfully!');
      
      // Reload data
      loadPatientData();
    } catch (error) {
      console.error('Error revoking permission:', error);
      setTxStatus('Error revoking permission: ' + error.message);
    } finally {
      setGrantingPermission(false);
    }
  };

  // Function to get doctor name from address
  const getDoctorName = async (address) => {
    if (!address) return 'Unknown Doctor';
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const doctorContract = new ethers.Contract(
        contractAddresses.DoctorContract, 
        require('../../abis/DoctorContract.json').abi, 
        signer
      );
      const doctor = await doctorContract.doctors(address);
      return doctor.name ? `Dr. ${doctor.name}` : `Dr. ${address.slice(0, 6)}...${address.slice(-4)}`;
    } catch (error) {
      console.error('Error fetching doctor name:', error);
      return `Dr. ${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  };

  // Function to get diagnostic center name from address
  const getDiagnosticCenterName = async (address) => {
    if (!address) return 'Diagnostic Center';
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Use provider instead of signer for read-only operations
      const diagnosticContract = new ethers.Contract(
        contractAddresses.DiagnosticContract, 
        require('../../abis/DiagnosticContract.json').abi, 
        provider
      );
      
      // First try to get the center info using the centers mapping
      try {
        const center = await diagnosticContract.centers(address);
        if (center && center.name) {
          return center.name;
        }
      } catch (e) {
        console.log('Could not fetch center info from mapping, trying getCenter...');
      }
      
      // If that fails, try the getCenter function
      try {
        console.log('Trying to fetch center with getCenter for address:', address);
        const centerInfo = await diagnosticContract.getCenter(address);
        console.log('Received center info:', centerInfo);
        
        // Check different possible name fields
        if (centerInfo) {
          if (centerInfo.name) return centerInfo.name;
          if (centerInfo[1]) return centerInfo[1]; // If using a tuple where name is the second element
          if (centerInfo.centerName) return centerInfo.centerName;
          console.log('Center info found but no name field:', centerInfo);
        }
      } catch (e) {
        console.log('Could not fetch center info from getCenter:', e);
      }
      
      // If all else fails, return the address
      return `Diagnostic Center (${address.slice(0, 6)}...${address.slice(-4)})`;
      
    } catch (error) {
      console.error('Error fetching diagnostic center name:', error);
      return `Diagnostic Center (${address.slice(0, 6)}...${address.slice(-4)})`;
    }
  };

  // Format and combine all records
  const formatRecords = async (records, type, displayType) => {
    const formattedRecords = [];
    
    for (const record of records) {
      // Format timestamp
      const timestamp = Number(record.timestamp || 0) * 1000; // Convert to milliseconds
      const date = new Date(timestamp);
      
      // Format date and time
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      // Get proper display name and source based on record type
      let displayName = displayType;
      let source = null;
      
      if (type === 'medical') {
        displayName = record.recordType || 'Medical Record';
        // Only show source if not uploaded by patient
        if (record.uploadedBy?.toLowerCase() !== wallet?.toLowerCase()) {
          source = await getDoctorName(record.doctor);
        }
      } else if (type === 'diagnostic') {
        displayName = record.testType || 'Diagnostic Report';
        source = await getDiagnosticCenterName(record.diagnosticCenter || record.center);
      } else if (type === 'consultation') {
        displayName = 'Consultation';
        source = await getDoctorName(record.doctor);
      }
      
      formattedRecords.push({
        ...record,
        type,
        displayType: displayName,
        displayDate: formattedDate,
        displayTime: formattedTime,
        timestamp,
        source,
        ipfsHash: record.ipfsHash || null
      });
    }
    
    return formattedRecords;
  };
  
  // State for combined records
  const [allRecords, setAllRecords] = useState([]);
  
  // Update records when data changes
  useEffect(() => {
    const updateRecords = async () => {
      if (!wallet) return;
      
      try {
        const [medical, diagnostic, consultation] = await Promise.all([
          formatRecords(medicalRecords, 'medical', 'Medical Record'),
          formatRecords(diagnosticReports, 'diagnostic', 'Diagnostic Report'),
          formatRecords(consultationReports, 'consultation', 'Consultation')
        ]);
        
        const combined = [...medical, ...diagnostic, ...consultation]
          .sort((a, b) => b.timestamp - a.timestamp);
        
        setAllRecords(combined);
      } catch (error) {
        console.error('Error updating records:', error);
      }
    };
    
    updateRecords();
  }, [medicalRecords, diagnosticReports, consultationReports, wallet]);

  // Combined records are now managed by the useEffect hook above

  // Filter records based on search and type for individual tabs
  const filterRecords = (records, type, searchFields) => {
    return records.filter(record => {
      // Filter by type if not 'all'
      if (filterType !== 'all' && type !== 'all' && record.type !== type) return false;
      
      // Apply search term if provided
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return searchFields.some(field => 
          record[field] && record[field].toString().toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  // Filter records for individual tabs
  const filteredMedicalRecords = filterRecords(
    medicalRecords,
    'medical',
    ['recordType', 'ipfsHash', 'doctor']
  );

  const filteredDiagnosticReports = filterRecords(
    diagnosticReports,
    'diagnostic',
    ['testType', 'center', 'ipfsHash']
  );

  const filteredConsultationReports = filterRecords(
    consultationReports,
    'consultation',
    ['diagnosis', 'prescription', 'doctor']
  );

  // Unified filter for all records
  const filteredRecords = allRecords.filter(record => {
    // Search filter
    if (searchTerm && 
        !record.displayType?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !record.source?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !record.prescription?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filterType !== 'all') {
      const recordTypeLower = record.displayType?.toLowerCase();
      const filterTypeLower = filterType.toLowerCase();
      
      // Map filter types to record types
      const typeMapping = {
        'blood test': ['blood test', 'lab report'],
        'x-ray': ['x-ray', 'imaging'],
        'mri': ['mri', 'imaging'],
        'consultation': ['consultation report', 'consultation'],
        'prescription': ['prescription'],
        'lab report': ['lab report', 'blood test'],
        'imaging': ['imaging', 'x-ray', 'mri'],
        'vaccination': ['vaccination'],
        'surgery': ['surgery'],
        'other': ['other']
      };
      
      const allowedTypes = typeMapping[filterTypeLower] || [filterTypeLower];
      if (!allowedTypes.some(type => recordTypeLower?.includes(type))) {
        return false;
      }
    }
    
    return true;
  });

  // Diagnostic reports pagination
  const indexOfLastDiagnostic = diagnosticPage * recordsPerPage;
  const indexOfFirstDiagnostic = indexOfLastDiagnostic - recordsPerPage;
  const currentDiagnosticReports = filteredDiagnosticReports.slice(indexOfFirstDiagnostic, indexOfLastDiagnostic);
  const totalDiagnosticPages = Math.ceil(filteredDiagnosticReports.length / recordsPerPage);

  const paginateDiagnostic = (pageNumber) => {
    setDiagnosticPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Consultation reports pagination
  const indexOfLastConsultation = consultationPage * recordsPerPage;
  const indexOfFirstConsultation = indexOfLastConsultation - recordsPerPage;
  const currentConsultations = filteredConsultationReports.slice(indexOfFirstConsultation, indexOfLastConsultation);
  const totalConsultationPages = Math.ceil(filteredConsultationReports.length / recordsPerPage);

  const paginateConsultation = (pageNumber) => {
    setConsultationPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    {
      title: "Total Records",
      value: allRecords.length.toString(),
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      change: "All Types",
      changeType: "positive"
    },
    {
      title: "Active Permissions",
      value: permissions && Array.isArray(permissions) ? permissions.length.toString() : "0",
      icon: <Users className="h-6 w-6 text-green-600" />,
      change: "Granted",
      changeType: "positive"
    },
    {
      title: "Consultations",
      value: consultationReports && Array.isArray(consultationReports) ? consultationReports.length.toString() : "0",
      icon: <Stethoscope className="h-6 w-6 text-green-600" />,
      change: "Reports",
      changeType: "neutral"
    },
    {
      title: "Diagnostic Reports",
      value: diagnosticReports && Array.isArray(diagnosticReports) ? diagnosticReports.length.toString() : "0",
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      change: "Reports",
      changeType: "neutral"
    },
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Patient Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Wallet:</span> {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
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
            { id: 'overview', label: 'Overview', icon: <Calendar className="h-4 w-4" /> },
            { id: 'records', label: 'Medical Records', icon: <FileText className="h-4 w-4" /> },
            { id: 'diagnostic', label: 'Diagnostic Reports', icon: <FileText className="h-4 w-4" /> },
            { id: 'consultations', label: 'Consultations', icon: <Stethoscope className="h-4 w-4" /> },
            { id: 'permissions', label: 'Permissions', icon: <Shield className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
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
            {/* Recent Medical Records */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Medical Records</CardTitle>
                    <CardDescription>Your latest medical reports and consultations</CardDescription>
                  </div>
                                    <Button variant="outline" size="sm" onClick={() => setActiveTab('records')} className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.length > 0 ? (
                    medicalRecords.slice(0, 4).map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{record.recordType || 'Medical Record'}</p>
                            <p className="text-sm text-gray-600">
                              {record.timestamp && new Date(Number(record.timestamp.toString()) * 1000).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              IPFS: {record.ipfsHash ? `${record.ipfsHash.slice(0, 6)}...${record.ipfsHash.slice(-4)}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (record.ipfsHash) {
                                window.open(`https://ipfs.io/ipfs/${record.ipfsHash}`, '_blank');
                              }
                            }}
                            disabled={!record.ipfsHash}
                            className="text-xs h-8 px-3 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No medical records found</p>
                    </div>
                  )}
                </div>
              </CardContent>
                  </Card>

            {/* Active Permissions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Permissions</CardTitle>
                    <CardDescription>Healthcare providers with access to your records</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('permissions')} className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {permissions.length > 0 ? (
                    permissions.slice(0, 3).map((permission, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Dr. {permission.doctorName || `${permission.address.slice(0, 6)}...${permission.address.slice(-4)}`}
                            </p>
                            <p className="text-sm text-gray-600">{permission.specialization || 'General'}</p>
                            <p className="text-xs text-gray-500">{permission.hospital || 'Unknown Hospital'}</p>
                            <p className="text-xs text-gray-500">Address: {permission.address}</p>
                            {permission.hNumber && (
                              <p className="text-xs text-gray-500 mt-1">H-Number: {permission.hNumber}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Active
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {permission.grantedAt && new Date(Number(permission.grantedAt.toString()) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No active permissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
      </Card>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 mr-2 text-blue-600" />
                      Upload Medical Record
                    </CardTitle>
                    <CardDescription>Upload your medical documents and reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Record Type
                    </label>
                    <select
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Record Type</option>
                      <option value="blood test">Blood Test</option>
                      <option value="x-ray">X-Ray</option>
                      <option value="mri">MRI</option>
                      <option value="consultation">Consultation</option>
                      <option value="prescription">Prescription</option>
                      <option value="lab report">Lab Report</option>
                      <option value="imaging">Imaging</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="surgery">Surgery</option>
                      <option value="other">Other</option>
                    </select>
                    {recordType === 'other' && (
                      <Input
                        placeholder="Enter custom record type"
                        value={customRecordType}
                        onChange={(e) => setCustomRecordType(e.target.value)}
                        className="w-full mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File
                    </label>
                    <Input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="w-full"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleFileUpload}
                      disabled={uploading || !selectedFile || !(recordType === 'other' ? customRecordType : recordType)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
              Upload Record
                        </>
                      )}
            </Button>
                  </div>
                </div>
              </CardContent>
                  </Card>

            {/* Records List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Records</CardTitle>
                    <CardDescription>All your medical reports and documents</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="blood test">Blood Test</option>
                      <option value="x-ray">X-Ray</option>
                      <option value="mri">MRI</option>
                      <option value="consultation">Consultation</option>
                      <option value="prescription">Prescription</option>
                      <option value="lab report">Lab Report</option>
                      <option value="imaging">Imaging</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="surgery">Surgery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentRecords.length > 0 ? (
                    currentRecords.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            record.type === 'medical' ? 'bg-blue-100' :
                            record.type === 'diagnostic' ? 'bg-purple-100' :
                            record.type === 'consultation' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {record.type === 'medical' ? (
                              <FileText className="h-6 w-6 text-blue-600" />
                            ) : record.type === 'diagnostic' ? (
                              <Microscope className="h-6 w-6 text-purple-600" />
                            ) : record.type === 'consultation' ? (
                              <Stethoscope className="h-6 w-6 text-green-600" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{record.displayType}</p>
                            <div className="flex items-center space-x-2">
                              <CalendarDays className="h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {record.displayDate} • {record.displayTime}
                              </p>
                            </div>
                            {record.source && (
                              <p className="text-xs text-gray-500 truncate">
                                {record.type === 'consultation' ? 'Doctor: ' : 
                                 record.type === 'diagnostic' ? 'Center: ' : 'Source: '}
                                {record.source}
                              </p>
                            )}
                            {record.type === 'consultation' && (
                              <>
                                <p className="text-sm text-gray-600">
                                  <strong>Diagnosis:</strong> {record.diagnosis || 'Not specified'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Prescription:</strong> {record.prescription || 'Not specified'}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {record.ipfsHash ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`https://ipfs.io/ipfs/${record.ipfsHash}`, '_blank')}
                                className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No records found</p>
                    </div>
                  )}
                  
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={paginate}
                    totalItems={filteredRecords.length}
                    itemsPerPage={recordsPerPage}
                    startIndex={indexOfFirstRecord}
                    endIndex={indexOfLastRecord}
                    itemName="records"
                  />
                </div>
              </CardContent>
        </Card>
          </div>
        )}

        {activeTab === 'diagnostic' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Diagnostic Reports</CardTitle>
                  <CardDescription>All diagnostic reports from healthcare providers</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentDiagnosticReports.length > 0 ? (
                  currentDiagnosticReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.testType || 'Diagnostic Report'}</p>
                          <p className="text-sm text-gray-600">
                            {report.timestamp && new Date(Number(report.timestamp.toString()) * 1000).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Center: {report.center || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`https://ipfs.io/ipfs/${report.ipfsHash}`, '_blank')}
                          className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No diagnostic reports found</p>
                  </div>
                )}
                
                <Pagination
                  currentPage={diagnosticPage}
                  totalPages={totalDiagnosticPages}
                  onPageChange={paginateDiagnostic}
                  totalItems={filteredDiagnosticReports.length}
                  itemsPerPage={recordsPerPage}
                  startIndex={indexOfFirstDiagnostic}
                  endIndex={indexOfLastDiagnostic}
                  itemName="reports"
                />
              </div>
            </CardContent>
              </Card>
        )}

        {activeTab === 'consultations' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
                              <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Doctor Consultations</CardTitle>
                    <CardDescription>All consultation reports from doctors</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search consultations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentConsultations.length > 0 ? (
                  currentConsultations.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Stethoscope className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Consultation Report</p>
                            <p className="text-sm text-gray-600">
                              <strong>Diagnosis:</strong> {report.diagnosis || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Prescription:</strong> {report.prescription || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {report.timestamp && new Date(Number(report.timestamp.toString()) * 1000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No consultation reports found</p>
                  </div>
                )}
                
                <Pagination
                  currentPage={consultationPage}
                  totalPages={totalConsultationPages}
                  onPageChange={paginateConsultation}
                  totalItems={filteredConsultationReports.length}
                  itemsPerPage={recordsPerPage}
                  startIndex={indexOfFirstConsultation}
                  endIndex={indexOfLastConsultation}
                  itemName="consultations"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            {/* Available Doctors */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                      Available Doctors
                    </CardTitle>
                    <CardDescription>Grant access to registered healthcare providers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.length > 0 ? (
                    doctors.map((doctor, index) => {
                      const hasPermission = permissions.some(p => p.address === doctor.address);
                      return (
                        <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="text-center mb-3">
                              <Avatar className="w-12 h-12 mx-auto mb-2 bg-blue-100">
                                <AvatarFallback className="text-blue-600 font-semibold">
                                  {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                                </AvatarFallback>
                              </Avatar>
                              <h4 className="font-semibold text-gray-900">{doctor.name || 'Doctor'}</h4>
                              <p className="text-sm text-gray-600">{doctor.specialization}</p>
                              <p className="text-xs text-gray-500">{doctor.hospital}</p>
                              <p className="text-xs text-gray-500">{doctor.department}</p>
                              {doctor.hNumber && (
                                <p className="text-xs text-gray-500 mt-1">H-Number: {doctor.hNumber}</p>
                              )}
                            </div>
                            <div className="space-y-2 text-xs text-gray-600">
                              {doctor.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {doctor.email}
                                </div>
                              )}
                              <p className="text-xs font-mono break-all">{doctor.address}</p>
                            </div>
                            <div className="mt-3">
                              {hasPermission ? (
                                <div className="space-y-2">
                                  <Badge variant="secondary" className="w-full bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Permission Granted
                                  </Badge>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleRevokePermission(doctor.address)}
                                    disabled={grantingPermission}
                                  >
                                    {grantingPermission ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                        Revoking...
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3 mr-1" />
                                        Revoke Permission
                                      </>
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => handleGrantPermission(doctor.address)}
                                  disabled={grantingPermission}
                                >
                                  {grantingPermission ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                      Granting...
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Grant Permission
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </CardContent>
      </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No doctors available</p>
                    </div>
                  )}
                </div>
              </CardContent>
              </Card>

            {/* Active Permissions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Active Permissions
                    </CardTitle>
                    <CardDescription>Healthcare providers with access to your records</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {permissions.length > 0 ? (
                    permissions.map((permission, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Shield className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Dr. {permission.doctorName || `${permission.address.slice(0, 6)}...${permission.address.slice(-4)}`}
                            </p>
                            <p className="text-sm text-gray-600">{permission.specialization || 'General'}</p>
                            <p className="text-xs text-gray-500">{permission.hospital || 'Unknown Hospital'}</p>
                            <p className="text-xs text-gray-500">Address: {permission.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRevokePermission(permission.address)}
                            disabled={grantingPermission}
                            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            {grantingPermission ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                Revoking...
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Revoke
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No active permissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
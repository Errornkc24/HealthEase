import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DiagnosticContract from '../../abis/DiagnosticContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import { uploadFile } from '../../services/uploadFile';
import EHRSystem from '../../abis/EHRSystem.json';
import PatientContract from '../../abis/PatientContract.json';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import Pagination from '../../components/Pagination';
import { 
  Search,
  FileText,
  FilePlus,
  Eye,
  Download,
  Microscope,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Plus,
  LogOut,
  Shield,
  Users,
  Heart,
  Activity,
  TrendingUp,
  Bell,
  Filter,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  Upload,
  FileCheck,
  UserCheck,
  Save,
  X,
  Edit3,
  UserX
} from 'lucide-react';

const DiagnosticDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [reports, setReports] = useState(() => []);
  const [patients, setPatients] = useState([]);
  const [patientDetailsMap, setPatientDetailsMap] = useState({});
  const [testType, setTestType] = useState('');
  const [ipfsFile, setIpfsFile] = useState(null);
  const [txStatus, setTxStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [patientAddr, setPatientAddr] = useState('');
  const [search, setSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [wallet, setWallet] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [recordsPerPage] = useState(5);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('ehr_user'));
    if (!userData || userData.role !== 'diagnostic') {
      window.location.href = '/login/diagnostic';
      return;
    }
    setUser(userData);
    setWallet(userData.wallet);
    setIsConnected(true);
  }, []);

  // Load data when component mounts or when wallet/connection changes
  useEffect(() => {
    if (wallet && isConnected) {
      loadData();
      fetchPatients();
    }
  }, [wallet, isConnected]);

  // Clear patient selection when switching to create-report tab
  useEffect(() => {
    if (activeTab === 'create-report') {
      setPatientAddr('');
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setTxStatus('');
    try {
      console.log('Loading diagnostic center data for wallet:', wallet);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);
      
      console.log('Getting diagnostic center profile...');
      const centerData = await contract.centers(wallet);
      console.log('Center data:', centerData);
      
      const profileData = {
        name: centerData.name,
        location: centerData.location,
        contactNumber: centerData.contactNumber,
        email: centerData.email,
        licenseNumber: centerData.licenseNumber,
        establishedDate: centerData.establishedDate,
        servicesOffered: centerData.servicesOffered
      };
      
      setProfile(profileData);
      setForm(profileData);

      console.log('Getting reports by center...');
      let centerReports = [];
      try {
        const reportsData = await contract.getReportsByCenter(wallet);
        // Ensure we have a valid array and clean up any invalid entries
        if (Array.isArray(reportsData)) {
          centerReports = reportsData
            .filter(report => 
              report && 
              (report.testType || report.patientAddress || report.ipfsHash)
            )
            // Sort by timestamp in descending order (newest first)
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        }
        console.log('Center reports loaded:', centerReports.length);
      } catch (error) {
        console.error('Error loading reports:', error);
        centerReports = [];
      }
      setReports(centerReports);

    } catch (err) {
      console.error('Error loading diagnostic center data:', err);
      setTxStatus('Error loading data: ' + err.message);
    } finally {
      console.log('Finished loading diagnostic center data');
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      console.log('Fetching all patients...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ehrSystem = new ethers.Contract(contractAddresses.EHRSystem, EHRSystem.abi, signer);
      const patientContract = new ethers.Contract(contractAddresses.PatientContract, PatientContract.abi, signer);
      
      // Get all registered patients
      const patientAddresses = await ehrSystem.getAllPatients();
      console.log('Patient addresses:', patientAddresses);
      
      const patientsData = await Promise.all(
        patientAddresses.map(async (address) => {
          try {
            // Get patient data from PatientContract
            const patientData = await patientContract.patients(address);
            console.log('Raw patient data for', address, ':', patientData);
            
            // Extract patient details with proper fallbacks
            const hNumber = patientData.hNumber || patientData[1] || '';
            const name = patientData.name || patientData[2] || 'Unknown Patient';
            const email = patientData.email || patientData[3] || '';
            const bloodGroup = patientData.bloodGroup || patientData[4] || 'N/A';
            const gender = patientData.gender || patientData[5] || 'N/A';
            const homeAddress = patientData.homeAddress || patientData[6] || 'Address not available';
            
            return {
              address,
              hNumber,
              name,
              email,
              bloodGroup,
              gender,
              homeAddress
            };
          } catch (error) {
            console.error('Error loading patient data for address', address, ':', error);
            return null;
          }
        })
      );

      const validPatients = patientsData.filter(patient => patient !== null);
      console.log('Processed patients with full details:', validPatients);
      setPatients(validPatients);
      
      // Create a map of patient details
      const patientDetails = validPatients.reduce((acc, patient) => {
        acc[patient.address] = patient;
        return acc;
      }, {});
      
      console.log('Patient details map:', patientDetails);
      setPatientDetailsMap(patientDetails);
    } catch (error) {
      console.error('Error fetching patients:', error);
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
      const contract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);

      const tx = await contract.updateProfile(
        form.name,
        form.location,
        form.contactNumber,
        form.email,
        form.licenseNumber,
        form.establishedDate
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

  const handleCreateReport = async () => {
    if (!ipfsFile || !testType || !patientAddr) {
      setTxStatus('Please select a file, enter test type, and select a patient');
      return;
    }

    setUploading(true);
    setTxStatus('Uploading file to IPFS...');

    try {
      // Upload file to IPFS
      const ipfsHash = await uploadFile(ipfsFile);
      setTxStatus('File uploaded to IPFS. Creating report on blockchain...');

      // Create report on blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.DiagnosticContract, DiagnosticContract.abi, signer);

      const tx = await contract.createDiagnosticReport(patientAddr, patientAddr, testType, ipfsHash);
      setTxStatus('Transaction submitted. Waiting for confirmation...');

      await tx.wait();
      setTxStatus('Diagnostic report created successfully!');
      
      // Reset form
      setIpfsFile(null);
      setTestType('');
      setPatientAddr('');
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error creating diagnostic report:', error);
      setTxStatus('Error creating report: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Pagination logic for patients
  const filteredPatients = patients
    .filter(patient => {
      if (!patient) return false;
      if (!search) return true;
      
      const searchLower = search.toLowerCase().trim();
      return (
        (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
        (patient.hNumber && patient.hNumber.toString().toLowerCase().includes(searchLower)) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
        (patient.bloodGroup && patient.bloodGroup.toLowerCase().includes(searchLower)) ||
        (patient.address && patient.address.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (!a.name || !b.name) return 0;
      return a.name.localeCompare(b.name);
    });

  const indexOfLastPatient = currentPage * recordsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - recordsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPatientPages = Math.ceil(filteredPatients.length / recordsPerPage);

  const paginatePatients = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  
  // Toggle patient details expansion
  const togglePatientDetails = (patientAddress) => {
    setExpandedPatient(expandedPatient === patientAddress ? null : patientAddress);
  };

  // Format date to readable string
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };
  
  // Function to render file preview based on file type
  const renderFilePreview = (url) => {
    if (!url) return null;
    
    const fileExtension = url.split('.').pop().toLowerCase();
    
    // Add file preview logic here
  };

  // Helper function to convert BigNumber to number
  const toNumber = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (value._isBigNumber) return value.toNumber();
    if (value._hex) return parseInt(value._hex, 16);
    return Number(value) || 0;
  };

  // Convert array-format reports to object format for easier handling
  const processReport = (report) => {
    if (!report) return null;
    
    // If report is already an object, ensure all values are properly converted
    if (typeof report === 'object' && !Array.isArray(report)) {
      return {
        ...report,
        id: report.id ? toNumber(report.id) : 0,
        timestamp: toNumber(report.timestamp)
      };
    }
    
    // Handle array format: [id, diagnosticAddress, patientAddress, testType, ipfsHash, timestamp]
    if (Array.isArray(report) && report.length >= 6) {
      return {
        id: toNumber(report[0]),
        diagnosticAddress: report[1] || '',
        patientAddress: report[2] || '',
        testType: report[3] || 'Unspecified Test',
        ipfsHash: report[4] || '',
        timestamp: toNumber(report[5]),
        // Add raw data for debugging
        _raw: report
      };
    }
    
    return null;
  };
  
  // Process and filter reports
  const filteredReports = reports
    .map(processReport)
    .filter(report => {
      if (!report) return false;
      
      // Get patient address from report
      const reportPatientAddress = report.patientAddress || '';
      
      // Filter by patient if one is selected
      if (patientAddr) {
        if (reportPatientAddress.toLowerCase() !== patientAddr.toLowerCase()) {
          return false;
        }
      }
      
      // Filter by search term if provided
      if (search) {
        const searchTerm = search.toLowerCase();
        const testType = report.testType || '';
        const patientName = patientDetailsMap[reportPatientAddress]?.name || '';
        
        if (!testType.toLowerCase().includes(searchTerm) &&
            !patientName.toLowerCase().includes(searchTerm) &&
            !reportPatientAddress.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by timestamp in descending order (newest first)
      return b.timestamp - a.timestamp;
    })
    .map(report => ({
      ...report,
      // Ensure all numeric values are properly converted
      id: toNumber(report.id),
      timestamp: toNumber(report.timestamp),
      // Add a formatted date string for display
      formattedDate: new Date(toNumber(report.timestamp) * 1000).toLocaleString()
    }));
  
  console.log('Filtered reports:', filteredReports);

  console.log('Filtered reports:', filteredReports);

  // Log patient details for the selected patient
  if (patientAddr) {
    console.log('Patient details for selected address:', patientDetailsMap[patientAddr]);
    console.log('Matching reports count:', filteredReports.length);
    console.log('Sample matching report:', filteredReports[0]);
  }

  const indexOfLastReport = reportsPage * recordsPerPage;
  const indexOfFirstReport = indexOfLastReport - recordsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalReportPages = Math.ceil(filteredReports.length / recordsPerPage);

  const paginateReports = (pageNumber) => {
    setReportsPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    {
      title: "Total Patients",
      value: patients && Array.isArray(patients) ? patients.length.toString() : "0",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      change: "Registered",
      changeType: "positive"
    },
    {
      title: "Reports Created",
      value: reports && Array.isArray(reports) ? reports.length.toString() : "0",
      icon: <FileText className="h-6 w-6 text-green-600" />,
      change: "This month",
      changeType: "positive"
    },
    {
      title: "Center Type",
      value: profile?.servicesOffered ? "Multi-Service" : "Specialized",
      icon: <Microscope className="h-6 w-6 text-purple-600" />,
      change: "Active",
      changeType: "neutral"
    },
    {
      title: "License Status",
      value: profile?.licenseNumber ? "Licensed" : "Pending",
      icon: <FileCheck className="h-6 w-6 text-red-600" />,
      change: "Valid",
      changeType: "positive"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Microscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Diagnostic Center Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Wallet:</span> {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700">
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
            { id: 'reports', label: 'View Reports', icon: <FileText className="h-4 w-4" /> },
            { id: 'create-report', label: 'Create Report', icon: <FilePlus className="h-4 w-4" /> },
            { id: 'patients', label: 'Patients', icon: <Users className="h-4 w-4" /> },
            { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
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
                    <CardTitle>Center Information</CardTitle>
                    <CardDescription>Your diagnostic center details and credentials</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('profile')} className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 bg-purple-100">
                      <AvatarFallback className="text-purple-600 font-semibold text-lg">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : 'D'}
                      </AvatarFallback>
              </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{profile?.name}</h3>
                      <p className="text-sm text-gray-600">Diagnostic Center</p>
                      <p className="text-xs text-gray-500">{profile?.location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">License Number</p>
                      <p className="text-gray-600">{profile?.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Established</p>
                      <p className="text-gray-600">{profile?.establishedDate}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Contact</p>
                      <p className="text-gray-600">{profile?.contactNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{profile?.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Latest diagnostic reports created</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('reports')} className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.length > 0 ? (
                    reports.slice(0, 5).map((report, index) => (
                      <div key={`${report.id || index}-${report.timestamp || ''}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{report.testType || 'Diagnostic Report'}</p>
                            <p className="text-sm text-gray-600">
                              {report.timestamp && new Date(Number(report.timestamp.toString()) * 1000).toLocaleString()}
                              {report.patientAddress && (
                                <span className="block text-xs text-gray-500">
                                  Patient: {patientDetailsMap[report.patientAddress]?.name || 'Unknown'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewReport(report)}
                          className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No reports created yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'reports' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle>Patient Reports</CardTitle>
                  <CardDescription>View and manage diagnostic reports for patients</CardDescription>
                </div>
                
                <div className="flex w-full space-x-2">
                  {/* Search Bar */}
                  <div className="relative w-1/2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      role="diagnostic"
                      type="text"
                      placeholder="Search patients..."
                      className="pl-6 h-8 text-xs w-full"
                      value={patientSearch}
                      onChange={(e) => {
                        const searchValue = e.target.value;
                        setPatientSearch(searchValue);
                        
                        // If search is cleared, clear the selection
                        if (!searchValue.trim()) {
                          setPatientAddr('');
                          return;
                        }
                        
                        // Find matching patients
                        const searchLower = searchValue.toLowerCase().trim();
                        const matchingPatients = patients.filter(patient => 
                          (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
                          (patient.hNumber && patient.hNumber.toLowerCase().includes(searchLower)) ||
                          (patient.address && patient.address.toLowerCase().includes(searchLower))
                        );
                        
                        // Auto-select if there's exactly one match
                        if (matchingPatients.length === 1) {
                          setPatientAddr(matchingPatients[0].address);
                        } else {
                          setPatientAddr('');
                        }
                      }}
                    />
                  </div>
                  
                  {/* Patient Dropdown */}
                  <div className="w-1/2">
                    <select
                      className="w-full h-8 px-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={patientAddr}
                      onChange={(e) => setPatientAddr(e.target.value)}
                    >
                      <option value="">Select a patient</option>
                      {patients
                        .filter(patient => {
                          if (!patientSearch) return true;
                          const searchLower = patientSearch.toLowerCase().trim();
                          return (
                            (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
                            (patient.hNumber && patient.hNumber.toLowerCase().includes(searchLower)) ||
                            (patient.address && patient.address.toLowerCase().includes(searchLower))
                          );
                        })
                        .map((patient) => (
                          <option key={patient.address} value={patient.address}>
                            {patient.name || 'Unknown Patient'} {patient.hNumber ? `(H No.: ${patient.hNumber})` : `(H No.: ${patient.address.slice(0, 6).toUpperCase()})`}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!patientAddr && patientSearch && (
                <div className="text-center py-8 text-gray-500">
                  <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No patient found matching "{patientSearch}"</p>
                  <p className="text-xs mt-1">Try a different search term or select from the dropdown</p>
                </div>
              )}
              
              {patientAddr ? (
                <div className="space-y-6">
                  {/* Patient Info Card */}
                  <Card className="border-0 shadow-sm bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {patientDetailsMap[patientAddr]?.name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900">{patientDetailsMap[patientAddr]?.name || 'Unknown Patient'}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Blood Group: {patientDetailsMap[patientAddr]?.bloodGroup || 'N/A'}</span>
                              <span>DOB: {patientDetailsMap[patientAddr]?.dateOfBirth || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <span>
                                {patientDetailsMap[patientAddr]?.hNumber ? 
                                  `H No.: ${patientDetailsMap[patientAddr]?.hNumber}` : 
                                  `H No.: ${patientAddr?.slice(0, 6).toUpperCase()}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setExpandedPatient(expandedPatient === patientAddr ? null : patientAddr)}
                          className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                        >
                          {expandedPatient === patientAddr ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" /> View Details
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {expandedPatient === patientAddr && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Email</p>
                              <p className="text-gray-600">{patientDetailsMap[patientAddr]?.email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Contact</p>
                              <p className="text-gray-600">{patientDetailsMap[patientAddr]?.contactNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Address</p>
                              <p className="text-gray-600">{patientDetailsMap[patientAddr]?.homeAddress || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Gender</p>
                              <p className="text-gray-600">{patientDetailsMap[patientAddr]?.gender || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reports Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Diagnostic Reports</h3>
                    
                    {/* Reports List */}
                    {filteredReports.length > 0 ? (
                      <div className="space-y-3">
                        {currentReports.map((report, index) => (
                          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                  <div className="p-2 bg-purple-100 rounded-lg mt-1">
                                    <Microscope className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{report.testType || 'Diagnostic Report'}</h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center">
                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                        {formatDate(report.timestamp)}
                                      </span>
                                      <span>Report ID: {report.id || 'N/A'}</span>
                                    </div>
                                    {report.notes && (
                                      <p className="text-sm text-gray-600 mt-2">
                                        {report.notes.length > 150 
                                          ? `${report.notes.substring(0, 150)}...` 
                                          : report.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewReport(report)}
                                    className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                  >
                                    <Eye className="h-4 w-4 mr-1" /> View
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <Pagination
                          currentPage={reportsPage}
                          totalPages={totalReportPages}
                          onPageChange={paginateReports}
                          totalItems={filteredReports.length}
                          itemsPerPage={recordsPerPage}
                          startIndex={indexOfFirstReport}
                          endIndex={Math.min(indexOfLastReport, filteredReports.length)}
                          itemName="reports"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <Microscope className="h-12 w-12 mx-auto text-gray-300" />
                        <h4 className="mt-2 text-sm font-medium text-gray-900">No reports found</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {patientAddr 
                            ? "This patient doesn't have any diagnostic reports yet."
                            : 'Select a patient to view their diagnostic reports.'}
                        </p>
                        {patientAddr && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                            onClick={() => setShowCreateReport(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Create First Report
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No patient selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a patient from the dropdown to view their diagnostic reports.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Report Tab */}
        {activeTab === 'create-report' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle>Create New Diagnostic Report</CardTitle>
                  <CardDescription>Upload test results and create a new diagnostic report for a patient</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Patient Selection with Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Select Patient</label>
                  <div className="flex w-full space-x-2">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input
                        role="diagnostic"
                        type="text"
                        placeholder="Search patients..."
                        className="pl-6 h-10 text-sm w-full"
                        value={patientSearch}
                        onChange={(e) => {
                          const searchValue = e.target.value;
                          setPatientSearch(searchValue);
                          
                          if (!searchValue.trim()) {
                            setPatientAddr('');
                            return;
                          }
                          
                          const searchLower = searchValue.toLowerCase().trim();
                          const matchingPatients = patients.filter(patient => 
                            (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
                            (patient.hNumber && patient.hNumber.toLowerCase().includes(searchLower)) ||
                            (patient.address && patient.address.toLowerCase().includes(searchLower))
                          );
                          
                          if (matchingPatients.length === 1) {
                            setPatientAddr(matchingPatients[0].address);
                          } else {
                            setPatientAddr('');
                          }
                        }}
                      />
                    </div>
                    
                    {/* Patient Dropdown */}
                    <div className="w-1/2">
                      <select
                        className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        value={patientAddr || ''}
                        onChange={(e) => setPatientAddr(e.target.value || '')}
                        required
                      >
                        <option value="">Select a patient</option>
                        {patients
                          .filter(patient => {
                            if (!patientSearch) return true;
                            const searchLower = patientSearch.toLowerCase().trim();
                            return (
                              (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
                              (patient.hNumber && patient.hNumber.toLowerCase().includes(searchLower)) ||
                              (patient.address && patient.address.toLowerCase().includes(searchLower))
                            );
                          })
                          .map((patient) => (
                            <option key={patient.address} value={patient.address}>
                              {patient.name || 'Unknown Patient'} {patient.hNumber ? `(H No.: ${patient.hNumber})` : `(H No.: ${patient.address.slice(0, 6).toUpperCase()})`}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {patientAddr && (
                  <>
                    {/* Patient Info Card */}
                    <Card className="border-0 shadow-sm bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {patientDetailsMap[patientAddr]?.name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900">{patientDetailsMap[patientAddr]?.name || 'Unknown Patient'}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Blood Group: {patientDetailsMap[patientAddr]?.bloodGroup || 'N/A'}</span>
                              <span>DOB: {patientDetailsMap[patientAddr]?.dateOfBirth || 'N/A'}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {patientDetailsMap[patientAddr]?.hNumber ? `H No.: ${patientDetailsMap[patientAddr]?.hNumber}` : `H No.: ${patientAddr.slice(0, 6).toUpperCase()}`}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Report Form */}
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
                          <Input
                            role="diagnostic"
                            placeholder="e.g., Blood Test, X-Ray, MRI"
                            value={testType}
                            onChange={(e) => setTestType(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Report File</label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col w-full h-32 border-2 border-dashed hover:bg-gray-50 hover:border-purple-300 group">
                              <div className="flex flex-col items-center justify-center pt-7">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
                                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-purple-600">
                                  {ipfsFile ? ipfsFile.name : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PDF, DOC, DOCX, JPG, or PNG (MAX. 5MB)
                                </p>
                              </div>
                              <input 
                                type="file" 
                                className="opacity-0" 
                                onChange={(e) => setIpfsFile(e.target.files[0])}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button 
                            onClick={handleCreateReport}
                            disabled={uploading || !ipfsFile || !testType || !patientAddr}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {uploading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading and Creating Report...
                              </div>
                            ) : (
                              'Create Report'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {!patientAddr && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <User className="h-12 w-12 mx-auto text-gray-300" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No patient selected</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Please select a patient to create a diagnostic report
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Patients</CardTitle>
                  <CardDescription>Registered patients in the system</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Input
                    role="diagnostic"
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
                {currentPatients.map((patient, index) => {
                  // Ensure we have valid patient data
                  if (!patient) return null;
                  
                  // Safely get patient details with fallbacks
                  const patientName = patient.name || 'Unknown Patient';
                  const bloodGroup = patient.bloodGroup || 'N/A';
                  const gender = patient.gender || 'N/A';
                  const email = patient.email || 'N/A';
                  const homeAddress = patient.homeAddress || 'N/A';
                  const hNumber = patient.hNumber || patient.address?.slice(0, 6).toUpperCase() || 'N/A';
                  
                  return (
                    <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <Avatar className="w-16 h-16 mx-auto mb-2 bg-purple-100">
                            <AvatarFallback className="text-purple-600 font-semibold text-lg">
                              {patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold text-gray-900">{patientName}</h4>
                          <p className="text-sm text-gray-600">
                            {bloodGroup} • {gender}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">H No.: {hNumber}</p>
                        </div>
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{email}</span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{homeAddress}</span>
                          </div>
                          <div className="pt-1">
                            <p className="text-xs font-mono break-all text-gray-500">{patient.address}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              setPatientAddr(patient.address);
                              setActiveTab('create-report');
                              // Reset the form when creating a new report
                              setTestType('');
                              setIpfsFile(null);
                            }}
                          >
                            <FilePlus className="h-4 w-4 mr-2" />
                            Create Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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

        {activeTab === 'profile' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your diagnostic center information</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {editMode ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditMode(false);
                          setForm(profile);
                        }}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleUpdateProfile}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => setEditMode(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Center Name</label>
                  <Input
                    role="diagnostic"
                    value={form.name || ''}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    disabled={!editMode}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Input
                    role="diagnostic"
                    value={form.location || ''}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    disabled={!editMode}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <Input
                    role="diagnostic"
                    value={form.contactNumber || ''}
                    onChange={(e) => setForm({...form, contactNumber: e.target.value})}
                    disabled={!editMode}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    role="diagnostic"
                    value={form.email || ''}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    disabled={!editMode}
                    type="email"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                  <Input
                    role="diagnostic"
                    value={form.licenseNumber || ''}
                    onChange={(e) => setForm({...form, licenseNumber: e.target.value})}
                    disabled={!editMode}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Established Date</label>
                  <Input
                    role="diagnostic"
                    value={form.establishedDate || ''}
                    onChange={(e) => setForm({...form, establishedDate: e.target.value})}
                    disabled={!editMode}
                    type="date"
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
                  </Card>
        )}
      </div>
    </div>
  );
};

export default DiagnosticDashboard; 
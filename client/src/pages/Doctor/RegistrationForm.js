import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield, 
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Building,
  GraduationCap,
  FileText,
  Wallet
} from 'lucide-react';
import DoctorContract from '../../abis/DoctorContract.json';
import contractAddresses from '../../config/contractAddresses.json';

const DoctorRegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctorName: '',
    hospitalName: '',
  location: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  hNumber: '',
  specialization: '',
  department: '',
  designation: '',
  experience: '',
    licenseNumber: '',
  password: '',
    confirmPassword: ''
  });
  const [wallet, setWallet] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if MetaMask is connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setIsConnected(true);
        }
      });
      
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setIsConnected(true);
        } else {
          setWallet('');
          setIsConnected(false);
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }
    
    try {
      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId);
      
      // Check if we're on the right network (assuming localhost:8545 for development)
      if (chainId !== '0x539' && chainId !== '0x1') { // 1337 for localhost, 1 for mainnet
        setError('Please connect to the correct network (localhost:8545 for development)');
        return;
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      setIsConnected(true);
      setError('');
      console.log('Wallet connected:', accounts[0]);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isConnected) {
      setError('Please connect your MetaMask wallet first.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.hNumber || formData.hNumber.length !== 6) {
      setError('H Number must be exactly 6 digits');
      setLoading(false);
      return;
    }

    if (!formData.doctorName) {
      setError('Doctor name is required');
      setLoading(false);
      return;
    }

    if (!formData.specialization || !formData.licenseNumber) {
      setError('Specialization and license number are required');
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddresses.DoctorContract,
        DoctorContract.abi,
        signer
      );

      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(formData.password));
      const fullName = formData.doctorName;

      const tx = await contract.registerDoctor(
        formData.hNumber,
        fullName,
        formData.hospitalName,
        formData.specialization,
        formData.department,
        formData.designation,
        formData.experience,
        formData.dateOfBirth,
        formData.gender,
        formData.email,
        passwordHash
      );

      await tx.wait();

      // Store user data in localStorage
      const userData = {
        name: fullName,
        wallet: wallet,
        hNumber: formData.hNumber,
        role: 'doctor',
        specialization: formData.specialization,
        hospital: formData.hospital
      };
      
      localStorage.setItem('ehr_user', JSON.stringify(userData));
      navigate('/dashboard/doctor');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('H Number already used')) {
        setError('This H Number is already registered. Please use a different H Number.');
      } else if (err.message.includes('Doctor already exists')) {
        setError('A doctor is already registered with this wallet address.');
      } else if (err.message.includes('execution reverted')) {
        setError('Transaction failed. Please check your input and try again.');
      } else {
        setError(`Registration failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const specializations = [
    'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics',
    'Dermatology', 'Psychiatry', 'Emergency Medicine', 'Family Medicine',
    'Internal Medicine', 'Surgery', 'Radiology', 'Anesthesiology'
  ];

  const benefits = [
    {
      icon: <Stethoscope className="h-5 w-5 text-green-600" />,
      text: "Access comprehensive patient records"
    },
    {
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      text: "Upload and manage medical reports"
    },
    {
      icon: <Shield className="h-5 w-5 text-purple-600" />,
      text: "HIPAA compliant secure access"
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-red-600" />,
      text: "Collaborate with healthcare teams"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Registration Form */}
          <div className="animate-slide-in-left">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Join HealthEase as a Doctor</CardTitle>
                <CardDescription>
                  Register your medical practice to access patient records and collaborate with healthcare teams securely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Wallet Connection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MetaMask Wallet *
                    </label>
                    {isConnected ? (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Wallet className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Connected</p>
                          <p className="text-xs text-green-600">{wallet.slice(0, 6)}...{wallet.slice(-4)}</p>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={connectWallet}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect MetaMask
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor Name *
                    </label>
                    <Input
                      role="doctor"
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleChange}
                      placeholder="Doctor Name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        H Number * (6 digits)
                      </label>
                      <Input
                        role="doctor"
                        name="hNumber"
                        value={formData.hNumber}
                        onChange={handleChange}
                        placeholder="H Number"
                        required
                        className="w-full"
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License Number *
                      </label>
                      <Input
                        role="doctor"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="MD123456"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <Input
                      role="doctor"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      role="doctor"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <select
                      role="doctor"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select your specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital Name
                      </label>
                      <Input
                        role="doctor"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleChange}
                        placeholder="Hospital Name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        role="doctor"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Location"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital/Clinic
                      </label>
                      <Input
                        role="doctor"
                        name="hospital"
                        value={formData.hospital}
                        onChange={handleChange}
                        placeholder="City General Hospital"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <Input
                        role="doctor"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Cardiology"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation
                      </label>
                      <Input
                        role="doctor"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Senior Cardiologist"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <Input
                        role="doctor"
                        name="experience"
                        type="number"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="5"
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        role="doctor"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="dr.johnson@hospital.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        role="doctor"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Input
                        role="doctor"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Input
                        role="doctor"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="font-medium text-green-600 hover:text-green-500">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="font-medium text-green-600 hover:text-green-500">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all"
                    disabled={loading || !isConnected}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <>
                        Create Doctor Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
              </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <a href="/login/doctor" className="font-medium text-green-600 hover:text-green-500">
                        Sign in here
                      </a>
                    </p>
                  </div>

                  {/* Test Contract Connection */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Test Contract Connection:</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const provider = new ethers.providers.Web3Provider(window.ethereum);
                          const signer = provider.getSigner();
                          const contract = new ethers.Contract(
                            contractAddresses.DoctorContract,
                            DoctorContract.abi,
                            signer
                          );
                          console.log('Contract connected successfully:', contract);
                          setError('Contract connection successful! Check console for details.');
                        } catch (err) {
                          console.error('Contract connection failed:', err);
                          setError(`Contract connection failed: ${err.message}`);
                        }
                      }}
                    >
                      Test Contract
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits & Info */}
          <div className="space-y-8 animate-slide-in-right">
            <div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 mb-4">
                <Shield className="h-4 w-4 mr-2" />
                Healthcare Professional Portal
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Advanced Healthcare Management
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join healthcare professionals worldwide who trust HealthEase for secure patient record management, 
                collaboration, and streamlined healthcare workflows.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="p-2 bg-gray-100 rounded-full">
                    {benefit.icon}
                  </div>
                  <span className="text-gray-700">{benefit.text}</span>
                </div>
              ))}
            </div>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Why Healthcare Professionals Choose HealthEase?</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Secure access to patient records</li>
                  <li>• HIPAA compliant platform</li>
                  <li>• Real-time collaboration tools</li>
                  <li>• Advanced analytics and reporting</li>
                </ul>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistrationForm; 
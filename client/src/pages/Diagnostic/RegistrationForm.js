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
  Microscope,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Building,
  FileText,
  BarChart3,
  Wallet
} from 'lucide-react';
import DiagnosticContract from '../../abis/DiagnosticContract.json';
import contractAddresses from '../../config/contractAddresses.json';

const DiagnosticRegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    centerName: '',
    hNumber: '',
  location: '',
    licenseNumber: '',
    centerType: '',
    specialties: '',
  contactNumber: '',
  email: '',
  establishedDate: '',
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

    if (!formData.centerName) {
      setError('Center name is required');
      setLoading(false);
      return;
    }

    if (!formData.licenseNumber) {
      setError('License number is required');
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
        contractAddresses.DiagnosticContract,
        DiagnosticContract.abi,
        signer
      );

      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(formData.password));

      // Convert servicesOffered to array if it's not already
      const servicesOffered = formData.servicesOffered || [];
      
      const tx = await contract.registerDiagnosticCenter(
        formData.hNumber,
        formData.centerName,
        formData.location,
        formData.contactNumber,
        formData.email,
        formData.licenseNumber,
        formData.establishedDate,
        servicesOffered,
        passwordHash
      );

      await tx.wait();

      // Store user data in localStorage
      const userData = {
        name: formData.centerName,
        wallet: wallet,
        hNumber: formData.hNumber,
        role: 'diagnostic',
        type: formData.centerType,
        location: formData.location
      };
      
      localStorage.setItem('ehr_user', JSON.stringify(userData));
      navigate('/dashboard/diagnostic');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('H Number already used')) {
        setError('This H Number is already registered. Please use a different H Number.');
      } else if (err.message.includes('Diagnostic center already exists')) {
        setError('A diagnostic center is already registered with this wallet address.');
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

  const centerTypes = [
    'Laboratory', 'Imaging Center', 'Pathology Lab', 'Radiology Center',
    'Blood Bank', 'Molecular Diagnostics', 'Cytology Lab', 'Histopathology Lab'
  ];

  const benefits = [
    {
      icon: <Microscope className="h-5 w-5 text-purple-600" />,
      text: "Upload diagnostic reports securely"
    },
    {
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      text: "Manage patient test results efficiently"
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-green-600" />,
      text: "Advanced analytics and reporting tools"
    },
    {
      icon: <Shield className="h-5 w-5 text-red-600" />,
      text: "HIPAA compliant data storage"
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
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Microscope className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Register Your Diagnostic Center</CardTitle>
                <CardDescription>
                  Join HealthEase to securely upload diagnostic reports and manage patient test results with advanced analytics.
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
                      Diagnostic Center Name *
                    </label>
                    <Input
                      role="diagnostic"
                      name="centerName"
                      value={formData.centerName}
                      onChange={handleChange}
                      placeholder="City Diagnostic Center"
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
                        role="diagnostic"
                        name="hNumber"
                        value={formData.hNumber}
                        onChange={handleChange}
                        placeholder="123456"
                        required
                        className="w-full"
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number *
                      </label>
                      <Input
                        role="diagnostic"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="DIAG123456"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Center Type *
                    </label>
                    <select
                      name="centerType"
                      value={formData.centerType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select center type</option>
                      {centerTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location/Address
                    </label>
                    <Input
                      role="diagnostic"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="123 Medical Center Dr, City, State"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialties/Services
                    </label>
                    <textarea
                      name="specialties"
                      value={formData.specialties}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Blood tests, X-rays, MRI, CT scans, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <Input
                        role="diagnostic"
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        role="diagnostic"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="info@diagnosticcenter.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Date
                    </label>
                    <Input
                      role="diagnostic"
                      name="establishedDate"
                      type="date"
                      value={formData.establishedDate}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Services Offered
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['X-Ray', 'MRI', 'CT Scan', 'Blood Test', 'Ultrasound', 'ECG', 'Other'].map((service) => (
                        <label key={service} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="specialties"
                            value={service}
                            onChange={(e) => {
                              const currentServices = formData.specialties.split(',').filter(s => s.trim());
                              if (e.target.checked) {
                                currentServices.push(service);
                              } else {
                                const index = currentServices.indexOf(service);
                                if (index > -1) {
                                  currentServices.splice(index, 1);
                                }
                              }
                              setFormData({
                                ...formData,
                                specialties: currentServices.join(', ')
                              });
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Input
                        role="diagnostic"
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
                        role="diagnostic"
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all"
                    disabled={loading || !isConnected}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <>
                        Create Diagnostic Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
              </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <a href="/login/diagnostic" className="font-medium text-purple-600 hover:text-purple-500">
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
                            contractAddresses.DiagnosticContract,
                            DiagnosticContract.abi,
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
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 mb-4">
                <Shield className="h-4 w-4 mr-2" />
                Diagnostic Center Portal
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Streamline Your Diagnostic Operations
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join diagnostic centers worldwide who trust HealthEase for secure report management, 
                patient result tracking, and comprehensive analytics tools.
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

            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Why Diagnostic Centers Choose HealthEase?</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Secure report upload and storage</li>
                  <li>• HIPAA compliant platform</li>
                  <li>• Advanced analytics and insights</li>
                  <li>• Seamless integration with healthcare systems</li>
                </ul>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticRegistrationForm; 
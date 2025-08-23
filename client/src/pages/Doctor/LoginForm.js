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
  Users,
  FileText,
  Wallet
} from 'lucide-react';
import DoctorContract from '../../abis/DoctorContract.json';
import contractAddresses from '../../config/contractAddresses.json';

const DoctorLoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hNumber: '',
    password: ''
  });
  const [wallet, setWallet] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      setIsConnected(true);
      setError('');
    } catch (err) {
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

    if (!formData.hNumber || !formData.password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddresses.DoctorContract,
        DoctorContract.abi,
        provider
      );

      const user = await contract.doctors(wallet);
      
      if (!user.exists) {
        throw new Error('No doctor registered with this wallet address');
      }
      
      if (user.hNumber !== formData.hNumber) {
        throw new Error('Invalid H Number');
      }
      
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(formData.password));
      if (user.passwordHash !== passwordHash) {
        throw new Error('Invalid password');
      }

      // Store user data in sessionStorage (clears when browser is closed)
      const userData = {
        name: user.name,
        wallet: wallet,
        hNumber: formData.hNumber,
        role: 'doctor',
        specialization: user.specialization,
        hospital: user.hospital,
        loginTime: new Date().toISOString()
      };
      
      sessionStorage.setItem('ehr_user', JSON.stringify(userData));
      navigate('/dashboard/doctor');
    } catch (err) {
      setError(err.message);
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

  const features = [
    {
      icon: <Stethoscope className="h-5 w-5 text-blue-600" />,
      text: "Access patient medical records securely"
    },
    {
      icon: <FileText className="h-5 w-5 text-green-600" />,
      text: "Upload and manage medical reports"
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      text: "Collaborate with healthcare teams"
    },
    {
      icon: <Shield className="h-5 w-5 text-red-600" />,
      text: "HIPAA compliant and secure access"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Login Form */}
          <div className="animate-slide-in-left">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Welcome Back, Doctor</CardTitle>
                <CardDescription>
                  Sign in to access patient records and manage your healthcare practice securely.
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
                      MetaMask Wallet
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
                      H Number *
                    </label>
                    <Input
                      role="doctor"
                      name="hNumber"
                      value={formData.hNumber}
                      onChange={handleChange}
                      placeholder="Enter your 6-digit H Number"
                      required
                      className="w-full"
                      maxLength={6}
                    />
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
                        placeholder="Enter your password"
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="font-medium text-green-600 hover:text-green-500">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all"
                    disabled={loading || !isConnected}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <a href="/register/doctor" className="font-medium text-green-600 hover:text-green-500">
                        Register here
                      </a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Features & Info */}
          <div className="space-y-8 animate-slide-in-right">
            <div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 mb-4">
                <Shield className="h-4 w-4 mr-2" />
                Secure Doctor Portal
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Advanced Healthcare Management
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Access comprehensive patient records, manage medical reports, and collaborate 
                with healthcare teams through our secure blockchain-powered platform.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="p-2 bg-gray-100 rounded-full">
                    {feature.icon}
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Need Support?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our technical support team is available 24/7 to assist healthcare professionals.
                </p>
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLoginForm; 
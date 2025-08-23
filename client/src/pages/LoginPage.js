import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  User, 
  Stethoscope, 
  Microscope, 
  ArrowRight,
  Shield,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);

  const roles = [
    {
      title: 'Patient',
      description: 'Access your medical records and manage permissions',
      icon: <User className="h-8 w-8 text-blue-600" />,
      href: '/login/patient',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      title: 'Doctor',
      description: 'View authorized patient records and upload reports',
      icon: <Stethoscope className="h-8 w-8 text-green-600" />,
      href: '/login/doctor',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      title: 'Diagnostic Center',
      description: 'Upload diagnostic reports and manage patient data',
      icon: <Microscope className="h-8 w-8 text-purple-600" />,
      href: '/login/diagnostic',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HealthEase
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to access the secure healthcare platform powered by blockchain technology
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Shield className="h-4 w-4 mr-2" />
            Enterprise-Grade Security
          </Badge>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <Card key={index} className={`border-2 transition-all duration-200 hover:shadow-lg ${role.color}`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {role.icon}
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <CardDescription className="text-sm">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link to={role.href}>
                    Sign In as {role.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose HealthEase?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Blockchain Security</h3>
              <p className="text-gray-600 text-sm">
                Your data is secured with enterprise-grade blockchain technology
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient Control</h3>
              <p className="text-gray-600 text-sm">
                Complete control over who can access your medical records
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Access</h3>
              <p className="text-gray-600 text-sm">
                Access your records anytime, anywhere with secure authentication
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create one now
            </Link>
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/about" className="text-gray-500 hover:text-gray-700 text-sm">
              About Us
            </Link>
            <Link to="/contact" className="text-gray-500 hover:text-gray-700 text-sm">
              Contact Support
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-700 text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
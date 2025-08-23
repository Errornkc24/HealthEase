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
  CheckCircle,
  Star
} from 'lucide-react';

const RegistrationPage = () => {
const roles = [
  {
    title: 'Patient',
      description: 'Create your secure health profile and manage your medical records',
      icon: <User className="h-8 w-8 text-blue-600" />,
      href: '/register/patient',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      features: [
        'Secure medical record storage',
        'Control access permissions',
        'View health history',
        'Share records with providers'
      ]
    },
    {
    title: 'Doctor',
      description: 'Join our network of healthcare providers and access patient records',
      icon: <Stethoscope className="h-8 w-8 text-green-600" />,
      href: '/register/doctor',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      features: [
        'Access authorized patient records',
        'Upload medical reports',
        'Real-time notifications',
        'Secure communication'
      ]
    },
    {
    title: 'Diagnostic Center',
      description: 'Upload diagnostic reports and collaborate with healthcare providers',
      icon: <Microscope className="h-8 w-8 text-purple-600" />,
      href: '/register/diagnostic',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      features: [
        'Upload diagnostic reports',
        'Manage patient data',
        'Collaborate with doctors',
        'Secure file storage'
      ]
    }
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: 'Blockchain Security',
      description: 'Your data is protected with enterprise-grade blockchain technology'
    },
    {
      icon: <Lock className="h-6 w-6 text-green-600" />,
      title: 'Patient Control',
      description: 'Complete control over who can access your medical information'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-purple-600" />,
      title: 'HIPAA Compliant',
      description: 'Fully compliant with healthcare privacy regulations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join HealthEase Today
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of healthcare record management with blockchain-powered security 
            and patient-controlled access
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center mb-8">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Shield className="h-4 w-4 mr-2" />
            Trusted by 10,000+ Healthcare Professionals
          </Badge>
        </div>

        {/* Role Selection Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {roles.map((role, index) => (
            <Card key={index} className={`border-2 transition-all duration-200 hover:shadow-xl ${role.color}`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {role.icon}
                </div>
                <CardTitle className="text-2xl">{role.title}</CardTitle>
                <CardDescription className="text-base">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">What you get:</h4>
                  <ul className="space-y-2">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link to={role.href}>
                    Register as {role.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Healthcare Professionals Choose HealthEase
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-blue-100 text-lg">
              Join thousands of satisfied healthcare professionals and patients
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
                ))}
              </div>
              <p className="text-blue-100 mb-4">
                "HealthEase has revolutionized how I manage patient records. The blockchain security gives me confidence in data integrity."
              </p>
              <div className="font-semibold">Dr. Sarah Johnson</div>
              <div className="text-blue-200 text-sm">Cardiologist</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
                ))}
              </div>
              <p className="text-blue-100 mb-4">
                "I love having complete control over my medical records. The interface is intuitive and the security is top-notch."
              </p>
              <div className="font-semibold">Michael Chen</div>
              <div className="text-blue-200 text-sm">Patient</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
                ))}
              </div>
              <p className="text-blue-100 mb-4">
                "The integration with our existing systems was seamless. Our diagnostic reports are now more accessible and secure."
              </p>
              <div className="font-semibold">Dr. Emily Rodriguez</div>
              <div className="text-blue-200 text-sm">Diagnostic Center Director</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of healthcare professionals and patients who trust HealthEase 
            for their medical record management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register/patient">
                Register as Patient
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
          <p className="text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
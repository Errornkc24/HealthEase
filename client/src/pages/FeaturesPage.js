import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Database, 
  Users, 
  Lock, 
  Eye, 
  FileText, 
  Bell, 
  Search,
  BarChart3,
  Zap,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Award
} from 'lucide-react';

const FeaturesPage = () => {
  const mainFeatures = [
    {
      icon: <Shield className="h-12 w-12 text-blue-600" />,
      title: "Blockchain Security",
      description: "Enterprise-grade blockchain technology ensures your medical data is tamper-proof and secure.",
      features: [
        "Immutable audit trails",
        "Cryptographic verification",
        "Decentralized storage",
        "Zero-knowledge proofs"
      ]
    },
    {
      icon: <Database className="h-12 w-12 text-green-600" />,
      title: "IPFS Storage",
      description: "Decentralized file storage with redundant backups and global accessibility.",
      features: [
        "Distributed file system",
        "Automatic redundancy",
        "Global CDN access",
        "Version control"
      ]
    },
    {
      icon: <Users className="h-12 w-12 text-purple-600" />,
      title: "Role-Based Access",
      description: "Granular permissions for patients, doctors, and diagnostic centers.",
      features: [
        "Patient-controlled access",
        "Time-limited permissions",
        "Audit logging",
        "Emergency access protocols"
      ]
    }
  ];

  const securityFeatures = [
    {
      icon: <Lock className="h-8 w-8 text-red-600" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using AES-256 encryption."
    },
    {
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      title: "Privacy Controls",
      description: "Patients have complete control over who can access their medical records."
    },
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: "Audit Trails",
      description: "Complete logging of all access attempts and data modifications."
    },
    {
      icon: <Bell className="h-8 w-8 text-purple-600" />,
      title: "Real-time Alerts",
      description: "Instant notifications for any unauthorized access attempts."
    }
  ];

  const platformFeatures = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Advanced Search",
      description: "Powerful search capabilities across all medical records and reports."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and insights for healthcare providers."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Real-time Sync",
      description: "Instant synchronization across all devices and platforms."
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "Global Access",
      description: "Access your records from anywhere in the world, 24/7."
    }
  ];

  const mobileFeatures = [
    {
      icon: <Smartphone className="h-8 w-8 text-blue-600" />,
      title: "Mobile App",
      description: "Native mobile applications for iOS and Android devices."
    },
    {
      icon: <Zap className="h-8 w-8 text-green-600" />,
      title: "Offline Access",
      description: "Access critical medical information even without internet connection."
    },
    {
      icon: <Bell className="h-8 w-8 text-purple-600" />,
      title: "Push Notifications",
      description: "Instant notifications for important updates and alerts."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Biometric Security",
      description: "Fingerprint and face recognition for secure mobile access."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-6 animate-fade-in">
            <Award className="h-4 w-4 mr-2" />
            Enterprise-Grade Features
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-slide-up">
            Powerful Features for
            <span className="text-white"> Modern Healthcare</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 animate-fade-in-delay">
            Discover the comprehensive suite of features designed to revolutionize healthcare record management 
            with blockchain security, patient control, and seamless collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Core Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
              Built with cutting-edge technology to provide the most secure and efficient 
              healthcare record management system.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up hover-lift" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Advanced Security Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
              Multiple layers of security to protect your sensitive medical information.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Platform Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
              Powerful tools and features to streamline healthcare workflows.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Mobile Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
              Access your healthcare records on the go with our powerful mobile applications.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mobileFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-fade-in-delay">
            Join thousands of healthcare professionals who trust HealthEase for their medical record management needs.
          </p>
          <div className="flex justify-center animate-slide-up">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;

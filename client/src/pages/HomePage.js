import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  Shield, 
  Database, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Phone,
  Mail,
  MapPin,
  Activity
} from 'lucide-react';

const HomePage = () => {
const features = [
  {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Blockchain Security",
      description: "Your medical data is secured with enterprise-grade blockchain technology, ensuring complete privacy and control."
    },
    {
      icon: <Database className="h-8 w-8 text-green-600" />,
      title: "Decentralized Storage",
      description: "Medical records stored on IPFS with redundant backups, accessible anytime, anywhere."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Role-Based Access",
      description: "Granular permissions for patients, doctors, and diagnostic centers with full audit trails."
    }
  ];

  const [activeDashboard, setActiveDashboard] = React.useState(0);
  
  const dashboards = [
    {
      type: 'patient',
      title: 'For Patients',
      description: 'Take control of your health',
      icon: <Heart className="h-4 w-4 text-white" />,
      bgColor: 'bg-blue-500',
      features: [
        'View your complete medical history',
        'Schedule and manage appointments',
        'Access test results instantly',
        'Share records securely with doctors'
      ]
    },
    {
      type: 'doctor',
      title: 'For Doctors',
      description: 'Streamlined patient care',
      icon: <Users className="h-4 w-4 text-white" />,
      bgColor: 'bg-green-500',
      features: [
        'Access patient records instantly',
        'Write and share prescriptions',
        'View test results and medical history',
        'Collaborate with other specialists'
      ]
    },
    {
      type: 'diagnostic',
      title: 'For Diagnostic Centers',
      description: 'Efficient test management',
      icon: <Activity className="h-4 w-4 text-white" />,
      bgColor: 'bg-purple-500',
      features: [
        'Upload and manage test results',
        'Share reports with doctors',
        'Track test status in real-time',
        'Maintain secure patient records'
      ]
    }
  ];

  // Rotate dashboards every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveDashboard((prev) => (prev + 1) % dashboards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [dashboards.length]);

  const stats = [
    { number: "10K+", label: "Patients Served", icon: <Heart className="h-6 w-6" /> },
    { number: "500+", label: "Healthcare Providers", icon: <Users className="h-6 w-6" /> },
    { number: "50K+", label: "Records Secured", icon: <Shield className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <CheckCircle className="h-6 w-6" /> }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      content: "HealthEase has revolutionized how I manage patient records. The blockchain security gives me confidence in data integrity.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Patient",
      content: "I love having complete control over my medical records. The interface is intuitive and the security is top-notch.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Diagnostic Center Director",
      content: "The integration with our existing systems was seamless. Our diagnostic reports are now more accessible and secure.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 animate-fade-in">
                <Award className="h-4 w-4 mr-2" />
                Trusted by 10,000+ Healthcare Professionals
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight animate-slide-up">
                The Future of
                <span className="text-white"> Healthcare</span>
                <br />
                is Here
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl animate-fade-in-delay">
                Experience the next generation of electronic health records with blockchain-powered security, 
                decentralized storage, and patient-controlled access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up-delay">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative w-full max-w-3xl mx-auto animate-float">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Live Demo</span>
                    </div>
                    <div className="flex space-x-1">
                      {dashboards.map((_, index) => (
                        <button 
                          key={index}
                          onClick={() => setActiveDashboard(index)}
                          className={`w-2 h-2 rounded-full transition-all ${activeDashboard === index ? 'bg-white w-6' : 'bg-white/30'}`}
                          aria-label={`View ${dashboards[index].type} dashboard`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative h-64 overflow-hidden">
                    {dashboards.map((dashboard, index) => (
                      <div 
                        key={dashboard.type}
                        className={`absolute inset-0 transition-opacity duration-1000 ${activeDashboard === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      >
                        <div className="bg-white/5 rounded-lg p-4 h-full flex flex-col">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`${dashboard.bgColor} w-10 h-10 rounded-full flex items-center justify-center`}>
                              {dashboard.icon}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{dashboard.title}</div>
                              <div className="text-sm text-blue-200">{dashboard.description}</div>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-200 flex-grow">
                            {dashboard.features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600 transform hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Why Choose HealthEase?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
              Built with cutting-edge technology to provide the most secure and efficient 
              healthcare record management system.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by healthcare professionals and patients worldwide
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
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
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-fade-in-delay">
            Join thousands of healthcare professionals and patients who trust HealthEase 
            for their medical record management needs.
          </p>
          <div className="flex justify-center animate-slide-up">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 
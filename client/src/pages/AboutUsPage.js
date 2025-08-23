import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Code2, 
  LayoutDashboard,
  HeartPulse,
  Award,
  Star,
  ArrowRight,
  ShieldCheck,
  Lock,
  FileText,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const team = [
  { 
    name: 'Nirav Changela', 
    role: 'Lead Developer', 
    desc: 'Blockchain and AI Developer. Specializes in smart contract development and machine learning integration for healthcare applications.',
    expertise: ['Blockchain', 'AI/ML', 'Smart Contracts']
  },
  { 
    name: 'Kashish Golwala', 
    role: 'Project Manager', 
    desc: 'Manages research and development, UI/UX design, and ensures project milestones are met with high quality standards.',
    expertise: ['Project Management', 'UI/UX', 'Research']
  },
  { 
    name: 'Keval Dhabalia', 
    role: 'Web Designer', 
    desc: 'UI/UX Designer responsible for creating intuitive and responsive interfaces for all user roles in the platform.',
    expertise: ['UI/UX Design', 'Frontend', 'User Research']
  }
];

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
    title: "Secure by Design",
    description: "Built with blockchain technology to ensure data integrity and security."
  },
  {
    icon: <Lock className="h-8 w-8 text-purple-600" />,
    title: "Privacy First",
    description: "Patients have full control over their medical records and who can access them."
  },
  {
    icon: <Users className="h-8 w-8 text-green-600" />,
    title: "Collaborative Care",
    description: "Seamless sharing between patients and healthcare providers when authorized."
  }
];

function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-6">
              <Award className="h-4 w-4 mr-2" />
              Revolutionizing Healthcare with Blockchain
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-200">Health-Ease</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              We're building a secure, transparent, and patient-centric healthcare data management system powered by blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/features">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 ml-2">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600">
              To empower patients with control over their medical records while enabling secure and efficient sharing with healthcare providers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate individuals working together to transform healthcare technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                      <span className="text-xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className="text-blue-600">{member.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{member.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience the future of healthcare?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join thousands of patients and healthcare providers who trust Health-Ease with their medical records.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AboutUsPage;
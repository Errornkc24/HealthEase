import React from 'react';
import { Shield, Lock, Key, Database, Server, Users, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: <Lock className="h-8 w-8 text-blue-500" />,
      title: "End-to-End Encryption",
      description: "All health data is encrypted both in transit and at rest using industry-standard AES-256 encryption."
    },
    {
      icon: <Key className="h-8 w-8 text-green-500" />,
      title: "Blockchain Technology",
      description: "Leveraging blockchain for immutable record-keeping and secure data transactions."
    },
    {
      icon: <Database className="h-8 w-8 text-purple-500" />,
      title: "Decentralized Storage",
      description: "Patient data is stored in a decentralized manner to prevent single points of failure."
    },
    {
      icon: <Server className="h-8 w-8 text-red-500" />,
      title: "Secure Infrastructure",
      description: "Our infrastructure is hosted on secure, SOC 2 compliant cloud providers with regular security audits."
    },
    {
      icon: <Users className="h-8 w-8 text-yellow-500" />,
      title: "Role-Based Access Control",
      description: "Granular permission system to ensure only authorized personnel can access sensitive data."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />,
      title: "Compliance",
      description: "Fully compliant with HIPAA, GDPR, and other relevant healthcare data protection regulations."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Security at HealthEase</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We take the security and privacy of your health data extremely seriously. Our platform is built with multiple layers of protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Security Practices</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Encryption</h3>
              <p className="text-gray-600">All sensitive data is encrypted using AES-256 encryption, both in transit and at rest. We use industry-standard protocols like TLS 1.3 for secure data transmission.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Control</h3>
              <p className="text-gray-600">Strict role-based access controls ensure that only authorized personnel can access specific types of data. Multi-factor authentication is required for all administrative access.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Regular Audits</h3>
              <p className="text-gray-600">We conduct regular security audits and penetration testing to identify and address potential vulnerabilities in our system.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance</h3>
              <p className="text-gray-600">Our platform is designed to comply with healthcare regulations including HIPAA, GDPR, and other relevant data protection laws.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Have security concerns?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're committed to transparency about our security practices. If you have any questions or concerns, please don't hesitate to contact our security team.
          </p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Contact Security Team
          </button>
        </div>
      </div>
    </div>
  );
}

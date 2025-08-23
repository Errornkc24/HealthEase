import React from 'react';
import { Shield, Lock, User, Server, Mail, Clock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Last Updated: August 22, 2024</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <p className="text-gray-600 mb-6">
                At HealthEase, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>
            </div>

            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-6 w-6 text-blue-600 mr-2" />
                  1. Information We Collect
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">We collect several types of information from and about users of our website, including:</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Personal identification information (name, email, phone number, etc.)</li>
                    <li>Health and medical information you provide</li>
                    <li>Demographic information</li>
                    <li>Usage data and analytics</li>
                    <li>Cookies and tracking technologies data</li>
                  </ul>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Server className="h-6 w-6 text-blue-600 mr-2" />
                  2. How We Use Your Information
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">We may use the information we collect for various purposes, including to:</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Provide, operate, and maintain our services</li>
                    <li>Process your transactions and manage your orders</li>
                    <li>Improve, personalize, and expand our services</li>
                    <li>Understand and analyze how you use our services</li>
                    <li>Develop new products, services, features, and functionality</li>
                    <li>Communicate with you for customer service and support</li>
                    <li>Send you updates and other information</li>
                  </ul>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-blue-600 mr-2" />
                  3. Data Security
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  4. Data Retention
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-2" />
                  5. Contact Us
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p className="text-gray-600">
                    Email: privacy@healthease.com<br />
                    Address: Charusat University, Changa, Gujarat, India
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

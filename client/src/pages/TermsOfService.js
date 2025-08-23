import React from 'react';
import { FileText, AlertCircle, BookOpen, Shield, User, Mail } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-xl text-gray-600">Last Updated: August 22, 2024</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <p className="text-gray-600 mb-6">
                Welcome to HealthEase. These Terms of Service ("Terms") govern your access to and use of the HealthEase platform. Please read these Terms carefully before using our services.
              </p>
            </div>

            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                  1. Acceptance of Terms
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    By accessing or using the HealthEase platform, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our services.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-6 w-6 text-blue-600 mr-2" />
                  2. User Accounts
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    To access certain features of our services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  3. Privacy and Data Protection
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our services, you agree to our collection and use of your information as described in our Privacy Policy.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-6 w-6 text-blue-600 mr-2" />
                  4. Medical Disclaimer
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    The information provided through our services is for informational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    The HealthEase platform and its original content, features, and functionality are owned by HealthEase and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    In no event shall HealthEase, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-2" />
                  7. Contact Us
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <p className="text-gray-600">
                    Email: legal@healthease.com<br />
                    Address: Charusat University, Changa, Gujarat, India
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                These Terms of Service may be updated from time to time. We will notify you of any changes by posting the new Terms of Service on this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

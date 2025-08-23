import React from 'react';
import { Cookie, Shield, Settings, User, Clock, Mail } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Cookie className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-xl text-gray-600">Last Updated: August 22, 2024</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <p className="text-gray-600 mb-6">
                This Cookie Policy explains how HealthEase ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website or use our services.
              </p>
            </div>

            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Cookie className="h-6 w-6 text-blue-600 mr-2" />
                  1. What Are Cookies?
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owners.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  2. How We Use Cookies
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">We use cookies for several purposes, including:</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li><strong>Essential Cookies:</strong> These are necessary for the website to function and cannot be switched off.</li>
                    <li><strong>Performance Cookies:</strong> These help us understand how visitors interact with our website.</li>
                    <li><strong>Functionality Cookies:</strong> These enable enhanced functionality and personalization.</li>
                    <li><strong>Targeting/Advertising Cookies:</strong> These may be set through our site by our advertising partners.</li>
                  </ul>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-6 w-6 text-blue-600 mr-2" />
                  3. Managing Cookies
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience and/or prevent you from using certain features of our website.
                  </p>
                  <p className="text-gray-600">
                    You can find more information about how to manage cookies for popular browsers at the following links:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
                    <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:underline">Apple Safari</a></li>
                    <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
                  </ul>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  4. How Long Will Cookies Stay on My Device?
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    The length of time a cookie will stay on your computer or mobile device depends on whether it is a "persistent" or "session" cookie. Session cookies will only stay on your device until you close your browser. Persistent cookies stay on your device until they expire or are deleted.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-6 w-6 text-blue-600 mr-2" />
                  5. Third-Party Cookies
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    We may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on. These cookies may be used when you share information using a social media sharing button or "like" button on our site.
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-2" />
                  6. Contact Us
                </h2>
                <div className="ml-8 space-y-4">
                  <p className="text-gray-600">
                    If you have any questions about our use of cookies or other technologies, please contact us at:
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
                This Cookie Policy may be updated from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

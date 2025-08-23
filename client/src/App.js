import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import PatientRegistrationForm from './pages/Patient/RegistrationForm';
import DoctorRegistrationForm from './pages/Doctor/RegistrationForm';
import DiagnosticRegistrationForm from './pages/Diagnostic/RegistrationForm';
import PatientLoginForm from './pages/Patient/LoginForm';
import DoctorLoginForm from './pages/Doctor/LoginForm';
import DiagnosticLoginForm from './pages/Diagnostic/LoginForm';
import PatientDashboard from './pages/Patient/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';
import DiagnosticDashboard from './pages/Diagnostic/Dashboard';
import TestPage from './pages/TestPage';
import SecurityPage from './pages/SecurityPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import Footer from './components/Footer';
import { ThemeProvider, THEME_MODES } from './contexts/ThemeContext';
import './index.css';

function App() {
  // Apply theme class on initial render
  useEffect(() => {
    const storedTheme = localStorage.getItem('themeMode') || 'gradient';
    document.documentElement.classList.add(storedTheme);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-16 lg:pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/register/patient" element={<PatientRegistrationForm />} />
              <Route path="/register/doctor" element={<DoctorRegistrationForm />} />
              <Route path="/register/diagnostic" element={<DiagnosticRegistrationForm />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/patient" element={<PatientLoginForm />} />
              <Route path="/login/doctor" element={<DoctorLoginForm />} />
              <Route path="/login/diagnostic" element={<DiagnosticLoginForm />} />
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
              <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
              <Route path="/dashboard/diagnostic" element={<DiagnosticDashboard />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

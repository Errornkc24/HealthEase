import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
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
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';

function AppContent() {
  const { theme } = useTheme();

  return (
    <Box className={`theme-${theme}`} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
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
        </Routes>
        <Footer />
      </Router>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

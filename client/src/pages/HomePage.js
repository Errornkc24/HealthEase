import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SecurityIcon from '@mui/icons-material/Security';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: <MedicalServicesIcon fontSize="large" color="primary" />,
    title: 'Decentralized Health Records',
    desc: 'Your medical data is secure, private, and accessible only to you and your authorized providers.'
  },
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: 'Blockchain Security',
    desc: 'All records and permissions are managed on-chain for maximum trust and transparency.'
  },
  {
    icon: <CloudUploadIcon fontSize="large" color="primary" />,
    title: 'Easy File Uploads',
    desc: 'Upload and access medical records anytime, anywhere, with IPFS-backed storage.'
  }
];

function HomePage() {
  const { theme } = useTheme();
  return (
    <PageContainer sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh', pb: 0 }}>
      {/* Hero Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6, mb: 8 }}>
        <MedicalServicesIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: 'var(--color-primary)', letterSpacing: 1, textAlign: 'center' }}>
          MedBlock Connect
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: 'var(--color-text-secondary)', maxWidth: 700, textAlign: 'center' }}>
          The next generation of secure, decentralized electronic health records. Empowering patients, doctors, and diagnostics with blockchain technology.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" color="primary" size="large" component={Link} to="/register" sx={{ boxShadow: 4, fontWeight: 700, px: 4, py: 1.5, borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }} aria-label="Get Started">
            Get Started
          </Button>
          <Button variant="outlined" color="primary" size="large" component={Link} to="/about" sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }} aria-label="Learn More">
            Learn More
          </Button>
        </Box>
      </Box>
      {/* Feature Cards Row */}
      <Grid container spacing={6} justifyContent="center" alignItems="stretch" sx={{ mb: 10 }}>
        {features.map((f, i) => (
          <Grid item xs={12} md={4} key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
            <SectionCard icon={f.icon} title={f.title} description={f.desc} />
          </Grid>
        ))}
      </Grid>
    </PageContainer>
  );
}

export default HomePage; 
import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import BlockchainIcon from '@mui/icons-material/AccountBalanceWallet';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import TeamMemberCard from '../components/TeamMemberCard';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: <SecurityIcon color="primary" fontSize="large" />,
    title: 'Security First',
    desc: 'All records and permissions are managed on-chain for maximum trust and privacy.'
  },
  {
    icon: <BlockchainIcon color="primary" fontSize="large" />,
    title: 'Blockchain Powered',
    desc: 'Built on Ethereum and IPFS for decentralized, tamper-proof data storage.'
  },
  {
    icon: <GroupIcon color="primary" fontSize="large" />,
    title: 'User Empowerment',
    desc: 'Patients control their data and permissions, with a seamless experience for all users.'
  }
];

const team = [
  { name: 'Your Name', role: 'Lead Developer', avatar: '', desc: 'Blockchain & Full Stack Developer.' },
  // Add more team members as needed
];

function AboutUsPage() {
  const { theme } = useTheme();
  return (
    <PageContainer sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh', pb: 0 }}>
      {/* Hero Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6, mb: 8 }}>
        <MedicalServicesIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: 'var(--color-primary)', letterSpacing: 1, textAlign: 'center' }}>
          About MedBlock Connect
      </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: 'var(--color-text-secondary)', maxWidth: 700, textAlign: 'center' }}>
        MedBlock Connect is a decentralized electronic health record platform built on blockchain technology. Our mission is to empower patients, doctors, and diagnostic centers with secure, transparent, and user-friendly healthcare data management.
      </Typography>
      </Box>
      {/* Feature Cards Row */}
      <Grid container spacing={6} justifyContent="center" alignItems="stretch" sx={{ mb: 10 }}>
        {features.map((f, i) => (
          <Grid item xs={12} md={4} key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
            <SectionCard icon={f.icon} title={f.title} description={f.desc} />
        </Grid>
        ))}
      </Grid>
      {/* Team Section */}
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>Our Team</Typography>
      <Grid container spacing={6} justifyContent="center" alignItems="stretch" sx={{ mb: 10 }}>
        {team.map((member, i) => (
          <Grid item xs={12} md={4} key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
            <TeamMemberCard member={member} />
          </Grid>
        ))}
      </Grid>
    </PageContainer>
  );
}

export default AboutUsPage; 
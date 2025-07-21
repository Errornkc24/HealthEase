import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => (
  <Box sx={{ width: '100%', background: 'var(--color-bg)', color: 'var(--color-text)', py: 3, px: 2, mt: 'auto', boxShadow: '0 -4px 24px 0 rgba(80,80,120,0.18)', borderTop: '1.5px solid #b6d0f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, backdropFilter: 'blur(8px)', textShadow: '0 1px 4px rgba(255,255,255,0.2)' }}>
    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
      © {new Date().getFullYear()} HealthEase
    </Typography>
    <Typography variant="body2" sx={{ opacity: 0.85 }}>
      Built with ❤️ using React, MUI, and Ethereum
    </Typography>
  </Box>
);

export default Footer;
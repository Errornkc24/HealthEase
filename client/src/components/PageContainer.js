import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const PageContainer = ({ children, sx }) => {
  const { theme } = useTheme();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'var(--color-bg)',
        background:
          theme === 'gradient'
            ? 'linear-gradient(140deg, #8bb6f9 0%, #6be7c1 50%, #e6b6ff 100%)'
            : 'none',
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        px: { xs: 1, sm: 3, md: 6 },
        py: { xs: 2, sm: 4, md: 6 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer; 
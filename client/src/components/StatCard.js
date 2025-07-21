import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const StatCard = ({ icon, label, value, color, gradient }) => {
  const { theme } = useTheme();
  return (
    <Card elevation={4} sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      background: theme === 'dark' ? '#223a5f' : (gradient || `linear-gradient(135deg, ${color}22 0%, #fff 100%)`),
      color: theme === 'dark' ? '#fff' : 'inherit',
      borderRadius: 3,
      minWidth: 180,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'scale(1.04)',
        boxShadow: 8,
      },
    }}>
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: theme === 'dark' ? '#fff' : 'text.secondary' }}>{label}</Typography>
      </Box>
    </Card>
  );
};

export default StatCard; 
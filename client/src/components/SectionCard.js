import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const SectionCard = ({ icon, title, description, children, sx }) => (
  <Card
    elevation={6}
    sx={{
      borderRadius: 4,
      minWidth: 280,
      maxWidth: 400,
      margin: '0 auto',
      background: 'linear-gradient(120deg, #f9f9f9 0%, #e3f0ff 100%)',
      transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
      '&:hover': {
        transform: 'scale(1.04)',
        boxShadow: 12,
        background: 'linear-gradient(120deg, #e3f0ff 0%, #b6e0fe 100%)',
      },
      p: 2,
      ...sx,
    }}
  >
    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {icon && <Box sx={{ mb: 1 }}>{icon}</Box>}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
      <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>{description}</Typography>
      {children}
    </CardContent>
  </Card>
);

export default SectionCard; 
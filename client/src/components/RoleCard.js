import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

const RoleCard = ({ icon, title, description, onClick, selected, color, gradient, sx }) => (
  <Card elevation={selected ? 8 : 3} sx={{
    borderRadius: 4,
    minWidth: 280,
    maxWidth: 400,
    margin: '0 auto',
    background: selected ? (gradient || color || 'background.paper') : (gradient || color || 'background.paper'),
    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
    minHeight: 320,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: selected ? 8 : 3,
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: 10,
      background: gradient || color || 'background.paper',
    },
    ...sx,
  }}>
    <CardActionArea onClick={onClick} sx={{ borderRadius: 4, height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Box sx={{ mb: 2 }}>{icon}</Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{description}</Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default RoleCard; 
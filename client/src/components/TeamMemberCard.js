import React from 'react';
import { Card, CardContent, Avatar, Typography } from '@mui/material';

const TeamMemberCard = ({ member, sx }) => (
  <Card elevation={1} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #e3f0ff 0%, #f9f9f9 100%)', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.03)', boxShadow: 6 }, ...sx }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar sx={{ width: 64, height: 64, mb: 2 }}>{member.avatar || member.name[0]}</Avatar>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>{member.name}</Typography>
      <Typography variant="subtitle1" color="text.secondary">{member.role}</Typography>
      <Typography align="center" color="text.secondary" sx={{ mt: 1 }}>{member.desc}</Typography>
    </CardContent>
  </Card>
);

export default TeamMemberCard; 
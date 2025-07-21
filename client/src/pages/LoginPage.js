import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardActionArea, CardContent, Typography, Fade, useMediaQuery } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';
import { useTheme } from '../contexts/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import PageContainer from '../components/PageContainer';
import RoleSelectorGrid from '../components/RoleSelectorGrid';
import { ROLES } from '../constants/roles';

const CARD_MIN_HEIGHT = 320;
const ICON_SIZE = 60;
const CONTAINER_MAX_WIDTH = 1200;

const LoginPage = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { theme } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  return (
    <PageContainer>
      <Fade in timeout={700}>
        <Box>
          <Box sx={{ width: '100%', maxWidth: CONTAINER_MAX_WIDTH, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'var(--color-primary)', letterSpacing: 1 }}>
              Choose Your Role
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'var(--color-text-secondary)' }}>
              Select your role to login to HealthEase
            </Typography>
            <RoleSelectorGrid roles={ROLES} onSelect={role => navigate(`/login/${role.key}`)} />
          </Box>
        </Box>
      </Fade>
    </PageContainer>
  );
};

export default LoginPage;
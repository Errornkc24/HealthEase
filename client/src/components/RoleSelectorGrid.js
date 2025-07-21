import React from 'react';
import { Grid } from '@mui/material';
import RoleCard from './RoleCard';

const RoleSelectorGrid = ({ roles, onSelect }) => (
  <Grid container spacing={6} justifyContent="center" alignItems="stretch" wrap="wrap" sx={{ width: '100%', maxWidth: '100vw', m: 0 }}>
    {roles.map((role, i) => (
      <Grid item key={role.key} sx={{ display: 'flex', flex: '1 1 0', maxWidth: '100%' }}>
        <RoleCard
          icon={role.icon}
          title={role.title}
          description={role.description}
          color={role.color}
          gradient={role.gradient}
          onClick={() => onSelect(role)}
        />
      </Grid>
    ))}
  </Grid>
);

export default RoleSelectorGrid; 
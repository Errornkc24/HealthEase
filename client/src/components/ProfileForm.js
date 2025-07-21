import React from 'react';
import { Box, TextField, Button, Grid, CircularProgress } from '@mui/material';

const ProfileForm = ({ fields, form, errors, onChange, onSave, onCancel, editMode, loading }) => (
  <Box component="form" sx={{ width: '100%', mt: 1 }} onSubmit={e => { e.preventDefault(); onSave(); }} autoComplete="off">
    <Grid container spacing={2}>
      {fields.map(({ name, label, type = 'text', ...rest }) => (
        <Grid item xs={12} md={6} key={name}>
          <TextField
            label={label}
            name={name}
            type={type}
            value={form[name] || ''}
            onChange={onChange}
            fullWidth
            margin="normal"
            error={!!errors[name]}
            helperText={errors[name]}
            {...rest}
          />
        </Grid>
      ))}
    </Grid>
    {editMode && (
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
        </Button>
        <Button variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </Box>
    )}
  </Box>
);

export default ProfileForm; 
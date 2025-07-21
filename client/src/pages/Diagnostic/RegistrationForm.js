import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// TODO: Replace with actual ABI and contract address
import DiagnosticContract from '../../abis/DiagnosticContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import { SERVICES } from '../../constants/forms';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Alert, CircularProgress, Fade, Checkbox, FormGroup, FormControlLabel, Grid, Snackbar } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTheme } from '../../contexts/ThemeContext';

const initialState = {
  wallet: '',
  name: '',
  location: '',
  contactNumber: '',
  email: '',
  hNumber: '',
  licenseNumber: '',
  establishedDate: '',
  servicesOffered: [],
  password: '',
  confirmPassword: '',
};

const DiagnosticRegistrationForm = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const { theme } = useTheme();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setForm(f => ({ ...f, wallet: accounts[0] }));
          setMetaMaskConnected(true);
        }
      });
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.wallet) newErrors.wallet = 'Connect MetaMask to autofill wallet address.';
    if (!form.name) newErrors.name = 'Diagnostic center name is required.';
    if (!form.location) newErrors.location = 'Location/Address is required.';
    if (!form.contactNumber) newErrors.contactNumber = 'Contact number is required.';
    else if (!/^\d{10}$/.test(form.contactNumber)) newErrors.contactNumber = 'Contact number must be 10 digits.';
    if (!form.email) newErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email format.';
    if (!form.hNumber) newErrors.hNumber = 'H Number is required.';
    else if (!/^\d{6}$/.test(form.hNumber)) newErrors.hNumber = 'H Number must be exactly 6 digits.';
    if (!form.licenseNumber) newErrors.licenseNumber = 'License number is required.';
    if (!form.establishedDate) newErrors.establishedDate = 'Established date is required.';
    else if (new Date(form.establishedDate) > new Date()) newErrors.establishedDate = 'Established date cannot be in the future.';
    if (!form.servicesOffered.length) newErrors.servicesOffered = 'Select at least one service.';
    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(f => {
        const updated = checked
          ? [...f.servicesOffered, value]
          : f.servicesOffered.filter(s => s !== value);
        return { ...f, servicesOffered: updated };
      });
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    if (submitted) validateForm();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateForm()) return;
    setTxStatus('');
    setTxHash('');
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error('MetaMask not detected');
      setTxStatus('Waiting for wallet confirmation...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddresses.DiagnosticContract,
        DiagnosticContract.abi,
        signer
      );
      const tx = await contract.registerDiagnosticCenter(
        form.hNumber,
        form.name,
        form.location,
        form.contactNumber,
        form.email,
        form.licenseNumber,
        form.establishedDate,
        form.servicesOffered,
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(form.password))
      );
      setTxStatus('Transaction sent. Waiting for confirmation...');
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus('Registration successful!');
      setSnackbar({ open: true, message: 'Registration successful!' });
    } catch (err) {
      setTxStatus('Registration failed: ' + (err.reason || err.message));
      setSnackbar({ open: true, message: 'Registration failed: ' + (err.reason || err.message) });
    }
    setLoading(false);
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--color-bg)', background: theme === 'gradient' ? 'linear-gradient(140deg, #8bb6f9 0%, #6be7c1 50%, #e6b6ff 100%)' : 'none', py: 4 }}>
        <Card elevation={5} sx={{ borderRadius: 4, maxWidth: 600, width: '100%', background: 'linear-gradient(120deg, #ede7f6 0%, #eac8ff 100%)', color: 'inherit', p: { xs: 2, md: 5 }, boxShadow: 8, border: '1.5px solid #eac8ff', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 16 } }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 1, md: 2 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'var(--color-primary)', letterSpacing: 1 }}>
              Diagnostic Center Registration
            </Typography>
            <ScienceIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Box component="form" sx={{ width: '100%', mt: 1 }} onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="Wallet Address" name="wallet" value={form.wallet} fullWidth margin="normal" disabled error={submitted && !!errors.wallet} helperText={submitted ? errors.wallet : ''} />
                  {!metaMaskConnected && <Typography color="error" variant="caption">MetaMask not connected</Typography>}
                  <TextField label="Diagnostic Center Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.name} helperText={submitted ? errors.name : ''} />
                  <TextField label="Location/Address" name="location" value={form.location} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.location} helperText={submitted ? errors.location : ''} multiline />
                  <TextField label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.contactNumber} helperText={submitted ? errors.contactNumber : ''} inputProps={{ maxLength: 10 }} />
                  <TextField label="Email ID" name="email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.email} helperText={submitted ? errors.email : ''} />
                  <TextField label="H Number" name="hNumber" value={form.hNumber} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.hNumber} helperText={submitted ? errors.hNumber : ''} inputProps={{ maxLength: 6 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="License Number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.licenseNumber} helperText={submitted ? errors.licenseNumber : ''} />
                  <TextField label="Established Date" name="establishedDate" type="date" value={form.establishedDate} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} error={submitted && !!errors.establishedDate} helperText={submitted ? errors.establishedDate : ''} />
                  <FormControl fullWidth margin="normal" error={submitted && !!errors.servicesOffered}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Services Offered</Typography>
                    <FormGroup row>
                      {SERVICES.map(service => (
                        <FormControlLabel
                          key={service}
                          control={<Checkbox checked={form.servicesOffered.includes(service)} onChange={handleChange} name="servicesOffered" value={service} />}
                          label={service}
                        />
                      ))}
                    </FormGroup>
                    {submitted && errors.servicesOffered && <Typography color="error" variant="caption">{errors.servicesOffered}</Typography>}
                  </FormControl>
                  <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.password} helperText={submitted ? errors.password : ''} />
                  <TextField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.confirmPassword} helperText={submitted ? errors.confirmPassword : ''} />
                </Grid>
              </Grid>
              {txStatus && <Alert severity={txStatus.includes('successful') ? 'success' : 'info'} sx={{ mt: 2 }}>{txStatus}</Alert>}
              {txHash && <Alert severity="info" sx={{ mt: 2 }}>Transaction Hash: {txHash}</Alert>}
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 4, fontWeight: 700, py: 1.5, borderRadius: 3, boxShadow: 4, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }} aria-label="Register" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </Box>
          </CardContent>
          <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} ContentProps={{ 'aria-live': 'polite' }} />
        </Card>
      </Box>
    </Fade>
  );
};

export default DiagnosticRegistrationForm; 
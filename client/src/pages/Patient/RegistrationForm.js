import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// TODO: Replace with actual ABI and contract address
import PatientContract from '../../abis/PatientContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import { BLOOD_GROUPS, GENDERS } from '../../constants/forms';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Alert, CircularProgress, Fade, Grid, Snackbar } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import PersonIcon from '@mui/icons-material/Person';

const initialState = {
  wallet: '',
  name: '',
  gender: '',
  bloodGroup: '',
  homeAddress: '',
  dateOfBirth: '',
  email: '',
  hNumber: '',
  password: '',
  confirmPassword: '',
};

const PatientRegistrationForm = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const { theme } = useTheme();

  // MetaMask wallet autofill
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setForm(f => ({ ...f, wallet: accounts[0] }));
          setMetaMaskConnected(true);
        }
      });
      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setForm(f => ({ ...f, wallet: accounts[0] }));
        } else {
          setForm(f => ({ ...f, wallet: '' }));
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line
  }, [form]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.wallet) newErrors.wallet = 'Connect MetaMask to autofill wallet address.';
    if (!form.name) newErrors.name = 'Name is required.';
    if (!form.gender) newErrors.gender = 'Gender is required.';
    if (!form.bloodGroup) newErrors.bloodGroup = 'Blood group is required.';
    if (!form.homeAddress) newErrors.homeAddress = 'Home address is required.';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required.';
    else if (new Date(form.dateOfBirth) > new Date()) newErrors.dateOfBirth = 'Birth date cannot be in the future.';
    if (!form.email) newErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email format.';
    if (!form.hNumber) newErrors.hNumber = 'H Number is required.';
    else if (!/^\d{6}$/.test(form.hNumber)) newErrors.hNumber = 'H Number must be exactly 6 digits.';
    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
        contractAddresses.PatientContract,
        PatientContract.abi,
        signer
      );
      const tx = await contract.registerPatient(
        form.hNumber,
        form.name,
        form.bloodGroup,
        form.homeAddress,
        form.dateOfBirth,
        form.gender,
        form.email,
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
        <Card elevation={5} sx={{ borderRadius: 4, maxWidth: 600, width: '100%', background: 'linear-gradient(120deg, #e3f0ff 0%, #b6e0fe 100%)', color: 'inherit', p: { xs: 2, md: 5 }, boxShadow: 8, border: '1.5px solid #b6e0fe', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 16 } }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 1, md: 2 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'var(--color-primary)', letterSpacing: 1 }}>
              Patient Registration
            </Typography>
            <Box component="form" sx={{ width: '100%', mt: 1 }} onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="Wallet Address" name="wallet" value={form.wallet} fullWidth margin="normal" disabled error={submitted && !!errors.wallet} helperText={submitted ? errors.wallet : ''} />
                  {!metaMaskConnected && <Typography color="error" variant="caption">MetaMask not connected</Typography>}
                  <TextField label="Patient Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.name} helperText={submitted ? errors.name : ''} />
                  <FormControl fullWidth margin="normal" error={submitted && !!errors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select label="Gender" name="gender" value={form.gender} onChange={handleChange}>
                      <MenuItem value="">Select gender</MenuItem>
                      {GENDERS.map(gender => (
                        <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                      ))}
                    </Select>
                    {submitted && errors.gender && <Typography color="error" variant="caption">{errors.gender}</Typography>}
                  </FormControl>
                  <FormControl fullWidth margin="normal" error={submitted && !!errors.bloodGroup}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                      <MenuItem value="">Select blood group</MenuItem>
                      {BLOOD_GROUPS.map(group => (
                        <MenuItem key={group} value={group}>{group}</MenuItem>
                      ))}
                    </Select>
                    {submitted && errors.bloodGroup && <Typography color="error" variant="caption">{errors.bloodGroup}</Typography>}
                  </FormControl>
                  <TextField label="Home Address" name="homeAddress" value={form.homeAddress} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.homeAddress} helperText={submitted ? errors.homeAddress : ''} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} error={submitted && !!errors.dateOfBirth} helperText={submitted ? errors.dateOfBirth : ''} />
                  <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.email} helperText={submitted ? errors.email : ''} />
                  <TextField label="H Number" name="hNumber" value={form.hNumber} onChange={handleChange} fullWidth margin="normal" error={submitted && !!errors.hNumber} helperText={submitted ? errors.hNumber : ''} inputProps={{ maxLength: 6 }} />
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

export default PatientRegistrationForm;
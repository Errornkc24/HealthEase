import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Fade, Snackbar } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const GenericLoginForm = ({
  contractABI,
  contractAddress,
  role,
  icon,
  title = 'Login',
  redirectPath = '/',
  hNumberLabel = 'H Number',
  passwordLabel = 'Password',
  walletLabel = 'Wallet Address',
  getUserMethod = 'patients', // or 'doctors', 'centers', etc.
  userExistsKey = 'exists',
  userHNumberKey = 'hNumber',
  userPasswordHashKey = 'passwordHash',
  color,
  gradient,
}) => {
  const [wallet, setWallet] = useState('');
  const [hNumber, setHNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const { theme } = useTheme();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) setWallet(accounts[0]);
      });
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet('');
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error('MetaMask not detected');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      const user = await contract[getUserMethod](wallet);
      if (!user[userExistsKey]) throw new Error(`No ${role} registered with this wallet`);
      if (user[userHNumberKey] !== hNumber) throw new Error('Invalid H Number');
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(password));
      if (user[userPasswordHashKey] !== passwordHash) throw new Error('Invalid password');
      localStorage.setItem('ehr_user', JSON.stringify({ role, wallet, hNumber }));
      setSnackbar({ open: true, message: 'Login successful!' });
      window.location.href = redirectPath;
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--color-bg)', background: theme === 'gradient' ? 'linear-gradient(140deg, #8bb6f9 0%, #6be7c1 50%, #e6b6ff 100%)' : 'none' }}>
        <Card elevation={5} sx={{
          borderRadius: 4,
          background: gradient || color || (theme === 'dark' ? '#223a5f' : 'linear-gradient(120deg, #e3f0ff 0%, #b6e0fe 100%)'),
          color: theme === 'dark' ? '#fff' : 'inherit',
          p: 5, mt: 4, mb: 4, boxShadow: 8,
          border: theme === 'dark' ? '1.5px solid #33507a' : '1.5px solid #b6e0fe',
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: 16 },
        }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'var(--color-patient)', letterSpacing: 1 }}>
              {icon} {title}
            </Typography>
            <Box component="form" sx={{ width: '100%', mt: 1 }} onSubmit={handleSubmit} autoComplete="off">
              <TextField label={walletLabel} value={wallet} fullWidth margin="normal" disabled />
              <TextField label={hNumberLabel} value={hNumber} onChange={e => setHNumber(e.target.value)} fullWidth margin="normal" inputProps={{ maxLength: 6 }} required />
              <TextField label={passwordLabel} type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, fontWeight: 700, py: 1.5, borderRadius: 3, boxShadow: 4, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }} aria-label="Login" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} ContentProps={{ 'aria-live': 'polite' }} />
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default GenericLoginForm; 
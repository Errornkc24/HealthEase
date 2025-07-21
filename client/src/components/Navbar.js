import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MetaMaskStatus from './MetaMaskStatus';
import LogoutButton from './LogoutButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { theme, setTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('ehr_user'));

  const handleThemeMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleThemeMenuClose = () => {
    setAnchorEl(null);
  };
  const handleThemeChange = (mode) => {
    setTheme(mode);
    handleThemeMenuClose();
  };

  return (
    <AppBar position="static" elevation={2} sx={{ background: 'var(--color-bg)', color: 'var(--color-text)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px 0 rgba(80,80,120,0.18)', borderBottom: '1.5px solid #b6d0f6' }}>
      <Toolbar>
        <IconButton edge="start" aria-label="menu" onClick={() => setDrawerOpen(true)} sx={{ color: 'var(--color-text)', textShadow: '0 1px 4px rgba(255,255,255,0.2)', mr: 2, display: { xs: 'block', md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700 }}>
          HealthEase
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Typography component={Link} to="/" sx={{ color: 'var(--color-text)', textDecoration: 'none', mx: 1 }}>
            Home
          </Typography>
          <Typography component={Link} to="/about" sx={{ color: 'var(--color-text)', textDecoration: 'none', mx: 1 }}>
            About
          </Typography>
          <Typography component={Link} to="/login" sx={{ color: 'var(--color-text)', textDecoration: 'none', mx: 1 }}>
            Login
          </Typography>
          <Typography component={Link} to="/register" sx={{ color: 'var(--color-text)', textDecoration: 'none', mx: 1 }}>
            Register
          </Typography>
        </Box>
        <IconButton
          sx={{ color: 'var(--color-text)', textShadow: '0 1px 4px rgba(255,255,255,0.2)' }}
          onClick={handleThemeMenuOpen}
        >
          <ArrowDropDownIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleThemeMenuClose}
        >
          <MenuItem selected={theme === THEME_MODES.LIGHT} onClick={() => handleThemeChange(THEME_MODES.LIGHT)}>
            Light Mode
          </MenuItem>
          <MenuItem selected={theme === THEME_MODES.GRADIENT} onClick={() => handleThemeChange(THEME_MODES.GRADIENT)}>
            Gradient Mode
          </MenuItem>
        </Menu>
        <IconButton sx={{ color: 'var(--color-text)', textShadow: '0 1px 4px rgba(255,255,255,0.2)' }}>
          <AccountCircle />
        </IconButton>
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 220 }}>
          <ListItem button component={Link} to="/" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/about" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="About" />
          </ListItem>
          <ListItem button component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button component={Link} to="/register" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Register" />
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 
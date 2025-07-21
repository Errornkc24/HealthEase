import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ value, onChange, placeholder = 'Search...', sx }) => (
  <TextField
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    variant="outlined"
    size="small"
    sx={sx}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
    }}
  />
);

export default SearchBar; 
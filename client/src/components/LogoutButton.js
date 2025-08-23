import React from 'react';

const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem('ehr_user');
    window.location.href = '/login';
  };
  return (
    <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton; 
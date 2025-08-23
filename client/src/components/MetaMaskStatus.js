import React, { useState, useEffect } from 'react';

const MetaMaskStatus = () => {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      });
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount('');
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      setError('');
    } catch (err) {
      setError('User denied wallet connection.');
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {isConnected ? (
        <span className="badge bg-success">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
      ) : (
        <button className="btn btn-warning btn-sm" onClick={connectWallet}>
          Connect MetaMask
        </button>
      )}
      {error && <span className="text-danger small ms-2">{error}</span>}
    </div>
  );
};

export default MetaMaskStatus; 
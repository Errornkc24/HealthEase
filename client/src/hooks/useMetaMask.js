import { useState, useEffect } from 'react';

const useMetaMask = () => {
  const [wallet, setWallet] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setConnected(true);
        } else {
          setWallet('');
          setConnected(false);
        }
      });
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setConnected(true);
        } else {
          setWallet('');
          setConnected(false);
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return { wallet, connected };
};

export default useMetaMask; 
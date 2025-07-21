# Blockchain-Based Electronic Health Records (EHR) DApp

A decentralized, secure, and patient-controlled Electronic Health Records system built on Ethereum, IPFS, and React.

---

## 🚀 Features
- **Decentralized EHR**: No central authority, all data on Ethereum smart contracts
- **Role-based Access**: Patients, Doctors, and Diagnostic Centers with granular permissions
- **IPFS File Storage**: Medical records and reports stored on IPFS (Pinata or Infura/local)
- **MetaMask Integration**: Secure wallet-based authentication and transactions
- **Permission Management**: Patients control who can access their records
- **Audit Trails**: All actions are logged on-chain
- **Responsive UI**: Modern, mobile-friendly React frontend

---

## 🛠️ Tech Stack
- **Smart Contracts**: Solidity, Truffle
- **Frontend**: React, Bootstrap, ethers.js
- **Blockchain**: Ethereum (Ganache for local, Sepolia for testnet)
- **Storage**: IPFS (Pinata, Infura, or local node)
- **Wallet**: MetaMask

---

## 📦 Project Structure
```
ABC/
  contracts/           # Solidity smart contracts
  migrations/          # Truffle migration scripts
  test/                # Smart contract tests
  client/              # React frontend
    src/
      abis/            # Contract ABIs
      config/          # Contract addresses
      pages/           # React pages
      components/      # Reusable components
      utils/           # Utility functions (IPFS, Pinata)
```

---

## ⚡ Quick Start

### 1. **Clone the Repo**
```sh
git clone <your-repo-url>
cd ABC
```

### 2. **Install Dependencies**
- **Backend:**
  ```sh
  npm install -g truffle
  npm install
  ```
- **Frontend:**
  ```sh
  cd client
  npm install
  ```

### 3. **Configure Environment**
- **Pinata/IPFS:**
  Create `client/.env`:
  ```
  REACT_APP_PINATA_API_KEY=your_pinata_api_key
  REACT_APP_PINATA_API_SECRET=your_pinata_api_secret
  REACT_APP_PINATA_JWT=your_pinata_jwt
  REACT_APP_IPFS_URL=https://ipfs.infura.io:5001/api/v0
  ```
- **Contract Addresses:**
  After deployment, update `client/src/config/contractAddresses.json` with your contract addresses.

### 4. **Run Local Blockchain**
```sh
ganache-cli
# or use Ganache GUI
```

### 5. **Compile & Deploy Contracts**
```sh
truffle compile --all
truffle migrate --network development --reset
```

### 6. **Start the Frontend**
```sh
cd client
npm start
```

---

## 🌐 Usage
- Open [http://localhost:3000](http://localhost:3000) in your browser
- Connect MetaMask (use the same network as Ganache or your testnet)
- Register as Patient, Doctor, or Diagnostic Center
- Login and access your dashboard
- Upload/view records, manage permissions, and more

---

## 📝 Deployment
- **Testnet:**
  - Update `truffle-config.js` for Sepolia or your preferred testnet
  - Deploy: `truffle migrate --network sepolia --reset`
  - Update frontend config with new addresses
- **Frontend:**
  - Deploy `client/build` to Vercel, Netlify, or your preferred static host

---

## 🔒 Security Notes
- **Never commit your `.env` file or private keys to git!**
- For production, use a backend proxy for Pinata keys if possible
- Always test on a testnet before mainnet deployment

---

## 🤝 Credits
- Built by the ABC University Minor Project Team
- Powered by Ethereum, IPFS, Pinata, and the open-source community

---

## 📄 License
MIT 
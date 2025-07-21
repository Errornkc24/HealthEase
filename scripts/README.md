# Deployment and Registration Scripts

This directory contains scripts to automate the deployment of smart contracts and user registration for the EHR system.

## Scripts Overview

### 1. `deployAndRegister.js` (Recommended)
This script does everything in one go:
- Deploys all smart contracts
- Configures cross-contract references
- Automatically registers all three users (Patient, Doctor, Diagnostic Center)

### 2. `registerUsers.js`
This script only registers users (assumes contracts are already deployed):
- Registers Patient: Nirav Changela
- Registers Doctor: Kashish Golwala  
- Registers Diagnostic Center: Keval Laboratory and Diagnostic Center

## How to Use

### Option 1: Complete Deployment and Registration (Recommended)
```bash
# Make sure you're in the project root directory
truffle migrate --reset --f 1 --to 1
```

### Option 2: Register Users Only (if contracts already deployed)
```bash
# Make sure you're in the project root directory
truffle exec scripts/registerUsers.js
```

## Prerequisites

1. **Ganache Running**: Make sure Ganache is running on port 7545
2. **MetaMask Connected**: Connect MetaMask to Ganache
3. **Account Import**: Import the following accounts into MetaMask:
   - `0xb2742A08b3ba1715F4b95462f904392f81271542` (Patient)
   - `0x2E6a8c627442eeB5B2cf5006f3b01C84ae9705Af` (Doctor)
   - `0xD7d299f8a87AFC613660821D7C365C1AC23a5d38` (Diagnostic Center)

## Importing Accounts to MetaMask

1. Open MetaMask
2. Click on the account dropdown
3. Click "Import Account"
4. Enter the private key for each account:
   - Patient: `0xb2742A08b3ba1715F4b95462f904392f81271542`
   - Doctor: `0x2E6a8c627442eeB5B2cf5006f3b01C84ae9705Af`
   - Diagnostic: `0xD7d299f8a87AFC613660821D7C365C1AC23a5d38`

## Registered Users

### Patient
- **Name**: Nirav Changela
- **Wallet**: 0xb2742A08b3ba1715F4b95462f904392f81271542
- **H Number**: 240804
- **Password**: Errorncop@24

### Doctor
- **Name**: Kashish Golwala
- **Wallet**: 0x2E6a8c627442eeB5B2cf5006f3b01C84ae9705Af
- **H Number**: 090702
- **Password**: Kashishgolwala@09

### Diagnostic Center
- **Name**: Keval Laboratory and Diagnostic Center
- **Wallet**: 0xD7d299f8a87AFC613660821D7C365C1AC23a5d38
- **H Number**: 240904
- **Password**: Kevaldhabalia@24

## After Running the Script

1. **Update Frontend**: Copy the contract addresses from the console output and update `client/src/config/contractAddresses.json`
2. **Start Frontend**: Run `npm start` in the client directory
3. **Test Login**: Use the credentials above to test login functionality

## Troubleshooting

### "Insufficient funds" error
Make sure all three accounts have enough ETH in Ganache. You can fund them by:
1. Opening Ganache
2. Clicking on an account
3. Copying the private key
4. Importing it to MetaMask

### "Contract not deployed" error
Make sure you're running the migration script first:
```bash
truffle migrate --reset
```

### "Transaction failed" error
Check that:
1. Ganache is running
2. MetaMask is connected to Ganache
3. The correct account is selected in MetaMask
4. The account has sufficient ETH 
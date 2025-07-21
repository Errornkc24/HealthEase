const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const fetch = require('node-fetch');
const ethers = require('ethers');
const contractAddresses = require('../client/src/config/contractAddresses.json');

const PatientContract = artifacts.require('PatientContract');
const DoctorContract = artifacts.require('DoctorContract');
const DiagnosticContract = artifacts.require('DiagnosticContract');

// Pinata upload utility
async function uploadToPinata(filePath) {
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;
  const jwt = process.env.PINATA_JWT;
  if (!apiKey || !apiSecret || !jwt) throw new Error('Pinata credentials not set in environment variables');
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
      Authorization: `Bearer ${jwt}`
    },
    body: data
  });
  if (!res.ok) throw new Error('Pinata upload failed');
  const json = await res.json();
  return json.IpfsHash;
}

function readExcel(filePath) {
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return xlsx.utils.sheet_to_json(ws);
}

module.exports = async function (callback) {
  try {
    console.log('🚀 Starting automated registration and upload...');
    // Get contract instances
    const patientContract = await PatientContract.deployed();
    const doctorContract = await DoctorContract.deployed();
    const diagnosticContract = await DiagnosticContract.deployed();

    // Read user data
    const patients = readExcel(path.join('data', 'Patient', 'patients_full.xlsx'));
    const doctors = readExcel(path.join('data', 'Doctor', 'doctors_full.xlsx'));
    const diagnostics = readExcel(path.join('data', 'Diagnostic', 'diagnostics_full.xlsx'));

    // Register Patients
    for (const patient of patients) {
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(patient.Password || 'password123'));
      await patientContract.registerPatient(
        patient['H Number'],
        patient['Name'],
        patient['Blood Group'] || 'O+',
        patient['Home Address'] || 'Unknown',
        patient['Date of Birth'] || '01/01/2000',
        patient['Gender'] || 'Other',
        patient['Email'] || '',
        passwordHash,
        { from: patient['Wallet Address'] }
      );
      // Upload records
      const patientDir = path.join('data', 'Patient', `${patient['H Number']}_${patient['Name'].replace(/ /g, '_')}`);
      if (fs.existsSync(patientDir)) {
        const files = fs.readdirSync(patientDir);
        for (const file of files) {
          const filePath = path.join(patientDir, file);
          const ipfsHash = await uploadToPinata(filePath);
          // Optionally, call a contract method to store the IPFS hash
          // await patientContract.addMedicalRecord(ipfsHash, ...)
          console.log(`   Uploaded ${file} for ${patient['Name']} to IPFS: ${ipfsHash}`);
        }
      }
      console.log(`✅ Registered and uploaded for patient: ${patient['Name']}`);
    }
    // Register Doctors
    for (const doctor of doctors) {
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(doctor.Password || 'password123'));
      await doctorContract.registerDoctor(
        doctor['H Number'],
        doctor['Name'],
        doctor['Hospital'] || 'Unknown',
        doctor['Specialization'] || 'General',
        doctor['Department'] || 'General',
        doctor['Designation'] || 'Doctor',
        doctor['Experience'] || 1,
        doctor['Date of Birth'] || '01/01/1980',
        doctor['Gender'] || 'Other',
        doctor['Email'] || '',
        passwordHash,
        { from: doctor['Wallet Address'] }
      );
      console.log(`✅ Registered doctor: ${doctor['Name']}`);
    }
    // Register Diagnostics
    for (const diag of diagnostics) {
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(diag.Password || 'password123'));
      await diagnosticContract.registerDiagnosticCenter(
        diag['H Number'],
        diag['Name'],
        diag['Location'] || 'Unknown',
        diag['Contact Number'] || '',
        diag['Email'] || '',
        diag['License Number'] || '',
        diag['Established Date'] || '01/01/2000',
        diag['Services Offered'] ? diag['Services Offered'].split(',') : ['X-ray'],
        passwordHash,
        { from: diag['Wallet Address'] }
      );
      // Upload reports
      const diagDir = path.join('data', 'Diagnostic', `${diag['H Number']}_${diag['Name'].replace(/ /g, '_')}`);
      if (fs.existsSync(diagDir)) {
        const files = fs.readdirSync(diagDir);
        for (const file of files) {
          const filePath = path.join(diagDir, file);
          const ipfsHash = await uploadToPinata(filePath);
          // Optionally, call a contract method to store the IPFS hash
          // await diagnosticContract.addReport(ipfsHash, ...)
          console.log(`   Uploaded ${file} for ${diag['Name']} to IPFS: ${ipfsHash}`);
        }
      }
      console.log(`✅ Registered and uploaded for diagnostic: ${diag['Name']}`);
    }
    // TODO: Grant permissions, add consultancy reports, etc.
    console.log('🎉 All users registered and files uploaded!');
    callback();
  } catch (error) {
    console.error('❌ Error during automation:', error.message);
    callback(error);
  }
}; 
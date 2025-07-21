require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ethers = require('ethers');
const PatientContract = artifacts.require('PatientContract');
const DoctorContract = artifacts.require('DoctorContract');
const DiagnosticContract = artifacts.require('DiagnosticContract');
const FormData = require('form-data');

// Import user arrays from other scripts
const patients = require('./data/patients');
const doctors = require('./data/doctors');
const diagnostics = require('./data/diagnostics');

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

module.exports = async function (callback) {
  try {
    const patientContract = await PatientContract.deployed();
    const diagnosticContract = await DiagnosticContract.deployed();

    // 1. Grant permission: distribute patients equally among doctors (round-robin)
    for (let i = 0; i < patients.length; i++) {
      const doctor = doctors[i % doctors.length];
      try {
        await patientContract.grantPermission(doctor.wallet, { from: patients[i].wallet });
        console.log(`✅ ${patients[i].name} granted permission to ${doctor.name}`);
      } catch (e) {
        console.log(`⚠️  Could not grant permission from ${patients[i].name} to ${doctor.name}: ${e.message}`);
      }
    }

    // 2. Upload and register patient files
    for (const patient of patients) {
      const patientDir = path.join('data', 'Patient', `${patient.hNumber}_${patient.name.replace(/ /g, '_')}`);
      if (fs.existsSync(patientDir)) {
        const files = fs.readdirSync(patientDir);
        for (const file of files) {
          const filePath = path.join(patientDir, file);
          try {
            const ipfsHash = await uploadToPinata(filePath);
            await patientContract.uploadMedicalRecord(ipfsHash, 'General', { from: patient.wallet });
            console.log(`✅ Uploaded and registered ${file} for ${patient.name}`);
          } catch (e) {
            console.log(`⚠️  Could not upload/register ${file} for ${patient.name}: ${e.message}`);
          }
        }
      }
    }

    // 3. For each patient, have their assigned doctor create 5 consultancy reports
    const doctorContract = await DoctorContract.deployed();
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const doctor = doctors[i % doctors.length];
      try {
        for (let j = 1; j <= 5; j++) {
          const diagnosis = `Diagnosis ${j} for ${patient.name}`;
          const prescription = `Prescription ${j} for ${patient.name}`;
          await doctorContract.createConsultancyReport(patient.wallet, diagnosis, prescription, { from: doctor.wallet });
          console.log(`✅ Doctor ${doctor.name} created report ${j} for patient ${patient.name}`);
        }
      } catch (e) {
        console.log(`⚠️  Could not create report for doctor ${doctor.name} and patient ${patient.name}: ${e.message}`);
      }
    }

    // 4. Upload and register diagnostic files using createDiagnosticReport
    for (const diag of diagnostics) {
      const diagDir = path.join('data', 'Diagnostic', `${diag.hNumber}_${diag.name.replace(/ /g, '_')}`);
      if (fs.existsSync(diagDir)) {
        const files = fs.readdirSync(diagDir);
        for (const file of files) {
          const filePath = path.join(diagDir, file);
          try {
            const ipfsHash = await uploadToPinata(filePath);
            // Assign patient and doctor in round-robin for demo purposes
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            const testType = 'General';
            await diagnosticContract.createDiagnosticReport(patient.wallet, doctor.wallet, testType, ipfsHash, { from: diag.wallet });
            console.log(`✅ Uploaded and registered ${file} for ${diag.name}`);
          } catch (e) {
            console.log(`⚠️  Could not upload/register ${file} for ${diag.name}: ${e.message}`);
          }
        }
      }
    }

    console.log('🎉 Permissions granted and files uploaded/registered!');
    callback();
  } catch (err) {
    console.error('❌ Error:', err.message);
    callback(err);
  }
}; 
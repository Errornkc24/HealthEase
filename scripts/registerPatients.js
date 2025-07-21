const PatientContract = artifacts.require('PatientContract');
const ethers = require('ethers');
const patients = require('./data/patients');

module.exports = async function (callback) {
  try {
    const patientContract = await PatientContract.deployed();
    for (const patient of patients) {
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(patient.password || 'Patient@1234'));
      await patientContract.registerPatient(
        patient.hNumber,
        patient.name,
        patient.bloodGroup || 'O+',
        patient.homeAddress || 'Unknown',
        patient.dateOfBirth || '2000-01-01',
        patient.gender || 'Other',
        patient.email || '',
        passwordHash,
        { from: patient.wallet }
      );
      console.log(`✅ Registered patient: ${patient.name} (${patient.hNumber})`);
    }
    callback();
  } catch (err) {
    console.error('❌ Error:', err.message);
    callback(err);
  }
}; 
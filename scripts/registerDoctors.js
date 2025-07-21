const DoctorContract = artifacts.require('DoctorContract');
const ethers = require('ethers');
const doctors = require('./data/doctors');

module.exports = async function (callback) {
  try {
    const doctorContract = await DoctorContract.deployed();
    for (const doctor of doctors) {
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(doctor.password || 'Doctor@1234'));
      await doctorContract.registerDoctor(
        doctor.hNumber,
        doctor.name,
        doctor.hospital || 'Charusat Hospital',
        doctor.specialization || 'General',
        doctor.department || 'General',
        doctor.designation || 'Doctor',
        doctor.experience || 1,
        doctor.dateOfBirth || '1980-01-01',
        doctor.gender || 'Other',
        doctor.email || '',
        passwordHash,
        { from: doctor.wallet }
      );
      console.log(`✅ Registered doctor: ${doctor.name} (${doctor.hNumber})`);
    }
    callback();
  } catch (err) {
    console.error('❌ Error:', err.message);
    callback(err);
  }
}; 
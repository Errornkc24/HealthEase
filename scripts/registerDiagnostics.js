const DiagnosticContract = artifacts.require('DiagnosticContract');
const ethers = require('ethers');
const diagnostics = require('./data/diagnostics');

module.exports = async function (callback) {
  try {
    const diagnosticContract = await DiagnosticContract.deployed();
    for (const diag of diagnostics) {
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(diag.password || 'Diagnostic@1234'));
      await diagnosticContract.registerDiagnosticCenter(
        diag.hNumber,
        diag.name,
        diag.location || 'Unknown',
        diag.contactNumber || '',
        diag.email || '',
        diag.licenseNumber || '',
        diag.establishedDate || '2000-01-01',
        diag.servicesOffered || ['X-ray'],
        passwordHash,
        { from: diag.wallet }
      );
      console.log(`✅ Registered diagnostic: ${diag.name} (${diag.hNumber})`);
    }
    callback();
  } catch (err) {
    console.error('❌ Error:', err.message);
    callback(err);
  }
}; 
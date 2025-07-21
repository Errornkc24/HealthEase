const DiagnosticContract = artifacts.require("DiagnosticContract");
const PatientContract = artifacts.require("PatientContract");

module.exports = async function (callback) {
  try {
    console.log("🔧 Setting PatientContract address in DiagnosticContract...");
    
    const diagnostic = await DiagnosticContract.deployed();
    const patient = await PatientContract.deployed();
    
    await diagnostic.setPatientContract(patient.address);
    
    console.log("✅ PatientContract address set successfully!");
    console.log(`   DiagnosticContract: ${diagnostic.address}`);
    console.log(`   PatientContract: ${patient.address}`);
    
    callback();
  } catch (error) {
    console.error("❌ Error:", error.message);
    callback(error);
  }
}; 
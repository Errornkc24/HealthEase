const PatientContract = artifacts.require("PatientContract");
const DoctorContract = artifacts.require("DoctorContract");
const DiagnosticContract = artifacts.require("DiagnosticContract");
const EHRSystem = artifacts.require("EHRSystem");

module.exports = async function (deployer, network, accounts) {
  // Deploy EHRSystem with dummy addresses first
  await deployer.deploy(EHRSystem, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000");
  const ehrSystemInstance = await EHRSystem.deployed();

  // Deploy all contracts with EHRSystem address
  await deployer.deploy(DoctorContract, ehrSystemInstance.address);
  await deployer.deploy(DiagnosticContract, ehrSystemInstance.address);
  await deployer.deploy(PatientContract, ehrSystemInstance.address);

  // Set the correct contract addresses in EHRSystem
  await ehrSystemInstance.setPatientContract(PatientContract.address);
  await ehrSystemInstance.setDoctorContract(DoctorContract.address);
  await ehrSystemInstance.setDiagnosticContract(DiagnosticContract.address);

  // Set the correct DoctorContract address in PatientContract
  const patientContractInstance = await PatientContract.deployed();
  await patientContractInstance.setDoctorContract(DoctorContract.address);

  // Set the correct PatientContract address in DoctorContract
  const doctorContractInstance = await DoctorContract.deployed();
  await doctorContractInstance.setPatientContract(PatientContract.address);
}; 
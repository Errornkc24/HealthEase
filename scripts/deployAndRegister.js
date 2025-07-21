const PatientContract = artifacts.require("PatientContract");
const DoctorContract = artifacts.require("DoctorContract");
const DiagnosticContract = artifacts.require("DiagnosticContract");
const EHRSystem = artifacts.require("EHRSystem");
const { ethers } = require("ethers");

module.exports = async function (deployer, network, accounts) {
  try {
    console.log("🚀 Starting deployment and user registration...\n");

    // Step 1: Deploy contracts
    console.log("📦 Deploying contracts...");
    
    // Deploy EHRSystem with dummy addresses first
    await deployer.deploy(EHRSystem, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000");
    const ehrSystemInstance = await EHRSystem.deployed();
    console.log(`   ✅ EHRSystem deployed at: ${ehrSystemInstance.address}`);

    // Deploy all contracts with EHRSystem address
    await deployer.deploy(DoctorContract, ehrSystemInstance.address);
    await deployer.deploy(DiagnosticContract, ehrSystemInstance.address);
    await deployer.deploy(PatientContract, ehrSystemInstance.address);
    
    console.log(`   ✅ DoctorContract deployed at: ${DoctorContract.address}`);
    console.log(`   ✅ DiagnosticContract deployed at: ${DiagnosticContract.address}`);
    console.log(`   ✅ PatientContract deployed at: ${PatientContract.address}`);

    // Set the correct contract addresses in EHRSystem
    await ehrSystemInstance.setPatientContract(PatientContract.address);
    await ehrSystemInstance.setDoctorContract(DoctorContract.address);
    await ehrSystemInstance.setDiagnosticContract(DiagnosticContract.address);
    console.log("   ✅ Contract addresses configured in EHRSystem");

    // Set the correct DoctorContract address in PatientContract
    const patientContractInstance = await PatientContract.deployed();
    await patientContractInstance.setDoctorContract(DoctorContract.address);

    // Set the correct PatientContract address in DoctorContract
    const doctorContractInstance = await DoctorContract.deployed();
    await doctorContractInstance.setPatientContract(PatientContract.address);
    
    // Set the correct PatientContract address in DiagnosticContract
    const diagnosticContractInstance = await DiagnosticContract.deployed();
    await diagnosticContractInstance.setPatientContract(PatientContract.address);
    
    console.log("   ✅ Cross-contract references configured\n");

    // Step 2: Register users
    console.log("👥 Registering users...");

    // User registration data
    const users = {
      patient: {
        wallet: "0xb2742A08b3ba1715F4b95462f904392f81271542",
        hNumber: "240804",
        name: "Nirav Changela",
        bloodGroup: "O+",
        homeAddress: "Prince Hostel",
        dateOfBirth: "24/08/2004",
        gender: "Male",
        email: "nirav.changela123@gmail.com",
        password: "Errorncop@24"
      },
      doctor: {
        wallet: "0x2E6a8c627442eeB5B2cf5006f3b01C84ae9705Af",
        hNumber: "090702",
        name: "Kashish Golwala",
        hospital: "Charusat Hospital",
        location: "Changa",
        dateOfBirth: "09/07/2002",
        gender: "Female",
        email: "kashishgolwala@gmail.com",
        specialization: "Radiology",
        department: "ABC",
        designation: "Senior Doctor",
        experience: 5,
        password: "Kashishgolwala@09"
      },
      diagnostic: {
        wallet: "0xD7d299f8a87AFC613660821D7C365C1AC23a5d38",
        hNumber: "240904",
        name: "Keval Laboratory and Diagnostic Center",
        location: "Beside Charusat Hospital",
        contactNumber: "9054455977",
        email: "dhabaliakeval@gmail.com",
        licenseNumber: "240",
        establishedDate: "24/09/2004",
        servicesOffered: ["X-ray", "CT Scan", "Blood test"],
        password: "Kevaldhabalia@24"
      }
    };

    // Register Patient
    console.log("📝 Registering Patient...");
    const patientPasswordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(users.patient.password));
    const patientTx = await patientContractInstance.registerPatient(
      users.patient.hNumber,
      users.patient.name,
      users.patient.bloodGroup,
      users.patient.homeAddress,
      users.patient.dateOfBirth,
      users.patient.gender,
      users.patient.email,
      patientPasswordHash,
      { from: users.patient.wallet }
    );
    console.log(`   ✅ Patient registered! Transaction: ${patientTx.tx}`);

    // Register Doctor
    console.log("👨‍⚕️ Registering Doctor...");
    const doctorPasswordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(users.doctor.password));
    const doctorTx = await doctorContractInstance.registerDoctor(
      users.doctor.hNumber,
      users.doctor.name,
      users.doctor.hospital,
      users.doctor.specialization,
      users.doctor.department,
      users.doctor.designation,
      users.doctor.experience,
      users.doctor.dateOfBirth,
      users.doctor.gender,
      users.doctor.email,
      doctorPasswordHash,
      { from: users.doctor.wallet }
    );
    console.log(`   ✅ Doctor registered! Transaction: ${doctorTx.tx}`);

    // Register Diagnostic Center
    console.log("🏥 Registering Diagnostic Center...");
    const diagnosticPasswordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(users.diagnostic.password));
    const diagnosticTx = await diagnosticContractInstance.registerDiagnosticCenter(
      users.diagnostic.hNumber,
      users.diagnostic.name,
      users.diagnostic.location,
      users.diagnostic.contactNumber,
      users.diagnostic.email,
      users.diagnostic.licenseNumber,
      users.diagnostic.establishedDate,
      users.diagnostic.servicesOffered,
      diagnosticPasswordHash,
      { from: users.diagnostic.wallet }
    );
    console.log(`   ✅ Diagnostic Center registered! Transaction: ${diagnosticTx.tx}`);

    console.log("\n🎉 Deployment and registration completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log(`   EHRSystem: ${ehrSystemInstance.address}`);
    console.log(`   PatientContract: ${PatientContract.address}`);
    console.log(`   DoctorContract: ${DoctorContract.address}`);
    console.log(`   DiagnosticContract: ${DiagnosticContract.address}`);
    
    console.log("\n👥 Registered Users:");
    console.log(`   Patient: ${users.patient.name} (${users.patient.wallet})`);
    console.log(`   Doctor: ${users.doctor.name} (${users.doctor.wallet})`);
    console.log(`   Diagnostic Center: ${users.diagnostic.name} (${users.diagnostic.wallet})`);
    
    console.log("\n🔑 Login Credentials:");
    console.log(`   Patient - H Number: ${users.patient.hNumber}, Password: ${users.patient.password}`);
    console.log(`   Doctor - H Number: ${users.doctor.hNumber}, Password: ${users.doctor.password}`);
    console.log(`   Diagnostic - H Number: ${users.diagnostic.hNumber}, Password: ${users.diagnostic.password}`);

    console.log("\n📝 Next Steps:");
    console.log("   1. Update contract addresses in client/src/config/contractAddresses.json");
    console.log("   2. Start your frontend application");
    console.log("   3. Test login with the credentials above");

  } catch (error) {
    console.error("❌ Error during deployment and registration:", error.message);
    throw error;
  }
}; 
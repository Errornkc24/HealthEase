const PatientContract = artifacts.require("PatientContract");
const DoctorContract = artifacts.require("DoctorContract");
const DiagnosticContract = artifacts.require("DiagnosticContract");
const { ethers } = require("ethers");

module.exports = async function (callback) {
  try {
    console.log("🚀 Starting automatic user registration...\n");

    // Get contract instances
    const patientContract = await PatientContract.deployed();
    const doctorContract = await DoctorContract.deployed();
    const diagnosticContract = await DiagnosticContract.deployed();

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
    console.log(`   Name: ${users.patient.name}`);
    console.log(`   Wallet: ${users.patient.wallet}`);
    
    const patientPasswordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(users.patient.password));
    
    const patientTx = await patientContract.registerPatient(
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
    
    console.log(`   ✅ Patient registered! Transaction: ${patientTx.tx}\n`);

    // Register Doctor
    console.log("👨‍⚕️ Registering Doctor...");
    console.log(`   Name: ${users.doctor.name}`);
    console.log(`   Wallet: ${users.doctor.wallet}`);
    
    const doctorPasswordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(users.doctor.password));
    
    const doctorTx = await doctorContract.registerDoctor(
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
    
    console.log(`   ✅ Doctor registered! Transaction: ${doctorTx.tx}\n`);

    // Register Diagnostic Center
    console.log("🏥 Registering Diagnostic Center...");
    console.log(`   Name: ${users.diagnostic.name}`);
    console.log(`   Wallet: ${users.diagnostic.wallet}`);
    
    const diagnosticPasswordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(users.diagnostic.password));
    
    const diagnosticTx = await diagnosticContract.registerDiagnosticCenter(
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
    
    console.log(`   ✅ Diagnostic Center registered! Transaction: ${diagnosticTx.tx}\n`);

    console.log("🎉 All users registered successfully!");
    console.log("\n📋 Registration Summary:");
    console.log(`   Patient: ${users.patient.name} (${users.patient.wallet})`);
    console.log(`   Doctor: ${users.doctor.name} (${users.doctor.wallet})`);
    console.log(`   Diagnostic Center: ${users.diagnostic.name} (${users.diagnostic.wallet})`);
    
    console.log("\n🔑 Login Credentials:");
    console.log(`   Patient - H Number: ${users.patient.hNumber}, Password: ${users.patient.password}`);
    console.log(`   Doctor - H Number: ${users.doctor.hNumber}, Password: ${users.doctor.password}`);
    console.log(`   Diagnostic - H Number: ${users.diagnostic.hNumber}, Password: ${users.diagnostic.password}`);

    callback();
  } catch (error) {
    console.error("❌ Error during registration:", error.message);
    callback(error);
  }
}; 
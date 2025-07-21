const PatientContract = artifacts.require("PatientContract");

contract("PatientContract", accounts => {
  const patient = accounts[1];
  const doctor = accounts[2];
  const hNumber = "123456";
  const name = "John Doe";
  const bloodGroup = "A+";
  const homeAddress = "123 Main St";
  const dateOfBirth = "2000-01-01";
  const gender = "Male";
  const email = "john@example.com";
  const passwordHash = web3.utils.keccak256("password123");

  let contract;

  beforeEach(async () => {
    contract = await PatientContract.new();
  });

  it("should register a patient", async () => {
    await contract.registerPatient(hNumber, name, bloodGroup, homeAddress, dateOfBirth, gender, email, passwordHash, { from: patient });
    const p = await contract.patients(patient);
    assert.equal(p.name, name);
    assert.equal(p.hNumber, hNumber);
    assert.equal(p.exists, true);
  });

  it("should not allow duplicate H Number", async () => {
    await contract.registerPatient(hNumber, name, bloodGroup, homeAddress, dateOfBirth, gender, email, passwordHash, { from: patient });
    try {
      await contract.registerPatient(hNumber, "Jane", bloodGroup, homeAddress, dateOfBirth, gender, "jane@example.com", passwordHash, { from: accounts[3] });
      assert.fail("Duplicate H Number allowed");
    } catch (e) {
      assert(e.message.includes("H Number already used"));
    }
  });

  it("should upload a medical record", async () => {
    await contract.registerPatient(hNumber, name, bloodGroup, homeAddress, dateOfBirth, gender, email, passwordHash, { from: patient });
    await contract.uploadMedicalRecord("QmHash", "LabReport", { from: patient });
    const records = await contract.getMedicalRecords(patient, { from: patient });
    assert.equal(records.length, 1);
    assert.equal(records[0].ipfsHash, "QmHash");
  });

  it("should grant and revoke permission to a doctor", async () => {
    await contract.registerPatient(hNumber, name, bloodGroup, homeAddress, dateOfBirth, gender, email, passwordHash, { from: patient });
    await contract.grantPermission(doctor, { from: patient });
    let permitted = await contract.isDoctorPermitted(patient, doctor);
    assert.equal(permitted, true);
    await contract.revokePermission(doctor, { from: patient });
    permitted = await contract.isDoctorPermitted(patient, doctor);
    assert.equal(permitted, false);
  });

  it("should update patient profile", async () => {
    await contract.registerPatient(hNumber, name, bloodGroup, homeAddress, dateOfBirth, gender, email, passwordHash, { from: patient });
    await contract.updateProfile("Jane Doe", "B+", "456 Main St", "1999-12-31", "Female", "jane@example.com", { from: patient });
    const p = await contract.patients(patient);
    assert.equal(p.name, "Jane Doe");
    assert.equal(p.bloodGroup, "B+");
    assert.equal(p.homeAddress, "456 Main St");
    assert.equal(p.gender, "Female");
    assert.equal(p.email, "jane@example.com");
  });
}); 
const DoctorContract = artifacts.require("DoctorContract");

contract("DoctorContract", accounts => {
  const doctor = accounts[1];
  const patient = accounts[2];
  const hNumber = "654321";
  const name = "Dr. Smith";
  const hospital = "City Hospital";
  const specialization = "Cardiology";
  const department = "Cardiology";
  const designation = "Consultant";
  const experience = 10;
  const dateOfBirth = "1980-05-10";
  const gender = "Male";
  const email = "drsmith@example.com";
  const passwordHash = web3.utils.keccak256("docpassword");

  let contract;

  beforeEach(async () => {
    contract = await DoctorContract.new();
  });

  it("should register a doctor", async () => {
    await contract.registerDoctor(hNumber, name, hospital, specialization, department, designation, experience, { from: doctor });
    const d = await contract.doctors(doctor);
    assert.equal(d.name, name);
    assert.equal(d.hNumber, hNumber);
    assert.equal(d.exists, true);
  });

  it("should set doctor profile", async () => {
    await contract.registerDoctor(hNumber, name, hospital, specialization, department, designation, experience, { from: doctor });
    await contract.setDoctorProfile(dateOfBirth, gender, email, passwordHash, { from: doctor });
    const d = await contract.doctors(doctor);
    assert.equal(d.dateOfBirth, dateOfBirth);
    assert.equal(d.gender, gender);
    assert.equal(d.email, email);
    assert.equal(d.passwordHash, passwordHash);
  });

  it("should not allow duplicate H Number", async () => {
    await contract.registerDoctor(hNumber, name, hospital, specialization, department, designation, experience, { from: doctor });
    try {
      await contract.registerDoctor(hNumber, "Dr. Jane", hospital, specialization, department, designation, experience, { from: accounts[3] });
      assert.fail("Duplicate H Number allowed");
    } catch (e) {
      assert(e.message.includes("H Number already used"));
    }
  });

  it("should add and revoke patient access", async () => {
    await contract.registerDoctor(hNumber, name, hospital, specialization, department, designation, experience, { from: doctor });
    await contract.addPatientAccess(patient, { from: doctor });
    let permitted = await contract.hasPatientAccess(doctor, patient);
    assert.equal(permitted, true);
    await contract.revokePatientAccess(patient, { from: doctor });
    permitted = await contract.hasPatientAccess(doctor, patient);
    assert.equal(permitted, false);
  });

  it("should create consultancy report", async () => {
    await contract.registerDoctor(hNumber, name, hospital, specialization, department, designation, experience, { from: doctor });
    await contract.addPatientAccess(patient, { from: doctor });
    await contract.createConsultancyReport(patient, "Diagnosis", "Prescription", { from: doctor });
    const reports = await contract.getConsultancyReports(doctor, { from: doctor });
    assert.equal(reports.length, 1);
    assert.equal(reports[0].diagnosis, "Diagnosis");
    assert.equal(reports[0].prescription, "Prescription");
  });

  it("should update doctor profile", async () => {
    await contract.registerDoctor(hNumber, name, hospital, specialization, department, designation, experience, { from: doctor });
    await contract.updateProfile("Dr. Jane", "New Hospital", "Neurology", "Neurology", "Senior Doctor", 15, "drjane@example.com", { from: doctor });
    const d = await contract.doctors(doctor);
    assert.equal(d.name, "Dr. Jane");
    assert.equal(d.hospital, "New Hospital");
    assert.equal(d.specialization, "Neurology");
    assert.equal(d.department, "Neurology");
    assert.equal(d.designation, "Senior Doctor");
    assert.equal(d.experience, 15);
    assert.equal(d.email, "drjane@example.com");
  });
}); 
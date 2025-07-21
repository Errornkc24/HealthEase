const DiagnosticContract = artifacts.require("DiagnosticContract");

contract("DiagnosticContract", accounts => {
  const center = accounts[1];
  const patient = accounts[2];
  const doctor = accounts[3];
  const hNumber = "111222";
  const name = "Diag Center";
  const location = "456 Lab St";
  const contactNumber = "9876543210";
  const email = "diag@example.com";
  const licenseNumber = "LIC123";
  const establishedDate = "2010-01-01";
  const servicesOffered = ["X-Ray", "MRI"];
  const passwordHash = web3.utils.keccak256("diagpass");

  let contract;

  beforeEach(async () => {
    contract = await DiagnosticContract.new();
  });

  it("should register a diagnostic center", async () => {
    await contract.registerDiagnosticCenter(hNumber, name, location, contactNumber, email, licenseNumber, establishedDate, servicesOffered, passwordHash, { from: center });
    const c = await contract.centers(center);
    assert.equal(c.name, name);
    assert.equal(c.hNumber, hNumber);
    assert.equal(c.exists, true);
  });

  it("should not allow duplicate H Number", async () => {
    await contract.registerDiagnosticCenter(hNumber, name, location, contactNumber, email, licenseNumber, establishedDate, servicesOffered, passwordHash, { from: center });
    try {
      await contract.registerDiagnosticCenter(hNumber, "Other Center", location, contactNumber, "other@example.com", licenseNumber, establishedDate, servicesOffered, passwordHash, { from: accounts[4] });
      assert.fail("Duplicate H Number allowed");
    } catch (e) {
      assert(e.message.includes("H Number already used"));
    }
  });

  it("should create a diagnostic report and file", async () => {
    await contract.registerDiagnosticCenter(hNumber, name, location, contactNumber, email, licenseNumber, establishedDate, servicesOffered, passwordHash, { from: center });
    await contract.createDiagnosticReport(patient, doctor, "MRI", "QmHash", "Result Data", { from: center });
    const reports = await contract.getReportsByCenter(center, { from: center });
    assert.equal(reports.length, 1);
    assert.equal(reports[0].testType, "MRI");
    assert.equal(reports[0].ipfsHash, "QmHash");
    const file = await contract.getReportFile(reports[0].reportId);
    assert.equal(file.ipfsHash, "QmHash");
    assert.equal(file.patient, patient);
    assert.equal(file.doctor, doctor);
    assert.equal(file.patientAccess, true);
    assert.equal(file.doctorAccess, true);
  });

  it("should update diagnostic center profile", async () => {
    await contract.registerDiagnosticCenter(hNumber, name, location, contactNumber, email, licenseNumber, establishedDate, servicesOffered, passwordHash, { from: center });
    await contract.updateProfile("New Center", "New Location", "1234567890", "new@example.com", "NEWLIC", "2015-05-05", ["CT Scan"], { from: center });
    const c = await contract.centers(center);
    assert.equal(c.name, "New Center");
    assert.equal(c.location, "New Location");
    assert.equal(c.contactNumber, "1234567890");
    assert.equal(c.email, "new@example.com");
    assert.equal(c.licenseNumber, "NEWLIC");
    assert.equal(c.establishedDate, "2015-05-05");
    const services = await contract.getServicesOffered(center);
    assert.deepEqual(services, ["CT Scan"]);
  });

  it("should check report access", async () => {
    await contract.registerDiagnosticCenter(hNumber, name, location, contactNumber, email, licenseNumber, establishedDate, servicesOffered, passwordHash, { from: center });
    await contract.createDiagnosticReport(patient, doctor, "MRI", "QmHash", "Result Data", { from: center });
    const reports = await contract.getReportsByCenter(center, { from: center });
    const file = await contract.getReportFile(reports[0].reportId);
    const canPatient = await contract.canAccessReport(file.reportId, patient);
    const canDoctor = await contract.canAccessReport(file.reportId, doctor);
    assert.equal(canPatient, true);
    assert.equal(canDoctor, true);
  });
}); 
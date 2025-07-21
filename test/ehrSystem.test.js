const PatientContract = artifacts.require("PatientContract");
const DoctorContract = artifacts.require("DoctorContract");
const DiagnosticContract = artifacts.require("DiagnosticContract");
const EHRSystem = artifacts.require("EHRSystem");

contract("EHRSystem", accounts => {
  const patient = accounts[1];
  const doctor = accounts[2];
  const diagnostic = accounts[3];
  const hNumberPatient = "100001";
  const hNumberDoctor = "200002";
  const hNumberDiagnostic = "300003";

  let ehr, patientC, doctorC, diagnosticC;

  beforeEach(async () => {
    patientC = await PatientContract.new();
    doctorC = await DoctorContract.new();
    diagnosticC = await DiagnosticContract.new();
    ehr = await EHRSystem.new(patientC.address, doctorC.address, diagnosticC.address);
  });

  it("should register users with roles", async () => {
    await ehr.registerUser(hNumberPatient, 1, { from: patient }); // 1 = Patient
    await ehr.registerUser(hNumberDoctor, 2, { from: doctor });   // 2 = Doctor
    await ehr.registerUser(hNumberDiagnostic, 3, { from: diagnostic }); // 3 = Diagnostic
    const rolePatient = await ehr.getUserRole(patient);
    const roleDoctor = await ehr.getUserRole(doctor);
    const roleDiagnostic = await ehr.getUserRole(diagnostic);
    assert.equal(rolePatient.toNumber(), 1);
    assert.equal(roleDoctor.toNumber(), 2);
    assert.equal(roleDiagnostic.toNumber(), 3);
  });

  it("should grant and revoke permission", async () => {
    await ehr.registerUser(hNumberPatient, 1, { from: patient });
    await ehr.registerUser(hNumberDoctor, 2, { from: doctor });
    await ehr.grantPermission(doctor, 2, { from: patient });
    let perms = await ehr.permissions(0);
    assert.equal(perms.from, patient);
    assert.equal(perms.to, doctor);
    assert.equal(perms.granted, true);
    await ehr.revokePermission(doctor, 2, { from: patient });
    perms = await ehr.permissions(0);
    assert.equal(perms.granted, false);
  });

  it("should log audit actions", async () => {
    await ehr.registerUser(hNumberPatient, 1, { from: patient });
    await ehr.grantPermission(doctor, 2, { from: patient });
    const logs = await ehr.getAuditLogs();
    assert(logs.length > 0);
    assert.equal(logs[0].user, patient);
  });
}); 
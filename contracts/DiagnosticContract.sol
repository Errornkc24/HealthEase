// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEHRSystemForDiagnostic {
    function addDiagnostic(address _diagnostic) external;
    function isHNumberUsed(string memory _hNumber) external view returns (bool);
    function registerHNumber(string memory _hNumber, address _center) external;
}

interface IPatientContractForDiagnostic {
    function isDoctorPermitted(address _patient, address _doctor) external view returns (bool);
}

contract DiagnosticContract {
    struct DiagnosticCenter {
        address wallet;
        string hNumber;
        string name;
        string location;
        string contactNumber;
        string email;
        string licenseNumber;
        string establishedDate;
        string[] servicesOffered;
        string passwordHash;
        bool exists;
    }

    struct DiagnosticReport {
        uint256 reportId;
        address patient;
        address doctor;
        string testType;
        string ipfsHash;
        uint256 timestamp;
    }

    struct ReportFile {
        string ipfsHash;
        uint256 reportId;
        address patient;
        address doctor;
        address diagnosticCenter;
        bool patientAccess;
        bool doctorAccess;
    }

    mapping(address => DiagnosticCenter) public centers;
    mapping(string => address) public hNumberToAddress;
    mapping(address => DiagnosticReport[]) public reportsByCenter;
    mapping(address => ReportFile[]) public reportFilesByCenter;
    mapping(uint256 => ReportFile) public reportFilesById;
    uint256 public nextReportId = 1;

    event DiagnosticCenterRegistered(address indexed wallet, string hNumber, string name);
    event DiagnosticReportCreated(address indexed center, uint256 reportId, address indexed patient, address indexed doctor, string testType);
    event ReportFileUploaded(address indexed center, uint256 reportId, string ipfsHash);
    event DiagnosticCenterProfileUpdated(address indexed wallet);

    address public ehrSystem;
    address public patientContract;

    constructor(address _ehrSystem) {
        ehrSystem = _ehrSystem;
    }

    modifier onlyCenter() {
        require(centers[msg.sender].exists, "Not a registered diagnostic center");
        _;
    }

    function registerDiagnosticCenter(
        string memory _hNumber,
        string memory _name,
        string memory _location,
        string memory _contactNumber,
        string memory _email,
        string memory _licenseNumber,
        string memory _establishedDate,
        string[] memory _servicesOffered,
        string memory _passwordHash
    ) public {
        require(!centers[msg.sender].exists, "Already registered");
        require(!IEHRSystemForDiagnostic(ehrSystem).isHNumberUsed(_hNumber), "H Number already used");
        centers[msg.sender] = DiagnosticCenter({
            wallet: msg.sender,
            hNumber: _hNumber,
            name: _name,
            location: _location,
            contactNumber: _contactNumber,
            email: _email,
            licenseNumber: _licenseNumber,
            establishedDate: _establishedDate,
            servicesOffered: _servicesOffered,
            passwordHash: _passwordHash,
            exists: true
        });
        IEHRSystemForDiagnostic(ehrSystem).registerHNumber(_hNumber, msg.sender);
        // Automatically register with EHRSystem
        IEHRSystemForDiagnostic(ehrSystem).addDiagnostic(msg.sender);
        emit DiagnosticCenterRegistered(msg.sender, _hNumber, _name);
    }

    function createDiagnosticReport(
        address _patient,
        address _doctor,
        string memory _testType,
        string memory _ipfsHash
    ) public onlyCenter {
        uint256 reportId = nextReportId++;
        reportsByCenter[msg.sender].push(DiagnosticReport({
            reportId: reportId,
            patient: _patient,
            doctor: _doctor,
            testType: _testType,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp
        }));
        reportFilesByCenter[msg.sender].push(ReportFile({
            ipfsHash: _ipfsHash,
            reportId: reportId,
            patient: _patient,
            doctor: _doctor,
            diagnosticCenter: msg.sender,
            patientAccess: true,
            doctorAccess: true
        }));
        reportFilesById[reportId] = ReportFile({
            ipfsHash: _ipfsHash,
            reportId: reportId,
            patient: _patient,
            doctor: _doctor,
            diagnosticCenter: msg.sender,
            patientAccess: true,
            doctorAccess: true
        });
        emit DiagnosticReportCreated(msg.sender, reportId, _patient, _doctor, _testType);
        emit ReportFileUploaded(msg.sender, reportId, _ipfsHash);
    }

    function updateProfile(
        string memory _name,
        string memory _location,
        string memory _contactNumber,
        string memory _email,
        string memory _licenseNumber,
        string memory _establishedDate,
        string[] memory _servicesOffered
    ) public onlyCenter {
        DiagnosticCenter storage c = centers[msg.sender];
        c.name = _name;
        c.location = _location;
        c.contactNumber = _contactNumber;
        c.email = _email;
        c.licenseNumber = _licenseNumber;
        c.establishedDate = _establishedDate;
        c.servicesOffered = _servicesOffered;
        emit DiagnosticCenterProfileUpdated(msg.sender);
    }

    function getReportsByCenter(address _center) public view returns (DiagnosticReport[] memory) {
        require(msg.sender == _center, "Not authorized");
        return reportsByCenter[_center];
    }

    function getReportFile(uint256 _reportId) public view returns (ReportFile memory) {
        return reportFilesById[_reportId];
    }

    function canAccessReport(uint256 _reportId, address _user) public view returns (bool) {
        ReportFile memory rf = reportFilesById[_reportId];
        return (rf.patient == _user && rf.patientAccess) || (rf.doctor == _user && rf.doctorAccess);
    }

    function getServicesOffered(address _center) public view returns (string[] memory) {
        return centers[_center].servicesOffered;
    }

    function getReportsForUser(address user) public view returns (DiagnosticReport[] memory) {
        // Count how many reports are relevant
        uint256 count = 0;
        for (uint256 i = 0; i < nextReportId - 1; i++) {
            ReportFile memory rf = reportFilesById[i+1];
            if (rf.patient == user && rf.patientAccess) {
                // Patient can always see their own reports
                count++;
            } else if (rf.doctor == user && rf.doctorAccess) {
                // Doctor can only see reports if they have permission from the patient
                if (patientContract != address(0)) {
                    try IPatientContractForDiagnostic(patientContract).isDoctorPermitted(rf.patient, user) returns (bool hasPermission) {
                        if (hasPermission) {
                            count++;
                        }
                    } catch {
                        // If permission check fails, don't count this report
                    }
                }
            }
        }
        DiagnosticReport[] memory result = new DiagnosticReport[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < nextReportId - 1; i++) {
            ReportFile memory rf = reportFilesById[i+1];
            if (rf.patient == user && rf.patientAccess) {
                // Patient can always see their own reports
                // Find the report in the correct diagnostic center's reports
                DiagnosticReport[] storage centerReports = reportsByCenter[rf.diagnosticCenter];
                for (uint256 j = 0; j < centerReports.length; j++) {
                    if (centerReports[j].reportId == rf.reportId) {
                        result[idx] = centerReports[j];
                        idx++;
                        break;
                    }
                }
            } else if (rf.doctor == user && rf.doctorAccess) {
                // Doctor can only see reports if they have permission from the patient
                if (patientContract != address(0)) {
                    try IPatientContractForDiagnostic(patientContract).isDoctorPermitted(rf.patient, user) returns (bool hasPermission) {
                        if (hasPermission) {
                            // Find the report in the correct diagnostic center's reports
                            DiagnosticReport[] storage centerReports = reportsByCenter[rf.diagnosticCenter];
                            for (uint256 j = 0; j < centerReports.length; j++) {
                                if (centerReports[j].reportId == rf.reportId) {
                                    result[idx] = centerReports[j];
                                    idx++;
                                    break;
                                }
                            }
                        }
                    } catch {
                        // If permission check fails, skip this report
                    }
                }
            }
        }
        return result;
    }

    function getDiagnosticCenterName(address _center) public view returns (string memory) {
        return centers[_center].name;
    }

    function getDiagnosticCenterFromReport(uint256 _reportId) public view returns (address) {
        return reportFilesById[_reportId].diagnosticCenter;
    }

    function setPatientContract(address _patientContract) public {
        patientContract = _patientContract;
    }
} 
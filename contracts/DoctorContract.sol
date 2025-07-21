// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEHRSystemForDoctor {
    function addDoctor(address _doctor) external;
    function isHNumberUsed(string memory _hNumber) external view returns (bool);
    function registerHNumber(string memory _hNumber, address _doctor) external;
}

contract DoctorContract {
    struct Doctor {
        address wallet;
        string hNumber;
        string name;
        string hospital;
        string specialization;
        string department;
        string designation;
        uint256 experience;
        string dateOfBirth;
        string gender;
        string email;
        string passwordHash;
        bool exists;
    }

    struct ProfessionalProfile {
        string department;
        string designation;
        string credentials;
        string workHistory;
    }

    struct ConsultancyReport {
        address patient;
        string diagnosis;
        string prescription;
        uint256 timestamp;
    }

    struct PatientAccess {
        address patient;
        uint256 grantedAt;
        bool active;
    }

    mapping(address => Doctor) public doctors;
    mapping(string => address) public hNumberToAddress;
    mapping(address => ConsultancyReport[]) public consultancyReports;
    mapping(address => PatientAccess[]) public patientAccessList; // doctor => list of patients
    mapping(address => mapping(address => bool)) public hasAccess; // doctor => patient => access

    event DoctorRegistered(address indexed wallet, string hNumber, string name);
    event DoctorProfileSet(address indexed wallet);
    event ConsultancyReportCreated(address indexed doctor, address indexed patient, string diagnosis);
    event PatientAccessGranted(address indexed doctor, address indexed patient);
    event PatientAccessRevoked(address indexed doctor, address indexed patient);
    event DoctorProfileUpdated(address indexed wallet);

    address public patientContract;
    address public ehrSystem;

    constructor(address _ehrSystem) {
        ehrSystem = _ehrSystem;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender].exists, "Not a registered doctor");
        _;
    }

    modifier onlyPatientContract() {
        require(msg.sender == patientContract, "Only PatientContract");
        _;
    }

    function registerDoctor(
        string memory _hNumber,
        string memory _name,
        string memory _hospital,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        uint256 _experience,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _passwordHash
    ) public {
        require(!doctors[msg.sender].exists, "Already registered");
        require(!IEHRSystemForDoctor(ehrSystem).isHNumberUsed(_hNumber), "H Number already used");
        doctors[msg.sender] = Doctor({
            wallet: msg.sender,
            hNumber: _hNumber,
            name: _name,
            hospital: _hospital,
            specialization: _specialization,
            department: _department,
            designation: _designation,
            experience: _experience,
            dateOfBirth: _dateOfBirth,
            gender: _gender,
            email: _email,
            passwordHash: _passwordHash,
            exists: true
        });
        IEHRSystemForDoctor(ehrSystem).registerHNumber(_hNumber, msg.sender);
        // Automatically register with EHRSystem
        IEHRSystemForDoctor(ehrSystem).addDoctor(msg.sender);
        emit DoctorRegistered(msg.sender, _hNumber, _name);
    }

    function setDoctorProfile(
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _passwordHash
    ) public onlyDoctor {
        Doctor storage d = doctors[msg.sender];
        d.dateOfBirth = _dateOfBirth;
        d.gender = _gender;
        d.email = _email;
        d.passwordHash = _passwordHash;
        emit DoctorProfileSet(msg.sender);
    }

    function addPatientAccess(address _patient) public onlyDoctor {
        require(!hasAccess[msg.sender][_patient], "Already has access");
        patientAccessList[msg.sender].push(PatientAccess({
            patient: _patient,
            grantedAt: block.timestamp,
            active: true
        }));
        hasAccess[msg.sender][_patient] = true;
        emit PatientAccessGranted(msg.sender, _patient);
    }

    function revokePatientAccess(address _patient) public onlyDoctor {
        require(hasAccess[msg.sender][_patient], "No access to revoke");
        hasAccess[msg.sender][_patient] = false;
        for (uint i = 0; i < patientAccessList[msg.sender].length; i++) {
            if (patientAccessList[msg.sender][i].patient == _patient && patientAccessList[msg.sender][i].active) {
                patientAccessList[msg.sender][i].active = false;
            }
        }
        emit PatientAccessRevoked(msg.sender, _patient);
    }

    function createConsultancyReport(address _patient, string memory _diagnosis, string memory _prescription) public onlyDoctor {
        require(hasAccess[msg.sender][_patient], "No access to patient");
        consultancyReports[msg.sender].push(ConsultancyReport({
            patient: _patient,
            diagnosis: _diagnosis,
            prescription: _prescription,
            timestamp: block.timestamp
        }));
        emit ConsultancyReportCreated(msg.sender, _patient, _diagnosis);
    }

    function updateProfile(
        string memory _name,
        string memory _hospital,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        uint256 _experience,
        string memory _email
    ) public onlyDoctor {
        Doctor storage d = doctors[msg.sender];
        d.name = _name;
        d.hospital = _hospital;
        d.specialization = _specialization;
        d.department = _department;
        d.designation = _designation;
        d.experience = _experience;
        d.email = _email;
        emit DoctorProfileUpdated(msg.sender);
    }

    function getPatientAccessList(address _doctor) public view returns (PatientAccess[] memory) {
        require(msg.sender == _doctor, "Not authorized");
        return patientAccessList[_doctor];
    }

    function getConsultancyReports(address _doctor) public view returns (ConsultancyReport[] memory) {
        require(msg.sender == _doctor, "Not authorized");
        return consultancyReports[_doctor];
    }

    function getConsultancyReportsForPatient(address) public pure returns (ConsultancyReport[] memory) {
        // This function is not currently used - returning empty array
        // In a real implementation, you might want to use events or a different data structure
        return new ConsultancyReport[](0);
    }

    function getConsultancyReportsForPatientByDoctor(address _doctor, address _patient) public view returns (ConsultancyReport[] memory) {
        // Patients can always see reports created for them, regardless of current access status
        // This ensures medical history is preserved even after revoking permissions
        
        ConsultancyReport[] memory allReports = consultancyReports[_doctor];
        ConsultancyReport[] memory patientReports = new ConsultancyReport[](allReports.length);
        uint256 patientReportCount = 0;
        
        for (uint256 i = 0; i < allReports.length; i++) {
            if (allReports[i].patient == _patient) {
                patientReports[patientReportCount] = allReports[i];
                patientReportCount++;
            }
        }
        
        // Create a properly sized array
        ConsultancyReport[] memory result = new ConsultancyReport[](patientReportCount);
        for (uint256 i = 0; i < patientReportCount; i++) {
            result[i] = patientReports[i];
        }
        
        return result;
    }

    function hasPatientAccess(address _doctor, address _patient) public view returns (bool) {
        return hasAccess[_doctor][_patient];
    }

    function setPatientContract(address _patientContract) external {
        // Add onlyOwner if you want to restrict
        patientContract = _patientContract;
    }

    function addPatientAccessFromPatient(address _doctor, address _patient) external onlyPatientContract {
        if (!hasAccess[_doctor][_patient]) {
            patientAccessList[_doctor].push(PatientAccess({
                patient: _patient,
                grantedAt: block.timestamp,
                active: true
            }));
            hasAccess[_doctor][_patient] = true;
            emit PatientAccessGranted(_doctor, _patient);
        }
    }
} 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IPatientContract {
    function hNumberToAddress(string memory) external view returns (address);
    function isDoctorPermitted(address, address) external view returns (bool);
}

interface IDoctorContractForEHR {
    function hNumberToAddress(string memory) external view returns (address);
    function hasPatientAccess(address, address) external view returns (bool);
}

interface IDiagnosticContract {
    function hNumberToAddress(string memory) external view returns (address);
    function canAccessReport(uint256, address) external view returns (bool);
}

contract EHRSystem {
    enum Role { None, Patient, Doctor, Diagnostic }

    struct User {
        address wallet;
        string hNumber;
        Role role;
        bool exists;
    }

    struct PermissionMap {
        address from;
        address to;
        Role fromRole;
        Role toRole;
        bool granted;
        uint256 timestamp;
    }

    struct AuditLog {
        address user;
        string action;
        uint256 timestamp;
    }

    address public owner;
    address public patientContract;
    address public doctorContract;
    address public diagnosticContract;

    mapping(address => User) public users;
    mapping(string => address) public hNumberToAddress;
    PermissionMap[] public permissions;
    AuditLog[] public auditLogs;

    // New: Global patient list
    address[] public allPatients;
    // New: Global doctor list
    address[] public allDoctors;
    // New: doctor => array of patient addresses who have granted permission
    mapping(address => address[]) public doctorToPermittedPatients;
    // New: patient => doctor => bool (for quick lookup)
    mapping(address => mapping(address => bool)) public patientDoctorPermission;

    event UserRegistered(address indexed wallet, string hNumber, Role role);
    event PermissionGranted(address indexed from, address indexed to, Role fromRole, Role toRole);
    event PermissionRevoked(address indexed from, address indexed to, Role fromRole, Role toRole);
    event AuditLogged(address indexed user, string action);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor(address _patientContract, address _doctorContract, address _diagnosticContract) {
        owner = msg.sender;
        patientContract = _patientContract;
        doctorContract = _doctorContract;
        diagnosticContract = _diagnosticContract;
    }

    function registerUser(string memory _hNumber, Role _role) public {
        require(!users[msg.sender].exists, "Already registered");
        users[msg.sender] = User({
            wallet: msg.sender,
            hNumber: _hNumber,
            role: _role,
            exists: true
        });
        hNumberToAddress[_hNumber] = msg.sender;
        if (_role == Role.Patient) {
            allPatients.push(msg.sender);
        }
        if (_role == Role.Doctor) {
            allDoctors.push(msg.sender);
        }
        emit UserRegistered(msg.sender, _hNumber, _role);
        auditLogs.push(AuditLog({user: msg.sender, action: "UserRegistered", timestamp: block.timestamp}));
    }

    function grantPermission(address _to, Role _toRole) public {
        require(users[msg.sender].exists, "Not registered");
        permissions.push(PermissionMap({
            from: msg.sender,
            to: _to,
            fromRole: users[msg.sender].role,
            toRole: _toRole,
            granted: true,
            timestamp: block.timestamp
        }));
        emit PermissionGranted(msg.sender, _to, users[msg.sender].role, _toRole);
        auditLogs.push(AuditLog({user: msg.sender, action: "PermissionGranted", timestamp: block.timestamp}));
    }

    function revokePermission(address _to, Role _toRole) public {
        for (uint i = 0; i < permissions.length; i++) {
            if (permissions[i].from == msg.sender && permissions[i].to == _to && permissions[i].toRole == _toRole && permissions[i].granted) {
                permissions[i].granted = false;
                emit PermissionRevoked(msg.sender, _to, users[msg.sender].role, _toRole);
                auditLogs.push(AuditLog({user: msg.sender, action: "PermissionRevoked", timestamp: block.timestamp}));
            }
        }
    }

    function getUserRole(address _user) public view returns (Role) {
        return users[_user].role;
    }

    function getAuditLogs() public view returns (AuditLog[] memory) {
        return auditLogs;
    }

    // Cross-contract permission check example
    function canDoctorAccessPatient(address _doctor, address _patient) public view returns (bool) {
        return IPatientContract(patientContract).isDoctorPermitted(_patient, _doctor);
    }

    function canDoctorAccessPatientByHNumber(string memory patientH, string memory doctorH) public view returns (bool) {
        address patientAddr = IPatientContract(patientContract).hNumberToAddress(patientH);
        address doctorAddr = IDoctorContractForEHR(doctorContract).hNumberToAddress(doctorH);
        return IPatientContract(patientContract).isDoctorPermitted(patientAddr, doctorAddr);
    }

    function canAccessDiagnosticReport(uint256 reportId, address user) public view returns (bool) {
        return IDiagnosticContract(diagnosticContract).canAccessReport(reportId, user);
    }

    function addPatient(address _patient) external {
        // Only callable by PatientContract
        require(msg.sender == patientContract, "Only PatientContract");
        allPatients.push(_patient);
    }

    function addDoctor(address _doctor) external {
        // Only callable by DoctorContract
        require(msg.sender == doctorContract, "Only DoctorContract");
        allDoctors.push(_doctor);
    }

    function addDiagnostic(address) external {
        // Only callable by DiagnosticContract
        require(msg.sender == diagnosticContract, "Only DiagnosticContract");
        // Emit an event to indicate diagnostic registration (state change)
        emit AuditLogged(msg.sender, "DiagnosticRegistered");
    }

    function updateDoctorPermission(address _patient, address _doctor, bool granted) external {
        // Only callable by PatientContract
        require(msg.sender == patientContract, "Only PatientContract");
        if (granted) {
            if (!patientDoctorPermission[_patient][_doctor]) {
                doctorToPermittedPatients[_doctor].push(_patient);
                patientDoctorPermission[_patient][_doctor] = true;
            }
        } else {
            if (patientDoctorPermission[_patient][_doctor]) {
                // Remove patient from doctor's permitted list
                address[] storage arr = doctorToPermittedPatients[_doctor];
                for (uint i = 0; i < arr.length; i++) {
                    if (arr[i] == _patient) {
                        arr[i] = arr[arr.length - 1];
                        arr.pop();
                        break;
                    }
                }
                patientDoctorPermission[_patient][_doctor] = false;
            }
        }
    }

    function getPermittedPatientsForDoctor(address _doctor) public view returns (address[] memory) {
        return doctorToPermittedPatients[_doctor];
    }
    
    function getAllPatients() public view returns (address[] memory) {
        return allPatients;
    }

    function getAllDoctors() public view returns (address[] memory) {
        return allDoctors;
    }

    function setPatientContract(address _patientContract) external onlyOwner {
        patientContract = _patientContract;
    }

    function setDoctorContract(address _doctorContract) external onlyOwner {
        doctorContract = _doctorContract;
    }

    function setDiagnosticContract(address _diagnosticContract) external onlyOwner {
        diagnosticContract = _diagnosticContract;
    }

    // --- GLOBAL H NUMBER UNIQUENESS ---
    // Returns true if the H number is already used by any user type
    function isHNumberUsed(string memory _hNumber) public view returns (bool) {
        return hNumberToAddress[_hNumber] != address(0);
    }

    // Registers an H number globally; only callable by user contracts
    function registerHNumber(string memory _hNumber, address user) public {
        // Only allow Patient, Doctor, or Diagnostic contracts to call
        require(
            msg.sender == patientContract ||
            msg.sender == doctorContract ||
            msg.sender == diagnosticContract,
            "Only user contracts can register H Number"
        );
        require(hNumberToAddress[_hNumber] == address(0), "H Number already used");
        hNumberToAddress[_hNumber] = user;
    }
} 
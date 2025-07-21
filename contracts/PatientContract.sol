// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEHRSystem {
    function addPatient(address _patient) external;
    function updateDoctorPermission(address _patient, address _doctor, bool granted) external;
    function isHNumberUsed(string memory _hNumber) external view returns (bool);
    function registerHNumber(string memory _hNumber, address _patient) external;
}

interface IDoctorContract {
    function addPatientAccessFromPatient(address _doctor, address _patient) external;
}

contract PatientContract {
    struct Patient {
        address wallet;
        string hNumber;
        string name;
        string bloodGroup;
        string homeAddress;
        string dateOfBirth;
        string gender;
        string email;
        string passwordHash;
        bool exists;
    }

    struct MedicalRecord {
        uint256 recordId;
        string ipfsHash;
        uint256 timestamp;
        string recordType;
    }

    struct Permission {
        address doctor;
        uint256 grantedAt;
        bool active;
    }

    mapping(address => Patient) public patients;
    mapping(string => address) public hNumberToAddress;
    mapping(address => MedicalRecord[]) public medicalRecords;
    mapping(address => Permission[]) public permissions;
    mapping(address => mapping(address => bool)) public doctorAccess; // patient => doctor => access

    event PatientRegistered(address indexed wallet, string hNumber, string name);
    event MedicalRecordUploaded(address indexed patient, uint256 recordId, string ipfsHash, string recordType);
    event PermissionGranted(address indexed patient, address indexed doctor);
    event PermissionRevoked(address indexed patient, address indexed doctor);
    event PatientProfileUpdated(address indexed wallet);

    address public ehrSystem;
    address public doctorContract;

    constructor(address _ehrSystem) {
        ehrSystem = _ehrSystem;
    }

    modifier onlyPatient() {
        require(patients[msg.sender].exists, "Not a registered patient");
        _;
    }

    function setDoctorContract(address _doctorContract) external {
        // Add onlyOwner if you want to restrict
        doctorContract = _doctorContract;
    }

    function registerPatient(
        string memory _hNumber,
        string memory _name,
        string memory _bloodGroup,
        string memory _homeAddress,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _passwordHash
    ) public {
        require(!patients[msg.sender].exists, "Already registered");
        require(!IEHRSystem(ehrSystem).isHNumberUsed(_hNumber), "H Number already used");
        patients[msg.sender] = Patient({
            wallet: msg.sender,
            hNumber: _hNumber,
            name: _name,
            bloodGroup: _bloodGroup,
            homeAddress: _homeAddress,
            dateOfBirth: _dateOfBirth,
            gender: _gender,
            email: _email,
            passwordHash: _passwordHash,
            exists: true
        });
        IEHRSystem(ehrSystem).registerHNumber(_hNumber, msg.sender);
        IEHRSystem(ehrSystem).addPatient(msg.sender);
        emit PatientRegistered(msg.sender, _hNumber, _name);
    }

    function uploadMedicalRecord(string memory _ipfsHash, string memory _recordType) public onlyPatient {
        uint256 recordId = medicalRecords[msg.sender].length + 1;
        medicalRecords[msg.sender].push(MedicalRecord({
            recordId: recordId,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            recordType: _recordType
        }));
        emit MedicalRecordUploaded(msg.sender, recordId, _ipfsHash, _recordType);
    }

    function grantPermission(address _doctor) public onlyPatient {
        require(!doctorAccess[msg.sender][_doctor], "Already granted");
        permissions[msg.sender].push(Permission({
            doctor: _doctor,
            grantedAt: block.timestamp,
            active: true
        }));
        doctorAccess[msg.sender][_doctor] = true;
        IEHRSystem(ehrSystem).updateDoctorPermission(msg.sender, _doctor, true);
        // Cross-contract sync: update DoctorContract
        if (doctorContract != address(0)) {
            IDoctorContract(doctorContract).addPatientAccessFromPatient(_doctor, msg.sender);
        }
        emit PermissionGranted(msg.sender, _doctor);
    }

    function revokePermission(address _doctor) public onlyPatient {
        require(doctorAccess[msg.sender][_doctor], "Not granted");
        doctorAccess[msg.sender][_doctor] = false;
        // Mark as inactive in permissions array
        for (uint i = 0; i < permissions[msg.sender].length; i++) {
            if (permissions[msg.sender][i].doctor == _doctor && permissions[msg.sender][i].active) {
                permissions[msg.sender][i].active = false;
            }
        }
        IEHRSystem(ehrSystem).updateDoctorPermission(msg.sender, _doctor, false);
        emit PermissionRevoked(msg.sender, _doctor);
    }

    function updateProfile(
        string memory _name,
        string memory _bloodGroup,
        string memory _homeAddress,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email
    ) public onlyPatient {
        Patient storage p = patients[msg.sender];
        p.name = _name;
        p.bloodGroup = _bloodGroup;
        p.homeAddress = _homeAddress;
        p.dateOfBirth = _dateOfBirth;
        p.gender = _gender;
        p.email = _email;
        emit PatientProfileUpdated(msg.sender);
    }

    function getMedicalRecords(address _patient) public view returns (MedicalRecord[] memory) {
        // Only the patient or a doctor with permission can view
        require(
            msg.sender == _patient || doctorAccess[_patient][msg.sender],
            "Not authorized"
        );
        return medicalRecords[_patient];
    }

    function getPermissions(address _patient) public view returns (Permission[] memory) {
        require(msg.sender == _patient, "Not authorized");
        return permissions[_patient];
    }

    function isDoctorPermitted(address _patient, address _doctor) public view returns (bool) {
        return doctorAccess[_patient][_doctor];
    }
} 
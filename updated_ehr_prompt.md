# AI Development Prompt: Blockchain-Based Electronic Health Records System

## Project Overview
Build a complete decentralized Electronic Health Records (EHR) management system using Ethereum blockchain technology. This system addresses centralization, security, interoperability, and privacy issues in traditional EHR systems.

## Core Requirements

### Problem Statement
Create a secure, decentralized EHR system that:
- Eliminates centralized control and single points of failure
- Ensures data integrity through blockchain immutability
- Provides patient-controlled access permissions
- Enables secure file storage and sharing
- Maintains complete audit trails

### System Architecture
- **Frontend**: React.js web application with responsive design
- **Blockchain**: Ethereum smart contracts using Solidity
- **Storage**: IPFS for decentralized file storage
- **Development**: Ganache for local blockchain, Truffle for deployment
- **Wallet**: MetaMask integration for blockchain interactions

## Tech Stack Requirements

### Backend/Blockchain
- **Three Separate Solidity Smart Contracts**: PatientContract, DoctorContract, DiagnosticContract
- **Main Contract**: EHRSystem contract for inter-contract communication
- Truffle Suite for contract compilation and deployment
- Ganache CLI for local blockchain development
- Web3.js for blockchain interaction

### Frontend
- React.js with hooks (useState, useEffect)
- Web3.js or Ethers.js for blockchain connectivity
- Axios for HTTP requests
- Bootstrap or Tailwind CSS for styling
- React Router for navigation

### Storage & Integration
- IPFS HTTP client for file operations
- MetaMask browser extension integration
- Form validation libraries

## User Roles & Authentication

### Three User Types
1. **Patient**: Upload records, grant/revoke permissions, view own data
2. **Doctor**: Access permitted patient records, create consultancy reports
3. **Diagnostic Center**: Create diagnostic reports, upload test results

#### Additional Form Features and Validations
- **H Number Validation**: Must be exactly 6 digits and unique across all users
- **Real-time Validation**: Show validation messages as user types
- **Field Dependencies**: Some fields may be interdependent (e.g., specialization affects available departments)
- **Dropdown Population**: Dynamic dropdown options based on medical standards
- **Date Validation**: Ensure valid dates (birth date cannot be in future)
- **Phone Validation**: Proper phone number format validation
- **Address Formatting**: Standardized address input with proper formatting
- **Role-based Field Display**: Show/hide fields based on selected user role
- **Auto-save Draft**: Save form progress to prevent data loss
- **Blockchain Confirmation**: Display transaction hash and confirmation status after successful registration

## Detailed Feature Requirements

### 1. Navigation Structure and Main Application Layout

#### Home Screen with Navigation Panel
Create a main application layout with a persistent navigation panel containing the following components:

**Navigation Components:**
- **Home**: Returns user to the main home screen/landing page
- **About Us**: Displays information about the project and development team
- **Registration**: Shows role selection for user registration
- **Login**: Shows role selection for user authentication

#### Home Screen Features
- **Welcome Section**: Introduction to the decentralized EHR system
- **System Overview**: Brief explanation of blockchain-based healthcare records
- **Key Features Highlight**: Benefits of decentralized healthcare data management
- **Getting Started Guide**: Quick steps for new users to begin using the system
- **MetaMask Connection Status**: Display wallet connection status prominently
- **System Statistics**: Show number of registered users, stored records, etc.

#### About Us Page Features
- **Project Information**: Detailed description of the EHR system and its benefits
- **Technology Stack**: Information about blockchain, IPFS, and other technologies used
- **Team Information**: Details about the development team and contributors
- **Contact Information**: Ways to reach the development team
- **System Vision**: Long-term goals and objectives of the project
- **Privacy Policy**: Information about data handling and privacy measures

#### Registration Page Structure
Create a registration page with three distinct role selection buttons:

**Role Selection Interface:**
- **Patient Registration Button**: Large, prominent button leading to patient registration form
- **Doctor Registration Button**: Large, prominent button leading to doctor registration form
- **Diagnostic Center Registration Button**: Large, prominent button leading to diagnostic center registration form

**Page Layout:**
- **Header**: "Choose Your Role to Register"
- **Role Cards**: Each role displayed as a card with icon, title, and description
- **Role Descriptions**: Brief explanation of what each role can do in the system
- **Navigation Flow**: Clicking a role button navigates to the specific registration form

#### Login Page Structure
Create a login page with three distinct role selection buttons for authentication:

**Role Selection Interface:**
- **Patient Login Button**: Large, prominent button leading to patient login form
- **Doctor Login Button**: Large, prominent button leading to doctor login form
- **Diagnostic Center Login Button**: Large, prominent button leading to diagnostic center login form

**Page Layout:**
- **Header**: "Choose Your Role to Login"
- **Role Cards**: Each role displayed as a card with icon, title, and brief description
- **Login Flow**: Clicking a role button navigates to the specific login form
- **Registration Link**: "Don't have an account? Register here" link for each role

### 2. User Registration System

#### Common Registration Requirements
- **Wallet Address Integration**: Auto-fill from MetaMask connection
- **H Number System**: 6-digit unique identifier for login authentication
- **Email Validation**: Proper email format validation with uniqueness check
- **Password Security**: Minimum 8 characters with strength validation
- **Password Confirmation**: Must match original password field
- **Form Validation**: Real-time validation for all required fields with error messages
- **MetaMask Transaction**: Registration data submission requires blockchain transaction confirmation

#### Doctor Registration Form Fields
- **Wallet Public Address** (auto-filled from MetaMask connection)
- **Doctor Name** (text input, required)
- **Hospital Name** (text input, required)
- **Location** (text input, required)
- **Date of Birth** (date picker, required)
- **Gender** (dropdown: Male, Female, Other)
- **Email ID** (email input with validation, required)
- **H Number** (6-digit unique identifier, number input, required)
- **Specialization** (dropdown: Dermatology, Cardiology, Neurology, Orthopedics, etc.)
- **Department** (text input, required)
- **Designation** (dropdown: Doctor, Senior Doctor, Consultant, etc.)
- **Work Experience** (number input for years, required)
- **Password** (password input with strength validation, required)
- **Confirm Password** (password confirmation, must match password, required)

#### Patient Registration Form Fields
- **Wallet Public Address** (auto-filled from MetaMask connection)
- **Patient Name** (text input, required)
- **Gender** (dropdown: Male, Female, Other)
- **Blood Group** (dropdown: A+, B+, AB+, O+, A-, B-, AB-, O-)
- **Home Address** (textarea, required)
- **Date of Birth** (date picker, required)
- **Email ID** (email input with validation, required)
- **H Number** (6-digit unique identifier, number input, required)
- **Password** (password input with strength validation, required)
- **Confirm Password** (password confirmation, must match password, required)

#### Diagnostic Center Registration Form Fields
- **Wallet Public Address** (auto-filled from MetaMask connection)
- **Diagnostic Center Name** (text input, required)
- **Location/Address** (textarea, required)
- **Contact Number** (phone input with validation, required)
- **Email ID** (email input with validation, required)
- **H Number** (6-digit unique identifier, number input, required)
- **License Number** (text input, required)
- **Established Date** (date picker, required)
- **Services Offered** (multi-select: X-Ray, MRI, CT Scan, Blood Test, etc.)
- **Password** (password input with strength validation, required)
- **Confirm Password** (password confirmation, must match password, required)

### 3. Smart Contract Architecture - Role-Based Contracts

#### Create Four Separate Smart Contracts:

##### PatientContract.sol
- **Patient Registration**: Store patient-specific information (name, blood group, address, H number)
- **Medical Record Management**: Upload past records, view own records, record timestamps
- **Permission Management**: Grant permission to doctors, revoke permissions, track permission history
- **Personal Profile**: Update patient information, manage contact details
- **Record Access Control**: Ensure only patient can upload their own records
- **IPFS Integration**: Link patient records to IPFS hashes

##### DoctorContract.sol
- **Doctor Registration**: Store doctor-specific information (name, hospital, specialization, experience)
- **Professional Profile**: Hospital affiliation, department, designation, credentials
- **Patient List Management**: View patients who granted permission, manage patient relationships
- **Consultancy Reports**: Create consultation records, diagnosis documentation, prescription management
- **Record Access**: Access patient records only with valid permissions
- **Permission Verification**: Check if doctor has access to specific patient records

##### DiagnosticContract.sol
- **Diagnostic Center Registration**: Store center information (name, location, services, license)
- **Report Creation**: Generate diagnostic reports with patient and doctor information
- **File Management**: Upload diagnostic files to IPFS, link reports to blockchain
- **Dual Access Setup**: Ensure both patient and referring doctor can access reports
- **Test Categories**: Manage different types of diagnostic tests (X-Ray, MRI, Blood Test)
- **Report Metadata**: Store report details, timestamps, and associated parties

##### EHRSystem.sol (Main Contract)
- **Contract Orchestration**: Coordinate between all three role-based contracts
- **Cross-Contract Communication**: Enable data sharing between patient, doctor, and diagnostic contracts
- **Permission Management**: Central permission system managing access rights
- **User Authentication**: Verify user roles and H number authentication
- **Global Functions**: Common functions used across all user types
- **Security Layer**: Implement access control and authorization checks

#### Inter-Contract Communication Structure:
- **Patient-Doctor Interaction**: Patient contract communicates with doctor contract for permission grants
- **Doctor-Diagnostic Interaction**: Doctor contract interfaces with diagnostic contract for test orders
- **Diagnostic-Patient Interaction**: Diagnostic contract shares reports with patient contract
- **Main Contract Oversight**: EHRSystem contract manages all inter-contract communications

#### Data Structures for Each Contract:

##### PatientContract Data Structures:
- Patient struct with wallet address, H number, name, blood group, address, date of birth
- MedicalRecord struct with record ID, IPFS hash, upload timestamp, record type
- Permission struct tracking granted doctors with timestamps and active status
- PersonalProfile struct with contact information and emergency details

##### DoctorContract Data Structures:
- Doctor struct with wallet address, H number, name, hospital, specialization, experience
- ProfessionalProfile struct with department, designation, credentials, work history
- ConsultancyReport struct with patient address, diagnosis, prescription, timestamp
- PatientAccess struct tracking which patients granted permission and access dates

##### DiagnosticContract Data Structures:
- DiagnosticCenter struct with center details, location, services offered, license info
- DiagnosticReport struct with patient address, doctor address, test type, results
- ReportFile struct linking IPFS hash to report metadata and access permissions
- TestOrder struct with prescribing doctor, patient, and test requirements

##### EHRSystem Data Structures:
- User struct with role identification and cross-contract references
- PermissionMap struct managing global access rights between all user types
- AuditLog struct for system-wide activity tracking and compliance
- SystemConfig struct for global system parameters and emergency protocols

### 4. Frontend Components Structure

#### Main Application Architecture
Create a React application with the following structure:

**App.js Components:**
- **Header Navigation**: Persistent navigation bar with Home, About Us, Registration, Login links
- **MetaMask Connection**: Wallet connection status display and connection button
- **Router Configuration**: React Router setup for all main pages
- **Footer**: Contact information and system links

**Page Components:**
- **HomePage**: Landing page with system overview and getting started guide
- **AboutUsPage**: Project information and team details
- **RegistrationPage**: Role selection for registration (3 buttons)
- **LoginPage**: Role selection for login (3 buttons)
- **Role-specific Registration Forms**: Separate forms for each user type
- **Role-specific Login Forms**: Separate login forms for each user type
- **Role-specific Dashboards**: Dashboard for each user type after login

#### Navigation Flow Implementation
- **Home Navigation**: Always returns to main landing page
- **About Us Navigation**: Displays project information page
- **Registration Navigation**: Shows role selection page with 3 buttons
- **Login Navigation**: Shows role selection page with 3 buttons
- **Role-specific Navigation**: After role selection, navigate to appropriate forms
- **Dashboard Navigation**: After successful login, navigate to role-specific dashboard

#### Registration Page Features
- **Role Selection Cards**: Three prominent cards for Patient, Doctor, and Diagnostic Center
- **Role Descriptions**: Clear description of each role's capabilities
- **Visual Icons**: Distinctive icons for each role type
- **Navigation Buttons**: Large, clearly labeled buttons for each role
- **Back to Home**: Easy navigation back to main page

#### Login System Features
- **Role Selection Interface**: Three prominent buttons for role-based login
- **H Number Input**: 6-digit unique identifier validation
- **Password Verification**: Secure password input with validation
- **Role Detection**: Automatic role detection and appropriate dashboard redirection
- **Session Management**: User state persistence across sessions
- **Registration Links**: Easy navigation to registration for new users

#### Patient Dashboard Requirements
Create sections for profile management with view and edit capabilities, medical records section with upload functionality and chronological record display, and permission management to grant access to doctors and view/revoke existing permissions.

#### Doctor Dashboard Requirements
Build interface for viewing profile information, managing patient list showing only those who granted permission, accessing patient medical records with detailed view modals, and creating consultancy reports with diagnosis and prescription fields.

#### Diagnostic Dashboard Requirements
Implement profile management, report creation forms requiring patient and doctor information with dual wallet addresses, and file upload interface for diagnostic reports with blockchain record creation.

### 5. IPFS Integration Requirements

#### File Operations Implementation
Create functions to upload files to IPFS and return hash values, retrieve files from IPFS using hash values, validate file types and sizes before upload, and display progress indicators during upload/download operations.

#### File Management Features
- Support for multiple file formats (PDF, JPG, PNG, DOCX)
- File size validation and limits
- IPFS hash storage in blockchain records
- File integrity verification using hash comparison

### 6. MetaMask Integration

#### Wallet Connection Management
Implement functions to detect MetaMask availability, request account access from users, retrieve current connected account, handle account changes, and manage connection status throughout the application.

#### Transaction Processing
Create system for initiating blockchain transactions, displaying transaction confirmation popups, showing gas fee estimates, tracking transaction status, and handling transaction errors with user-friendly messages.

### 7. Specific Workflows to Implement

#### Patient Workflow Implementation
Build complete flow from registration with MetaMask confirmation through login validation, medical record upload with IPFS storage, permission granting to doctors, and comprehensive record viewing with timestamp display.

#### Doctor Workflow Implementation
Create workflow for professional registration, login authentication, patient list management, medical record access with permission verification, consultancy report creation, and permission management.

#### Diagnostic Workflow Implementation
Implement registration for diagnostic centers, report creation requiring patient and doctor details, file upload to IPFS with blockchain linking, and dual access setup for both patients and doctors.

### 8. Database/Storage Schema Design

#### Blockchain Storage Structure
Design storage for user registration data, permission relationships, medical record metadata, transaction histories, and audit trails with timestamp information.

#### IPFS Storage Organization
Structure file storage for medical documents, diagnostic reports, prescription files, and historical records with proper hash management and retrieval systems.

### 9. Security Implementation

#### Authentication Security
Implement wallet address verification against registered users, H Number uniqueness validation, role-based access control throughout application, and secure session management.

#### Data Protection Measures
Create IPFS hash integrity verification, leverage blockchain immutability for audit trails, implement permission-based file access controls, and maintain comprehensive activity logging.

### 10. User Interface Requirements

#### Design Implementation
Build responsive design supporting mobile and desktop devices, create clean medical-professional interface, implement loading indicators for blockchain operations, design success/error notification system, and create modal dialogs for detailed information display.

#### Navigation System
Implement persistent navigation bar with Home, About Us, Registration, Login links, role-based navigation menus within dashboards, breadcrumb navigation for complex workflows, quick access buttons for common actions, and proper logout functionality with session cleanup.

### 11. Core Business Logic Implementation

#### Permission Management System
Create granular permission system allowing patients to grant specific doctors access, implement permission revocation functionality, build permission history tracking, and ensure automatic cleanup when consultations end.

#### Medical Record Lifecycle
Implement complete record creation from upload through blockchain storage, build chronological record display with filtering options, create record sharing between authorized parties, and maintain version control for updated records.

#### Multi-Party Access Control
Design system allowing diagnostic reports to be accessible by both patients and doctors, implement role-based viewing restrictions, create audit logging for all access attempts, and maintain privacy controls throughout.

## Implementation Priority Phases

### Phase 1: Foundation
Focus on smart contract development and deployment, basic React application structure with navigation, MetaMask integration setup, and core user registration system with role selection.

### Phase 2: Core Functionality
Implement login and authentication systems with role selection, build basic dashboards for each user type, create permission management system, and integrate IPFS for file storage.

### Phase 3: Advanced Features
Build complete medical record management, implement consultancy report creation, create diagnostic report system, and add permission revocation capabilities.

### Phase 4: Refinement
Focus on UI/UX improvements, comprehensive error handling and validation, complete testing implementation, and documentation creation.

## Project Structure Requirements

Create organized project structure with separate directories for smart contracts (PatientContract.sol, DoctorContract.sol, DiagnosticContract.sol, EHRSystem.sol), React components organized by pages and user roles, utility functions for each contract interaction, services for blockchain and IPFS operations, comprehensive tests for each contract, and configuration files. Include proper package.json with all dependencies, truffle configuration for multiple contract deployment, migration scripts for all four contracts, and comprehensive README with setup instructions for the multi-contract architecture.

## Success Criteria Validation

The completed system must successfully provide intuitive navigation between Home, About Us, Registration, and Login pages, allow all three user types to register and authenticate through role selection, enable secure file upload and storage via IPFS, implement functional permission granting and revocation, support complete medical record management, integrate all blockchain transactions properly, and provide seamless MetaMask wallet connectivity.

Build this as a production-ready system demonstrating blockchain technology's practical application in healthcare data management, ensuring all features work together cohesively and securely with an intuitive user interface and clear navigation structure.
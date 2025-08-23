export const BLOOD_GROUPS = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const SPECIALIZATIONS = [
  'Dermatology', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Radiology', 'Oncology', 'Other'
];
export const DESIGNATIONS = [
  'Doctor', 'Senior Doctor', 'Consultant', 'Resident', 'Other'
];
export const SERVICES = [
  'X-Ray', 'MRI', 'CT Scan', 'Blood Test', 'Ultrasound', 'ECG', 'Other'
];

// Validation helpers
export const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
export const validateHNumber = (hNumber) => /^\d{6}$/.test(hNumber);
export const validatePassword = (password) => password.length >= 8;
export const validateRequired = (value) => value !== undefined && value !== null && value !== ''; 
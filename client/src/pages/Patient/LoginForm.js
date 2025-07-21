import React from 'react';
import GenericLoginForm from '../../components/GenericLoginForm';
import PatientContractABI from '../../abis/PatientContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import PersonIcon from '@mui/icons-material/Person';
import { ROLES } from '../../constants/roles';

const patientRole = ROLES.find(r => r.key === 'patient');
const PatientLoginForm = () => (
  <GenericLoginForm
    contractABI={PatientContractABI.abi}
    contractAddress={contractAddresses.PatientContract}
    role="patient"
    icon={<PersonIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />}
    title="Patient Login"
    redirectPath="/dashboard/patient"
    getUserMethod="patients"
    userExistsKey="exists"
    userHNumberKey="hNumber"
    userPasswordHashKey="passwordHash"
    color={patientRole.color}
    gradient={patientRole.gradient}
  />
  );

export default PatientLoginForm; 
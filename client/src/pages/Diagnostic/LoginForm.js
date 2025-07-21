import React from 'react';
import GenericLoginForm from '../../components/GenericLoginForm';
import DiagnosticContractABI from '../../abis/DiagnosticContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import ScienceIcon from '@mui/icons-material/Science';
import { ROLES } from '../../constants/roles';

const diagnosticRole = ROLES.find(r => r.key === 'diagnostic');
const DiagnosticLoginForm = () => (
  <GenericLoginForm
    contractABI={DiagnosticContractABI.abi}
    contractAddress={contractAddresses.DiagnosticContract}
    role="diagnostic"
    icon={<ScienceIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />}
    title="Diagnostic Center Login"
    redirectPath="/dashboard/diagnostic"
    getUserMethod="centers"
    userExistsKey="exists"
    userHNumberKey="hNumber"
    userPasswordHashKey="passwordHash"
    color={diagnosticRole.color}
    gradient={diagnosticRole.gradient}
  />
  );

export default DiagnosticLoginForm; 
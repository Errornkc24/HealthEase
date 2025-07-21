import React from 'react';
import GenericLoginForm from '../../components/GenericLoginForm';
import DoctorContractABI from '../../abis/DoctorContract.json';
import contractAddresses from '../../config/contractAddresses.json';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { ROLES } from '../../constants/roles';

const doctorRole = ROLES.find(r => r.key === 'doctor');
const DoctorLoginForm = () => (
  <GenericLoginForm
    contractABI={DoctorContractABI.abi}
    contractAddress={contractAddresses.DoctorContract}
    role="doctor"
    icon={<LocalHospitalIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />}
    title="Doctor Login"
    redirectPath="/dashboard/doctor"
    getUserMethod="doctors"
    userExistsKey="exists"
    userHNumberKey="hNumber"
    userPasswordHashKey="passwordHash"
    color={doctorRole.color}
    gradient={doctorRole.gradient}
  />
  );

export default DoctorLoginForm; 
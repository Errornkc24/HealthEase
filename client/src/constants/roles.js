import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';

export const ROLES = [
  {
    key: 'patient',
    title: 'Patient',
    description: 'Access your health records and manage permissions.',
    icon: <PersonIcon color="primary" sx={{ fontSize: 40 }} />,
    route: '/login/patient',
    registrationRoute: '/register/patient',
    color: '#4f8cff',
    gradient: 'linear-gradient(120deg, #e3f0ff 0%, #b6e0fe 100%)',
  },
  {
    key: 'doctor',
    title: 'Doctor',
    description: 'View patient records and add consultancy reports.',
    icon: <LocalHospitalIcon color="primary" sx={{ fontSize: 40 }} />,
    route: '/login/doctor',
    registrationRoute: '/register/doctor',
    color: '#00bfae',
    gradient: 'linear-gradient(120deg, #e0f7fa 0%, #b2f7ef 100%)',
  },
  {
    key: 'diagnostic',
    title: 'Diagnostic Center',
    description: 'Upload and manage diagnostic reports for patients.',
    icon: <ScienceIcon color="primary" sx={{ fontSize: 40 }} />,
    route: '/login/diagnostic',
    registrationRoute: '/register/diagnostic',
    color: '#b266ff',
    gradient: 'linear-gradient(120deg, #ede7f6 0%, #eac8ff 100%)',
  },
]; 
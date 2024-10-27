import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import pageStyles from '@/styles/Page.module.css';
import { Button } from '@mui/material';
import { purpleBtn } from '@/styles/sxStyles';

interface WaitingProps {
  setStatus: Dispatch<SetStateAction<number>>;
}

const WaitingScreen: React.FC<WaitingProps> = ({ setStatus }) => {
  const [role, setRole] = useState<string | null>('student');
  const [access, setAccess] = useState(false);
  
  const nextStatus = () => {
    setStatus(1);
  }

  useEffect(() => {
    if (localStorage.getItem('role') === 'admin') {
      setAccess(true);
    }
    setRole(localStorage.getItem('role'));
  }, []);

  return <div className={pageStyles['waiting-screen']}>
    <p className={pageStyles.timeline}>
      Enrolment for team allocation closes at
      <span className={pageStyles.bold}> 12.00pm xx.xx.xxxx</span>
    </p>
    {role !== 'student' && 
      <p className={pageStyles.timeline}>
        Coach review opens for 3 days starting from
        <span className={pageStyles.bold}> 12.00pm xx.xx.xxxx</span>
      </p>
    }
    <p className={pageStyles.timeline}>
      Finalised team allocations will be released after
      <span className={pageStyles.bold}> 12.00pm xx.xx.xxxx</span>
    </p>
    {access && <Button sx={{ ...purpleBtn, mt: '15px' }} onClick={nextStatus}>Allocate Teams</Button>}
  </div>
}

export default WaitingScreen;
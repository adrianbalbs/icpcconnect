import { Dispatch, SetStateAction } from 'react';
import pageStyles from '../../styles/Page.module.css';
import { Button } from '@mui/material';

interface WaitingProps {
  setStatus: Dispatch<SetStateAction<string>>;
}

const WaitingScreen: React.FC<WaitingProps> = ({ setStatus }) => {
  return <div className={pageStyles['waiting-screen']}>
    <p>Enrolment for team allocation closes at <span className={pageStyles.bold}>12.00pm xx.xx.xxxx</span></p>
    <p>Coach review opens for 3 days starting from <span className={pageStyles.bold}>12.00pm xx.xx.xxxx</span></p>
    <p>Finalised team allocations will be released after <span className={pageStyles.bold}>12.00pm xx.xx.xxxx</span></p>
    <Button onClick={() => setStatus('Waiting for all teams to be allocated...')}>Allocate Teams</Button>
  </div>
}

export default WaitingScreen;
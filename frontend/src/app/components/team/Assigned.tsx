
import pageStyles from '@/styles/Page.module.css';
import Member from './Member';

const Assigned: React.FC = () => {
  return <>
    <div className={pageStyles['horizontal-container']}>
    <b>Team Member Name</b>
    <b>Student ID</b>
    <b>email</b>
    </div>
    <hr className={pageStyles['divider']}></hr>

    <Member name={"Adrian 2"} studentId={"z1329812"} email={"adrian2@tmtfctry.com"}></Member>
    <Member name={"Rachel Chen"} studentId={"z5432123"} email={"z5432123@ad.unsw.edu.au"}></Member>
    <Member name={"Jerry 2"} studentId={"z3748211"} email={"Jerry2@tmtfctry.com"}></Member>
  </>;
}

export default Assigned;
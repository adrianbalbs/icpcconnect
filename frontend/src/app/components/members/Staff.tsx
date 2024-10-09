import memberStyles from '@/styles/Members.module.css';
import pageStyles from '@/styles/Page.module.css';

export interface StaffProps {
  id: string;
  name: string;
  institution: string;
  email: string;
}

const Staff: React.FC<StaffProps> = ({ id, name, institution, email }) => {
  return <>
    <div className={`${memberStyles.staff} ${memberStyles.space}`}>
      <p id={id}>{name}</p>
      <p>{institution}</p>
      <p className={memberStyles.overflow}>{email}</p>
    </div>
    <hr className={pageStyles.divider}/>
  </>;
}

export default Staff;

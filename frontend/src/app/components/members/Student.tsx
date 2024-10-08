import memberStyles from '../../styles/Members.module.css';
import pageStyles from '../../styles/Page.module.css';

export interface StudentProps {
  id: string;
  name: string;
  team: string;
  institution: string;
  email: string;
}

const Student: React.FC<StudentProps> = ({ id, name, team, institution, email }) => {
  return <>
    <div className={`${memberStyles.students} ${memberStyles.space}`}>
      <p id={id}>{name}</p>
      <p>{team}</p>
      <p>{institution}</p>
      <p className={memberStyles.overflow}>{email}</p>
    </div>
    <hr className={pageStyles.divider}/>
  </>;
}

export default Student;
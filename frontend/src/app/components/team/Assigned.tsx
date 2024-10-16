
import pageStyles from '@/styles/Page.module.css';
import memberStyles from '@/styles/Members.module.css';
import Member from './Member';

interface AssignedProps {
  members: Array<{
    id: string;
    givenName: string;
    familyName: string;
    studentId: string;
    email: string;
  }>;
}

const Assigned: React.FC<AssignedProps> = ({ members }) => {
  return (
    <div className={memberStyles.gap}>
      <div className={`${pageStyles.bold} ${memberStyles.staff}`}>
        <p>Team Member Name</p>
        <p>Student ID</p>
        <p>Email</p>
      </div>
      <hr className={pageStyles.divider} />
      {members.map(member => <Member key={member.id} {...member} />)}
    </div>
  );
}

export default Assigned;
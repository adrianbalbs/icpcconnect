
import pageStyles from '@/styles/Page.module.css';
import memberStyles from '@/styles/Members.module.css';
import Member, { MemberProps } from './Member';

interface AssignedProps {
  members: MemberProps[];
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
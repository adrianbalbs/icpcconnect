import pageStyles from '../../styles/Page.module.css';
import teamStyles from '../../styles/Teams.module.css';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

interface TeamCardProps {
  name: string;
  institution: string;
  members: Array<string>;
  canEdit: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ name, institution, members, canEdit }) => {
  return <div className={teamStyles['team-container']}>
    <div className={teamStyles.team}>
      <p><span className={pageStyles.bold}>Team Name:</span> {name}   {canEdit && <DriveFileRenameOutlineOutlinedIcon />}</p>
      <p><span className={pageStyles.bold}>Institution:</span> {institution}</p>
      <p className={pageStyles.bold}>Members:</p>
      <p className={pageStyles.indented}>{members[0]}</p>
      <p className={pageStyles.indented}>{members[1]}</p>
      <p className={pageStyles.indented}>{members[2]}</p>
    </div>
  </div>
}

export default TeamCard;
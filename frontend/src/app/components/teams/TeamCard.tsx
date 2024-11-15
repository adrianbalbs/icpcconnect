import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import { Member } from "@/types/teams";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import WarningIcon from "@mui/icons-material/Warning";

interface TeamCardProps {
  name: string;
  university: string;
  members: Array<Member>;
  canEdit: boolean;
  replacements: string[];
}

const TeamCard: React.FC<TeamCardProps> = ({
  name,
  university,
  members,
  canEdit,
  replacements,
}) => {
  return (
    <div className={teamStyles["team-container"]}>
      <div className={teamStyles.team}>
        <p>
          <span className={pageStyles.bold}>Team Name:</span> {name}{" "}
          {canEdit && <DriveFileRenameOutlineOutlinedIcon />}
        </p>
        <p>
          <span className={pageStyles.bold}>Institution:</span> {university}
        </p>
        <p className={pageStyles.bold}>Members:</p>
        {members.map((member, index) => (
          <p key={index} className={pageStyles.indented}>
            {`${member.givenName} ${member.familyName}`}
            {replacements.includes(member.id) && <WarningIcon />}
          </p>
        ))}
      </div>
    </div>
  );
};

export default TeamCard;

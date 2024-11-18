import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import { Tooltip, tooltipClasses } from "@mui/material";
// import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";

interface TeamCardProps {
  name: string;
  university: string;
  members: Array<string>;
  canEdit: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({
  name,
  university,
  members,
  // canEdit,
}) => {
  return (
    <div className={teamStyles["team-container"]}>
      <div className={teamStyles.team}>
        <Tooltip
          title={name}
          placement="top-end"
          slotProps={{
            popper: {
              sx: {
                [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                  {
                    marginBottom: "2px",
                  },
              },
            },
          }}
        >
          <p className={teamStyles.overflow}>
            <span className={pageStyles.bold}>Team Name:</span> {name}{" "}
            {/* {canEdit && <DriveFileRenameOutlineOutlinedIcon />} */}
          </p>
        </Tooltip>
        <p>
          <span className={pageStyles.bold}>Institution:</span> {university}
        </p>
        <p className={pageStyles.bold}>Members:</p>
        <p className={pageStyles.indented}>{members[0]}</p>
        <p className={pageStyles.indented}>{members[1]}</p>
        <p className={pageStyles.indented}>{members[2]}</p>
      </div>
    </div>
  );
};

export default TeamCard;

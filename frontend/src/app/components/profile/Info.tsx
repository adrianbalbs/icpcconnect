import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";

interface InfoProps {
  name: string;
  value: string | number;
}

/**
 * Info component
 * - renders a given info field matched by name and value
 */
const Info: React.FC<InfoProps> = ({ name, value }) => {
  return (
    <>
      <div className={profileStyles.content}>
        <p className={pageStyles.bold}>{name}</p>
        <p>{value}</p>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};

export default Info;

import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import { university } from "@/utils/university";

interface InfoProps {
  name: string;
  value: string | number;
}

const Info: React.FC<InfoProps> = ({ name, value }) => {
  return (
    <>
      <div className={profileStyles.content}>
        <p className={pageStyles.bold}>{name}</p>
        <p>{name === "University" ? university[value as number] : value}</p>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};

export default Info;

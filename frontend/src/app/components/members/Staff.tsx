import { useRouter } from "next/navigation";
import memberStyles from "@/styles/Members.module.css";
import pageStyles from "@/styles/Page.module.css";

export interface StaffProps {
  id: string;
  name: string;
  institution: string;
  email: string;
}

/**
 * Staff component
 * - renders shared components of coach and site coordinator
 */
const Staff: React.FC<StaffProps> = ({ id, name, institution, email }) => {
  const router = useRouter();

  const handleClick = () => router.push(`/profile/${id}`);

  return (
    <>
      <div className={`${memberStyles.staff} ${memberStyles.space}`}>
        <p className={memberStyles.name} onClick={handleClick}>
          {name}
        </p>
        <p>{institution}</p>
        <p className={memberStyles.overflow}>{email}</p>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};

export default Staff;

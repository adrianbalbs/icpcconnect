import { useRouter } from "next/navigation";
import memberStyles from "@/styles/Members.module.css";
import pageStyles from "@/styles/Page.module.css";

export interface MemberProps {
  id: string;
  givenName: string;
  familyName: string;
  studentId: string;
  email: string;
}

/**
 * Team Member component
 * - renders a member in a team
 * - includes: student name, student id, email
 */
const Member: React.FC<MemberProps> = ({
  id,
  givenName,
  familyName,
  studentId,
  email,
}) => {
  const router = useRouter();

  const handleClick = () => router.push(`/profile/${id}`);

  return (
    <>
      <div className={`${memberStyles.staff} ${memberStyles.space}`}>
        <p
          className={memberStyles.name}
          onClick={handleClick}
        >{`${givenName} ${familyName}`}</p>
        <p>{studentId}</p>
        <p className={memberStyles.overflow}>{email}</p>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};

export default Member;

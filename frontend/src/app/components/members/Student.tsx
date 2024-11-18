import { useRouter } from "next/navigation";
import memberStyles from "@/styles/Members.module.css";
import pageStyles from "@/styles/Page.module.css";

export interface StudentProps {
  id: string;
  name: string;
  team: string;
  institution: string;
  email: string;
}

/**
 * Student component
 * - renders a given student
 * - includes:
 *    - student name, team name, institution / university, email
 */
const Student: React.FC<StudentProps> = ({
  id,
  name,
  team,
  institution,
  email,
}) => {
  const router = useRouter();

  const handleClick = () => router.push(`/profile/${id}`);

  return (
    <>
      <div className={`${memberStyles.students} ${memberStyles.space}`}>
        <p className={memberStyles.name} onClick={handleClick}>
          {name}
        </p>
        <p>{team}</p>
        <p>{institution}</p>
        <p className={memberStyles.overflow}>{email}</p>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};

export default Student;

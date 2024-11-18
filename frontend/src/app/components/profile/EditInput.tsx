import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";

interface EditProps {
  name: string;
  value: string;
  onChange: (newValue: string, field: string) => void;
}

/**
 * Edit input component
 * - renders text box input for fields such as pronouns
 */
export const EditInput: React.FC<EditProps> = ({ name, value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (name.includes("Name")) {
      const field = name.includes("First") ? "givenName" : "familyName";
      onChange(e.target.value, field);
    } else {
      const field = name === "Pronouns" ? "pronouns" : "dietaryRequirements";
      onChange(e.target.value, field);
    }
  };
  return (
    <>
      <div className={profileStyles["edit-content"]}>
        <p className={pageStyles.bold}>{name}</p>
        <input
          className={profileStyles["edit-box"]}
          value={value}
          onChange={handleInputChange}
        />
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};

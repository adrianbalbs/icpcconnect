import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";

interface EditProps {
  name: string;
  value: string;
  onChange: (newValue: string, field: string) => void;
}

export const EditInput: React.FC<EditProps> = ({ name, value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = name === "Pronouns" ? "pronouns" : "dietaryRequirements";
    onChange(e.target.value, field);
  };
  return (
    <>
      <div className={profileStyles.content}>
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

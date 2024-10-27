"use client";
import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";

interface InfoProps {
  name: string;
  value: string | number;
  edit: boolean;
  onChange: (newValue: string | number) => void;
}

const Info: React.FC<InfoProps> = ({ name, value, edit, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <>
      <div className={profileStyles.content}>
        <p className={pageStyles.bold}>{name}</p>
        {edit ? (
          (() => {
            if (
              name ===
              "Do you consent to appear in photos and videos taken on the day of the contest?"
            ) {
              return (
                <select
                  id="consent"
                  value={value}
                  onChange={handleSelectChange}
                  className={profileStyles["select-box"]}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              );
            } else if (name === "Name") {
              return (
                <input
                  className={profileStyles["edit-box"]}
                  value={value}
                  onChange={handleInputChange}
                />
              );
            } else {
              return (
                <input
                  className={profileStyles["edit-box"]}
                  value={value}
                  onChange={handleInputChange}
                />
              );
            }
          })()
        ) : (
          <p>{value}</p>
        )}
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};

export default Info;

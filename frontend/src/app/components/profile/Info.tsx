'use client'
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';

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

  return (
    <>
      <div className={profileStyles.content}>
        <p className={pageStyles.bold}>{name}</p>
        {edit ? (
          name !== 'Dietary Requirements' ? (
          <input
            className={profileStyles['edit-box']}
            value={value}
            onChange={handleInputChange}
          />
          ) : (
          <input
            className={profileStyles['large-edit-box']}
            value={value}
            onChange={handleInputChange}
          />)
        ) : (
          <p>{value}</p>
        )}
      </div>
      <hr className={pageStyles.divider}/>
    </>
  );
};

export default Info;
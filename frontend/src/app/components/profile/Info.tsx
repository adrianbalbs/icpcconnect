'use client'
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';
import { useState } from 'react';

interface InfoProps {
  name: string;
  value: string | number;
  edit: boolean;
}

const Info: React.FC<InfoProps> = ({ name, value, edit }) => {
  const [newVal, setNewVal] = useState(value);
  return <>
    <div className={profileStyles.content}>
      <p className={pageStyles.bold}>{name}</p>
      {edit ? (
        <form>
          <input className={profileStyles['edit-box']} value={newVal} onChange={(e) => setNewVal(e.target.value)} />
        </form>
      ) : (
        <p>{value}</p>
      )}
    </div>
    <hr className={pageStyles.divider}/>
  </>
}

export default Info;
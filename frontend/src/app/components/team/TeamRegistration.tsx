'use client';

import Tile from './Tile';
import styles from '@/styles/Teams.module.css';
import pageStyles from '@/styles/Page.module.css';
import { useEffect, useState } from 'react';

const TeamRegistration: React.FC = () => {
  const [id, setId] = useState<string | null>(null);
  // const [completed, setCompleted] = useState(0);
  const completed = 0;
  useEffect(() => {
    const storedId = localStorage.getItem('id');
    setId(storedId);
  }, []);
  return <>
    <h1 className={styles.todo}>Todo</h1>
    <p className={styles.indent}>
      <span className={styles.bold}>{completed} of 3 </span> 
      completed
      <div className={pageStyles['horizontal-container']}>
        <Tile title="Edit your Profile"
        description="Add your preferred pronouns, any allergies or dietary requirements and choose a photo to represent yourself"
        buttonText="Edit"
        buttonTo={`profile/${id}`}></Tile>
        <Tile title="Add Experiences"
        description="Tell us what you’re good at, so we can match you with like-minded teammates!"
        buttonText="Fill In"
        buttonTo={`profile/${id}/experience`}></Tile>
        <Tile title="Complete Preferences"
        description="Let us know who you do or do not want to be matched with! Other students won’t see your preferences."
        buttonText="Complete"
        buttonTo={`profile/${id}/preferences`}></Tile>
      </div>
    </p>
  </>
}

export default TeamRegistration;
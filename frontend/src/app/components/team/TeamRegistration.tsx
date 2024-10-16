'use client';

// import { useState } from 'react';
import styles from '@/styles/Teams.module.css';

const TeamRegistration: React.FC = () => {
  // const [completed, setCompleted] = useState(0);
  const completed = 0;

  return <>
    <h1 className={styles.todo}>Todo</h1>
    <p className={styles.indent}>
      <span className={styles.bold}>{completed} of 3 </span> 
      completed
    </p>
  </>
}

export default TeamRegistration;
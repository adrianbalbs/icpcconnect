import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PublicIcon from '@mui/icons-material/Public';
import TerminalIcon from '@mui/icons-material/Terminal';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Experiences, ExperienceType } from '@/profile/[id]/experience/page';
import { useEffect, useState } from 'react';

interface ContestProps {
  added: ExperienceType;
  experience: Experiences;
}

const ContestExperience = ({ added, experience }: ContestProps) => {
  const [contestAdded, setContestAdded] = useState({
    codeforcesRating: false,
    contestExperience: false,
    leetcodeRating: false,
  });

  const [contestExp, setContestExp] = useState({
    codeforcesRating: 0,
    contestExperience: 0,
    leetcodeRating: 0,
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coursesTaken, language, ...contests } = added;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { codeforcesRating, contestExperience, leetcodeRating, ...other } = experience;
    setContestAdded(contests);
    setContestExp({ codeforcesRating, contestExperience, leetcodeRating });
  }, [added, experience]);

  return (
    <>
      <h3 className={experienceStyles.heading}>Competitive Experience</h3>
      <hr className={pageStyles.divider} />
      <List sx={{ m: '12px 40px 0', p: 0, width: '100%', maxWidth: 360 }}>
        {contestAdded.contestExperience && <ListItem  sx={{ padding: '5px' }}>
          <ListItemIcon sx={{ color: '#444444' }}><PublicIcon /></ListItemIcon>
          <ListItemText primary="Past Contest(s) Completed" sx={{ fontSize: '14px', color: '#333333' }} />
          <div className={experienceStyles.numbers}>{contestExp.contestExperience}</div>
        </ListItem>}
        {contestAdded.leetcodeRating && <ListItem  sx={{ padding: '5px' }}>
          <ListItemIcon sx={{ color: '#444444' }}><TerminalIcon /></ListItemIcon>
          <ListItemText primary="LeetCode Contest Rating" sx={{ fontSize: '14px', color: '#333333' }} />
          <div className={experienceStyles.numbers}>{contestExp.leetcodeRating}</div>
        </ListItem>}
        {contestAdded.codeforcesRating && <ListItem  sx={{ padding: '5px' }}>
          <ListItemIcon sx={{ color: '#444444' }}><LeaderboardIcon /></ListItemIcon>
          <ListItemText primary="Codeforces Contest Rating" sx={{ fontSize: '14px', color: '#333333' }} />
          <div className={experienceStyles.numbers}>{contestExp.codeforcesRating}</div>
        </ListItem>}
      </List>
      <hr className={experienceStyles.divider}/>
    </>
  );
}

export default ContestExperience;
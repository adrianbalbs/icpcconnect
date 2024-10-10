'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '@/styles/Page.module.css';
import { styled } from '@mui/material/styles';
import { Box, Tabs, Tab} from '@mui/material';
import Menu from './profile/Menu';

interface tabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

interface tabProps {
  label: string;
}

const StyledTabs = styled((props: tabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    width: '100%',
    backgroundColor: '#4167ad',
  },
});

const StyledTab = styled((props: tabProps) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    color: '#6b7ea1',
    '&:hover': {
      color: '#5974a6',
      opacity: 1,
    },
    '&.Mui-selected': {
      color: '#4167ad',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&.Mui-focusVisible': {
      backgroundColor: '#d1eaff',
    },
  }),
);

const Navbar: React.FC = () => {
  const [tab, setTab] = useState(0);
  // const [initialLoad, setInitialLoad] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newTab: number) => {
    setTab(newTab);
    router.push(`${tab === 1 ? '/teams' : '/members'}`);
  };

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setInitialLoad(false);
  //   }, 100); 

  //   return () => clearTimeout(timeout);
  // }, []);

  useEffect(() => {
    if (pathname.includes('teams')) {
      setTab(0);
    } else {
      setTab(1);
    }
  }, [pathname]);

  return <div className={styles.navbar}>
    <h1>ICPCC</h1>

    <Box sx={{ width: '100%', gridColumn: '6' }}>
      <StyledTabs
        value={tab}
        onChange={handleChange}
        aria-label="tabs"
      >
        {/* { (!isStudent && <Tab sx={{ height: '60px', color: '#415478' }} value="teams" label="Teams"/>} */}
        <StyledTab sx={{ height: '60px' }} label="Teams"/>
        <StyledTab label="Members" />
      </StyledTabs>
    </Box>
    <Menu />
  </div>
}

export default Navbar;

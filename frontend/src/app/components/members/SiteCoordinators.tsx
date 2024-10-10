'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { SERVER_URL } from '@/utils/constants';
import pageStyles from '@/styles/Page.module.css';
import memberStyles from '@/styles/Members.module.css';
import Staff, { StaffProps } from './Staff';

interface SiteCoordInfo {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: string;
  site: string;
}

const SiteCoordinators: React.FC = () => {
  const [siteCoords, setSiteCoords] = useState<StaffProps[]>([
    {
      id: '123',
      name: 'Lily Belle',
      institution: 'UNSW',
      email: 'asdlakds'
    },
    {
      id: '123',
      name: 'Rachel Chen',
      institution: 'UNSW',
      email: 'asdlakds'
    }
  ]);

  const getSiteCoords = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/site-coordinators`);
      const allSC: SiteCoordInfo[] = res.data.siteCoordinators;
      const filteredInfo: StaffProps[]  = allSC.map(sc => ({
        id: sc.id,
        name: sc.givenName + ' ' + sc.familyName,
        institution: sc.site,
        email: sc.email,
      }));
      setSiteCoords(filteredInfo);
    } catch (error) {
      alert(`Get sitecoords: ${error}`);
    }
  }

  useEffect(() => {
    getSiteCoords();
  }, []);

  return <div className={memberStyles.gap}>
    <div className={`${pageStyles.bold} ${memberStyles.staff}`}>
      <p>Site Coordinator</p>
      <p>Site</p>
      <p>Email</p>
    </div>
    <hr className={pageStyles.divider}/>
    {siteCoords.map(siteCoord => <Staff key={siteCoord.email} {...siteCoord} />)}
  </div>
}

export default SiteCoordinators;

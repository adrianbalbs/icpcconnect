import pageStyles from '../../styles/Page.module.css';

const WaitingScreen: React.FC = () => {
  return <div className={pageStyles['waiting-screen']}>
    <p>Enrolment for team allocation closes at <span className={pageStyles.bold}>12.00pm xx.xx.xxxx</span></p>
    <p>Coach review opens for 3 days starting from <span className={pageStyles.bold}>12.00pm xx.xx.xxxx</span></p>
    <p>Finalised team allocations will be released after <span className={pageStyles.bold}>12.00pm xx.xx.xxxx</span></p>
  </div>
}

export default WaitingScreen;
import styles from "@/styles/Page.module.css";
import Menu from "./profile/Menu";

const Navbar: React.FC = () => {
  return (
    <div className={styles.navbar}>
      <h1 className={styles.website}>ICPCC</h1>
      <Menu />
    </div>
  );
};

export default Navbar;

import styles from "@/styles/Page.module.css";
// import { styled } from "@mui/material/styles";
// import { Tabs } from "@mui/material";
import Menu from "./profile/Menu";

// interface tabsProps {
//   children?: React.ReactNode;
//   value: number;
//   onChange: (event: React.SyntheticEvent, newValue: number) => void;
// }
//
// interface tabProps {
//   label: string;
// }
//
// const StyledTabs = styled((props: tabsProps) => (
//   <Tabs
//     {...props}
//     TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
//   />
// ))({
//   "& .MuiTabs-indicator": {
//     display: "flex",
//     justifyContent: "center",
//     backgroundColor: "transparent",
//   },
//   "& .MuiTabs-indicatorSpan": {
//     width: "100%",
//     backgroundColor: "#4167ad",
//   },
// });

// const StyledTab = styled((props: tabProps) => <Tab disableRipple {...props} />)(
//   ({ theme }) => ({
//     color: "#6b7ea1",
//     "&:hover": {
//       color: "#7195d8",
//       opacity: 1,
//     },
//     "&.Mui-selected": {
//       color: "#4167ad",
//       fontWeight: theme.typography.fontWeightMedium,
//     },
//     "&.Mui-focusVisible": {
//       backgroundColor: "#d1eaff",
//     },
//   }),
// );

const Navbar: React.FC = () => {
  // const [tab, setTab] = useState(2);
  // const [tabAllowed, setTabAllowed] = useState("team");
  // const pathname = usePathname();
  // const router = useRouter();
  // const { userSession } = useAuth();
  // const handleChange = (event: React.SyntheticEvent, newTab: number) => {
  //   setTab(newTab);
  //   router.push(newTab === 1 ? "/members" : `/${tabAllowed}`);
  // };
  //
  // useEffect(() => {
  //   if (userSession.role !== "Student") {
  //     setTabAllowed("teams");
  //   }
  // }, []);
  //
  // useEffect(() => {
  //   if (pathname.includes("team")) {
  //     setTab(0);
  //   } else if (pathname.includes("members")) {
  //     setTab(1);
  //   } else {
  //     setTab(2);
  //   }
  // }, [pathname]);
  //
  return (
    <div className={styles.navbar}>
      <h1 className={styles.website}>ICPCC</h1>
      <Menu />
    </div>
  );
};

export default Navbar;

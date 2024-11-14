// Used for the purpose of adding to sx

export const purpleBtn = {
  fontSize: "13px",
  textTransform: "none",
  color: "white",
  backgroundColor: "#7D84AF",
  boxShadow: "none",
};

export const copyBtn = {
  marginLeft: "100%",
  height: "17px",
  "&:hover": {
    color: "white",
    cursor: "pointer",
  },
};

export const addExperienceBtn = {
  minWidth: "220px",
  padding: "10px 30px",
  fontSize: "13px",
  textTransform: "none",
  color: "white",
  backgroundColor: "#4B4B4B",
};

export const addModal = {
  display: "block",
  position: "relative",
  padding: "30px 40px",
  width: "600px",
  zIndex: 1,
};

export const addBtn = {
  display: "block",
  margin: "0 auto",
  padding: "5px 40px",
  fontSize: "13px",
  textTransform: "none",
  backgroundColor: "#8094AB",
  boxShadow: "none",
};

export const experienceHeading = {
  // fontSize: '14px',
  fontSize: "15px",
  fontWeight: 600,
};

export const proficiencyLabel = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#979bb2",
};

export const sidebarBtn = {
  justifyContent: "flex-start",
  paddingLeft: "30px",
  height: "51px",
  width: "220px",
  fontSize: "15px",
  color: "#4E5C88",
  textTransform: "none",
  "&:hover": {
    color: "#4E5C88",
    bgcolor: "#9fb9d65c",
  },
  "&:active": {
    color: "#4E5C88",
    bgcolor: "#8094ab61",
  },
};

export const preferenceInput = (isLong: boolean) => {
  return {
    width: isLong ? "200px" : "auto",
    justifySelf: "start",
    "& .MuiInputBase-input": {
      padding: "7px 14px",
      fontSize: "14px",
      color: "#666666",
    },
    "& .MuiOutlinedInput-root.Mui-focused": {
      borderColor: "red",
    },
  };
};

export const menuBtn = {
  paddingLeft: "20px",
  width: "10vw",
  fontSize: "13px",
};

export const deleteBtn = {
  backgroundColor: "#ea6968",
  color: "white",
  textTransform: "none",
  boxShadow: "none",
};

export const editBtn = {
  backgroundColor: "#f592b3",
  color: "white",
  textTransform: "none",
  boxShadow: "none",
};

export const enrolBtn = {
  backgroundColor: "#555555",
  color: "white",
  alignSelf: "center",
  mt: 4,
  width: 320,
  height: 50,
  textTransform: "none",
  fontWeight: "bold",
};

export const saveExclBtn = {
  height: "22.5px",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "none",
  color: "white",
  borderColor: "#444444",
  bgcolor: "#444444",
};

export const cancelExclBtn = {
  height: "22.5px",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "none",
  color: "#444444",
  borderColor: "#444444",
};

export const modalInputBox = { m: "30px 35px", width: "calc(100% - 70px)" };

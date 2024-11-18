import { useEffect, useState } from "react";
import { getPreferences, updatePreferences } from "@/utils/preferenceInfo";
import {
  experienceHeading,
  saveExclBtn,
  cancelExclBtn,
} from "@/styles/sxStyles";
import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteExclusion from "./dialogInput/EditExclusion";
import { useAuth } from "../context-provider/AuthProvider";

interface ExclusionProps {
  id: string;
  changed: boolean;
  complete: (type: string) => void;
  setMsg: (msg: string) => void;
}

/**
 * Render Exclusion component
 * - renders exclusion preferences on page
 * - includes: list of student names separated by commas
 */
const ExclusionPreference = ({
  id,
  changed,
  complete,
  setMsg,
}: ExclusionProps) => {
  const [studentString, setStudentString] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const { userSession } = useAuth();

  const getExclusions = async () => {
    const exclusions = await getPreferences(id, "exclusions");
    if (exclusions) {
      setStudentString(exclusions);
      setSelected(exclusions.split(", "));
    }
    complete("exclusions");
  };

  const saveEdit = async () => {
    const newPref = selected.length > 0 ? selected.join(", ") : "";
    const msg = newPref.length > 0 ? "Updated" : "Deleted";
    await updatePreferences(id, "exclusions", newPref);
    setStudentString(newPref);
    setOpenEdit(false);
    setMsg(`Exclusion Preference ${msg}!`);
  };

  const cancelEdit = () => {
    setSelected(studentString.split(", "));
    setOpenEdit(false);
  };

  const checkPerms = () => {
    return userSession.id === id || userSession.role === "Admin";
  };

  useEffect(() => {
    getExclusions();
  }, [changed]);

  if (studentString !== "") {
    return (
      <>
        <h3 className={experienceStyles.heading}>Exclusion Preference</h3>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "19fr 1fr",
            alignItems: "center",
            m: "10px 30px 13px 40px",
          }}
        >
          <Typography sx={experienceHeading}>Student Names</Typography>
          {!openEdit && checkPerms() && (
            <Tooltip title="Edit Exclusions" placement="left">
              <IconButton
                sx={{
                  height: "21px",
                  width: "25px",
                  borderRadius: "5px",
                  justifySelf: "end",
                }}
                onClick={() => setOpenEdit(true)}
              >
                <EditNoteIcon sx={{ fontSize: "23px" }} />
              </IconButton>
            </Tooltip>
          )}
          {openEdit && checkPerms() && (
            <ButtonGroup>
              <Button sx={saveExclBtn} onClick={saveEdit}>
                Save
              </Button>
              <Button sx={cancelExclBtn} onClick={cancelEdit}>
                Cancel
              </Button>
            </ButtonGroup>
          )}
        </Box>
        <hr className={pageStyles.divider} />
        <Box sx={{ alignItems: "center", m: "20px 40px" }}>
          {openEdit ? (
            <DeleteExclusion
              original={studentString.split(", ")}
              selected={selected}
              setSelected={setSelected}
            />
          ) : (
            <Typography sx={{ fontSize: "14px" }}>{studentString}</Typography>
          )}
        </Box>
        <hr className={experienceStyles.divider} />
      </>
    );
  }
};

export default ExclusionPreference;

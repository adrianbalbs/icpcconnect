import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { z } from "zod";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SetStateAction, useEffect, useState } from "react";
import { CreateContestSchema } from "@/types/contests";
import { ContestResponse } from "@/contests/page";
import { editContestBtn } from "@/styles/sxStyles";
import { NotifType } from "../utils/Notif";
import { University } from "@/types/users";

interface ContestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    earlyBirdDate: string | undefined;
    cutoffDate: string | undefined;
    contestDate: string | undefined;
    site: number | undefined;
  }) => void;
  universities: University[];
  errors: z.inferFlattenedErrors<typeof CreateContestSchema>;
  mode: "create" | "edit";
  contestData?: ContestResponse | null;
  setNotif: (value: SetStateAction<NotifType>) => void;
}

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Contest Form component
 * - renders a modal that contains inputs for
 *    - contest name
 *    - early bird date (date where coach review opens)
 *    - cutoff date (date where final team allocation releases)
 *    - contest date
 *    - site (location that contest is hosted in)
 */
const ContestDialog: React.FC<ContestDialogProps> = ({
  open,
  onClose,
  onSubmit,
  universities,
  errors,
  mode,
  contestData,
  setNotif,
}) => {
  const [contestName, setContestName] = useState("");
  const [earlyBirdDate, setEarlyBirdDate] = useState<Dayjs | null>(null);
  const [cutoffDate, setCutoffDate] = useState<Dayjs | null>(null);
  const [contestDate, setContestDate] = useState<Dayjs | null>(null);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

  useEffect(() => {
    if (mode === "edit" && contestData && open) {
      setContestName(contestData.name);
      setEarlyBirdDate(dayjs(contestData.earlyBirdDate).local());
      setCutoffDate(dayjs(contestData.cutoffDate).local());
      setContestDate(dayjs(contestData.contestDate).local());

      const university = universities.find(
        (uni) => uni.id === contestData.siteId,
      );
      setSelectedUniversity(university || null);
    } else if (!open) {
      resetForm();
    }
  }, [open, contestData, mode, universities]);

  const resetForm = () => {
    setContestName("");
    setEarlyBirdDate(null);
    setCutoffDate(null);
    setContestDate(null);
    setSelectedUniversity(null);
  };

  const formatDateForSubmission = (date: Dayjs | null) => {
    if (!date) return undefined;
    return date.set("hour", 12).toISOString();
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = {
      name: contestName,
      earlyBirdDate: formatDateForSubmission(earlyBirdDate),
      cutoffDate: formatDateForSubmission(cutoffDate),
      contestDate: formatDateForSubmission(contestDate),
      site: selectedUniversity?.id,
    };

    const msg = mode === "create" ? "New Contest Created" : "Contest Updated";
    onSubmit(formData);
    setNotif({
      type: "create",
      message: `${msg}: ${contestName}`,
    });
  };

  const dialogTitle = mode === "create" ? "Create Contest" : "Edit Contest";
  const submitButtonText = mode === "create" ? "Create" : "Save Changes";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {mode === "create"
              ? "Create a new contest."
              : "Edit contest details."}{" "}
            Teams will be automatically allocated on the Early Bird Date and
            will run again on the Cutoff Date.
          </DialogContentText>
          <Divider sx={{ mt: 1 }} />
          <Stack>
            <DialogContentText sx={{ mt: 2 }}>Contest Name</DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              fullWidth
              variant="outlined"
              value={contestName}
              onChange={(e) => setContestName(e.target.value)}
              error={!!errors.fieldErrors.name}
              helperText={errors.fieldErrors.name?.[0]}
            />
            <DialogContentText sx={{ mt: 2 }}>
              Early Bird Date
            </DialogContentText>
            <DatePicker
              sx={{ mt: 2 }}
              value={earlyBirdDate}
              onChange={(newValue) => setEarlyBirdDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  error: !!errors.fieldErrors.earlyBirdDate,
                  helperText: errors.fieldErrors.earlyBirdDate?.[0],
                },
              }}
            />
            <DialogContentText sx={{ mt: 2 }}>Cutoff Date</DialogContentText>
            <DatePicker
              sx={{ mt: 2 }}
              value={cutoffDate}
              onChange={(newValue) => setCutoffDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  error: !!errors.fieldErrors.cutoffDate,
                  helperText: errors.fieldErrors.cutoffDate?.[0],
                },
              }}
            />
            <DialogContentText sx={{ mt: 2 }}>Contest Date</DialogContentText>
            <DatePicker
              sx={{ mt: 2 }}
              value={contestDate}
              onChange={(newValue) => setContestDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  error: !!errors.fieldErrors.contestDate,
                  helperText: errors.fieldErrors.contestDate?.[0],
                },
              }}
            />
            <DialogContentText sx={{ mt: 2 }}>Site</DialogContentText>
            <Autocomplete
              options={universities}
              value={selectedUniversity}
              onChange={(_event, newValue) => setSelectedUniversity(newValue)}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select University"
                  error={!!errors.fieldErrors.site}
                  helperText={errors.fieldErrors.site?.[0]}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: "5px 24px 25px" }}>
          <Button onClick={onClose} sx={editContestBtn}>
            Cancel
          </Button>
          <Button type="submit" sx={editContestBtn}>
            {submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContestDialog;

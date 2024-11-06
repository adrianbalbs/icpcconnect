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
import { useEffect, useState } from "react";
import { CreateContestSchema } from "@/types/contests";
import { ContestResponse } from "@/contests/page";

interface ContestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    contestName: string;
    earlyBirdDate: Date | undefined;
    cutoffDate: Date | undefined;
    contestDate: Date | undefined;
    university: number | undefined;
  }) => void;
  universities: { id: number; label: string }[];
  errors: z.inferFlattenedErrors<typeof CreateContestSchema>;
  mode: "create" | "edit";
  contestData?: ContestResponse | null;
}

const ContestDialog: React.FC<ContestDialogProps> = ({
  open,
  onClose,
  onSubmit,
  universities,
  errors,
  mode,
  contestData,
}) => {
  const [contestName, setContestName] = useState("");
  const [earlyBirdDate, setEarlyBirdDate] = useState<Dayjs | null>(null);
  const [cutoffDate, setCutoffDate] = useState<Dayjs | null>(null);
  const [contestDate, setContestDate] = useState<Dayjs | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    id: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (mode === "edit" && contestData && open) {
      setContestName(contestData.name);
      setEarlyBirdDate(dayjs(contestData.earlyBirdDate));
      setCutoffDate(dayjs(contestData.cutoffDate));
      setContestDate(dayjs(contestData.contestDate));

      // This is probably really bad time complexity wise lol, probs change this
      const university = universities.find(
        (uni) => uni.id === contestData.siteId,
      );
      setSelectedUniversity(university || null);
    } else if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setContestName("");
    setEarlyBirdDate(null);
    setCutoffDate(null);
    setContestDate(null);
    setSelectedUniversity(null);
  };
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = {
      contestName,
      earlyBirdDate: earlyBirdDate?.toDate(),
      cutoffDate: cutoffDate?.toDate(),
      contestDate: contestDate?.toDate(),
      university: selectedUniversity?.id,
    };

    onSubmit(formData);
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
              error={!!errors.fieldErrors.contestName}
              helperText={errors.fieldErrors.contestName?.[0]}
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
              onChange={(event, newValue) => setSelectedUniversity(newValue)}
              sx={{ mt: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select University"
                  error={!!errors.fieldErrors.university}
                  helperText={errors.fieldErrors.university?.[0]}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">{submitButtonText}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContestDialog;

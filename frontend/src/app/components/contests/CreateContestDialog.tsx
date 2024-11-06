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
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { CreateContestSchema } from "@/types/contests";

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
}

const CreateContestDialog: React.FC<ContestDialogProps> = ({
  open,
  onClose,
  onSubmit,
  universities,
  errors,
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
    if (!open) {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>Create Contest</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a new contest. Teams will be automatically allocated on the
            Early Bird Date and will run again on the Cutoff Date.
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
          <Button type="submit">Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateContestDialog;

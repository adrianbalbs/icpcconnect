"use client";

import { purpleBtn } from "@/styles/Overriding";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { z } from "zod";
import { Dayjs } from "dayjs";

export type ContestResponse = {
  id: string;
  name: string;
  earlyBirdDate: string;
  cutoffDate: string;
  contestDate: string;
  site: string;
};

const contestSchema = z
  .object({
    contestName: z.string().min(5),
    earlyBirdDate: z
      .date({ required_error: "Early Bird Date is required" })
      .refine((date) => date >= new Date(), {
        message: "Early Bird Date must be today or in the future",
      }),
    cutoffDate: z
      .date({ required_error: "Cutoff Date is required" })
      .refine((date) => date >= new Date(), {
        message: "Cutoff Date must be today or in the future",
      }),
    contestDate: z
      .date({ required_error: "Contest Date is required" })
      .refine((date) => date >= new Date(), {
        message: "Contest Date must be today or in the future",
      }),
    university: z.number(),
  })
  .refine((data) => data.earlyBirdDate <= data.cutoffDate, {
    message: "Early Bird Date should be before Cutoff Date",
    path: ["earlyBirdDate"],
  })
  .refine((data) => data.cutoffDate <= data.contestDate, {
    message: "Cutoff Date should be before Contest Date",
    path: ["cutoffDate"],
  });

const testDate = new Date().toISOString().split("T")[0];
const rows: ContestResponse[] = [
  {
    id: "1",
    name: "Funny Contest",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    site: "University of New South Wales",
  },
  {
    id: "2",
    name: "ICPC Regional UNSW",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    site: "University of New South Wales",
  },
  {
    id: "3",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    site: "University of New South Wales",
  },

  {
    id: "4",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    site: "University of New South Wales",
  },
  {
    id: "5",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    site: "University of New South Wales",
  },
  {
    id: "6",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    site: "University of New South Wales",
  },
];

type ValidationErrors = {
  contestName?: string;
  earlyBirdDate?: string;
  cutoffDate?: string;
  contestDate?: string;
  university?: string;
};

const universities = [
  { id: 1, label: "University of New South Wales" },
  { id: 2, label: "University of Sydney" },
  { id: 3, label: "University of Technology Sydney" },
  { id: 4, label: "Macquarie University" },
];

export default function Contests() {
  const [open, setOpen] = useState(false);
  const [contestName, setContestName] = useState("");
  const [earlyBirdDate, setEarlyBirdDate] = useState<Dayjs | null>(null);
  const [cutoffDate, setCutoffDate] = useState<Dayjs | null>(null);
  const [contestDate, setContestDate] = useState<Dayjs | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const {
    userSession: { role },
  } = useAuth();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = {
      contestName,
      earlyBirdDate: earlyBirdDate?.toDate(),
      cutoffDate: cutoffDate?.toDate(),
      contestDate: contestDate?.toDate(),
      university: selectedUniversity?.id,
    };

    try {
      setErrors({});
      contestSchema.parse(formData);
      console.log(formData);
      handleClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = error.errors.reduce(
          (acc: ValidationErrors, err) => {
            acc[err.path[0] as keyof ValidationErrors] = err.message;
            return acc;
          },
          {},
        );
        setErrors(newErrors);
      } else {
        console.error("Error:", error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 400 },
    { field: "earlyBirdDate", headerName: "Early Bird Date", width: 150 },
    { field: "cutoffDate", headerName: "Cutoff Date", width: 150 },
    { field: "contestDate", headerName: "Start Date", width: 150 },
    { field: "site", headerName: "Site", width: 300 },
  ];

  return (
    <Container sx={{ mt: 15 }}>
      <Stack>
        <Typography variant="h5" fontWeight="bold">
          Contests
        </Typography>
        <Divider sx={{ mt: 1 }} />
        {role === "admin" && (
          <Box display="flex" sx={{ justifyContent: "right", mt: 2 }}>
            <Button
              sx={purpleBtn}
              variant="contained"
              endIcon={<AddIcon />}
              onClick={handleClickOpen}
            >
              Create Contest
            </Button>
          </Box>
        )}
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          sx={{ mt: 2 }}
        />
      </Stack>
      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create Contest</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Create a new contest. Teams will be automatically allocated on the
              Early Bird Date and will run again Cutoff Date.
            </DialogContentText>
            <Divider sx={{ mt: 1 }}></Divider>
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
                error={!!errors.contestName}
                helperText={errors.contestName}
              />
              <DialogContentText sx={{ mt: 2 }}>
                Early Bird Date
              </DialogContentText>
              <DatePicker
                sx={{ mt: 2 }}
                value={earlyBirdDate}
                onChange={(newValue: Dayjs | null) => {
                  setEarlyBirdDate(newValue);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    error: !!errors.earlyBirdDate,
                    helperText: errors.earlyBirdDate,
                  },
                }}
              />
              <DialogContentText sx={{ mt: 2 }}>Cutoff Date</DialogContentText>
              <DatePicker
                sx={{ mt: 2 }}
                value={cutoffDate}
                onChange={(newValue: Dayjs | null) => {
                  setCutoffDate(newValue);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    error: !!errors.cutoffDate,
                    helperText: errors.cutoffDate,
                  },
                }}
              />
              <DialogContentText sx={{ mt: 2 }}>Contest Date</DialogContentText>
              <DatePicker
                sx={{ mt: 2 }}
                value={cutoffDate}
                onChange={(newValue: Dayjs | null) => {
                  setContestDate(newValue);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    error: !!errors.contestDate,
                    helperText: errors.contestDate,
                  },
                }}
              />
              <DialogContentText sx={{ mt: 2 }}>Site</DialogContentText>
              <Autocomplete
                options={universities}
                value={selectedUniversity}
                onChange={(event, newValue) => {
                  setSelectedUniversity(newValue);
                }}
                sx={{ mt: 2 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select University"
                    error={!!errors.university}
                    helperText={errors.university}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

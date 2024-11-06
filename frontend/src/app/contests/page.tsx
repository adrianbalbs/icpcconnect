"use client";

import { purpleBtn, deleteBtn, editBtn } from "@/styles/Overriding";
import {
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
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useState } from "react";
import { z } from "zod";
import { CreateContestSchema } from "@/types/contests";
import CreateContestDialog from "@/components/contests/CreateContestDialog";

export type ContestResponse = {
  id: string;
  name: string;
  earlyBirdDate: string;
  cutoffDate: string;
  contestDate: string;
  site: string;
};

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

const universities = [
  { id: 1, label: "University of New South Wales" },
  { id: 2, label: "University of Sydney" },
  { id: 3, label: "University of Technology Sydney" },
  { id: 4, label: "Macquarie University" },
];

type DeleteContestDialogProps = {
  open: boolean;
  onClose: () => void;
};

const DeleteContestDialog: React.FC<DeleteContestDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete this contest?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting this contest is an irreversible step.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

type FormData = {
  contestName: string;
  earlyBirdDate: Date | undefined;
  cutoffDate: Date | undefined;
  contestDate: Date | undefined;
  university: number | undefined;
};

export default function Contests() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<
    z.inferFlattenedErrors<typeof CreateContestSchema>
  >({ formErrors: [], fieldErrors: {} });

  const {
    userSession: { role },
  } = useAuth();

  const handleClickOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleClose = () => {
    setCreateDialogOpen(false);
  };

  const handleSubmit = async (formData: FormData) => {
    const result = CreateContestSchema.safeParse(formData);
    if (!result.success) {
      const errorMessages = result.error.flatten();
      setErrors(errorMessages);
      return;
    }
    try {
      setErrors({ formErrors: [], fieldErrors: {} });
      console.log(formData);
      handleClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 400 },
    { field: "earlyBirdDate", headerName: "Early Bird Date", width: 150 },
    { field: "cutoffDate", headerName: "Cutoff Date", width: 150 },
    { field: "contestDate", headerName: "Start Date", width: 150 },
    { field: "site", headerName: "Site", width: 380 },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Button variant="contained" sx={purpleBtn}>
            Info
          </Button>
          {role === "admin" && (
            <>
              <Button variant="contained" sx={{ ...editBtn, ml: 1 }}>
                Edit
              </Button>
              <Button
                variant="contained"
                sx={{ ...deleteBtn, ml: 1 }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 15 }} maxWidth="xl">
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
          disableRowSelectionOnClick
          sx={{ mt: 2 }}
        />
      </Stack>
      <CreateContestDialog
        open={createDialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        universities={universities}
        errors={errors}
      />
      <DeleteContestDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Container>
  );
}

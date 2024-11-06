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
import ContestDialog from "@/components/contests/ContestDialog";

export type ContestResponse = {
  id: string;
  name: string;
  earlyBirdDate: string;
  cutoffDate: string;
  contestDate: string;
  siteId: number;
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
    siteId: 1,
    site: "University of New South Wales",
  },
  {
    id: "2",
    name: "ICPC Regional UNSW",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    siteId: 1,
    site: "University of New South Wales",
  },
  {
    id: "3",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    siteId: 1,
    site: "University of New South Wales",
  },

  {
    id: "4",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    siteId: 1,
    site: "University of New South Wales",
  },
  {
    id: "5",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    siteId: 1,
    site: "University of New South Wales",
  },
  {
    id: "6",
    name: "SPAR Practice Round",
    earlyBirdDate: testDate,
    cutoffDate: testDate,
    contestDate: testDate,
    siteId: 1,
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
        <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting this contest is irreversible, and will delete all formed
            teams for this contest.
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] =
    useState<ContestResponse | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [contests, setContests] = useState<ContestResponse[]>(rows);

  const [errors, setErrors] = useState<
    z.inferFlattenedErrors<typeof CreateContestSchema>
  >({ formErrors: [], fieldErrors: {} });

  const {
    userSession: { role },
  } = useAuth();

  const handleCreate = () => {
    setDialogMode("create");
    setSelectedContest(null);
    setDialogOpen(true);
  };

  const handleEdit = (contest: ContestResponse) => {
    setDialogMode("edit");
    setSelectedContest(contest);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedContest(null);
    setDialogOpen(false);
    setErrors({ formErrors: [], fieldErrors: {} });
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
      handleDialogClose();
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
      renderCell: (params: GridRenderCellParams<ContestResponse>) => (
        <>
          <Button variant="contained" sx={purpleBtn}>
            Info
          </Button>
          {role === "admin" && (
            <>
              <Button
                variant="contained"
                sx={{ ...editBtn, ml: 1 }}
                onClick={() => handleEdit(params.row)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                sx={{ ...deleteBtn, ml: 1 }}
                onClick={() => {
                  setDeleteId(params.row.id);
                  setDeleteDialogOpen(true);
                }}
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
              onClick={handleCreate}
            >
              Create Contest
            </Button>
          </Box>
        )}
        <DataGrid
          rows={contests}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          sx={{ mt: 2 }}
        />
      </Stack>
      <ContestDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        universities={universities}
        errors={errors}
        mode={dialogMode}
        contestData={selectedContest}
      />
      <DeleteContestDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteId(null);
          setDeleteDialogOpen(false);
        }}
      />
    </Container>
  );
}

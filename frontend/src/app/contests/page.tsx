"use client";

import { purpleBtn, deleteBtn, editBtn } from "@/styles/sxStyles";
import {
  Alert,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Snackbar,
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
import { useEffect, useState } from "react";
import { z } from "zod";
import { CreateContestSchema } from "@/types/contests";
import ContestDialog from "@/components/contests/ContestDialog";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { useRouter } from "next/navigation";
import InviteCode from "@/components/utils/InviteCode";
import useUniversities from "@/hooks/useUniversities";

export type ContestResponse = {
  id: string;
  name: string;
  earlyBirdDate: string;
  cutoffDate: string;
  contestDate: string;
  siteId: number;
  site: string;
};

type DeleteContestDialogProps = {
  open: boolean;
  onClose: () => void;
  handleDelete: () => void;
};

const DeleteContestDialog: React.FC<DeleteContestDialogProps> = ({
  open,
  onClose,
  handleDelete,
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
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

type FormData = {
  name: string;
  earlyBirdDate: string | undefined;
  cutoffDate: string | undefined;
  contestDate: string | undefined;
  site: number | undefined;
};

export default function Contests() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] =
    useState<ContestResponse | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [contests, setContests] = useState<ContestResponse[]>([]);
  const [dataGridLoading, setDataGridLoading] = useState(true);
  const [notif, setNotif] = useState({ type: "", name: "" });

  const [errors, setErrors] = useState<
    z.inferFlattenedErrors<typeof CreateContestSchema>
  >({ formErrors: [], fieldErrors: {} });

  const {
    userSession: { role },
  } = useAuth();

  const router = useRouter();
  const fetchContests = async () => {
    try {
      const res = await axios.get<{ allContests: ContestResponse[] }>(
        `${SERVER_URL}/api/contests`,
        {
          withCredentials: true,
        },
      );
      setContests(
        res.data.allContests.map((c) => ({
          ...c,
          earlyBirdDate: c.earlyBirdDate.split("T")[0],
          cutoffDate: c.cutoffDate.split("T")[0],
          contestDate: c.contestDate.split("T")[0],
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const { universities } = useUniversities();

  useEffect(() => {
    setDataGridLoading(true);
    fetchContests();
    setDataGridLoading(false);
  }, []);

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

  const handleDelete = async () => {
    try {
      await axios.delete(`${SERVER_URL}/api/contests/${deleteId}`, {
        withCredentials: true,
      });

      await fetchContests();
      setDeleteId(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.log(err);
    }
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
      if (dialogMode === "create") {
        await axios.post(`${SERVER_URL}/api/contests`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.put(
          `${SERVER_URL}/api/contests/${selectedContest?.id}`,
          formData,
          {
            withCredentials: true,
          },
        );
      }
      await fetchContests();
      handleDialogClose();
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 400 },
    { field: "earlyBirdDate", headerName: "Early Bird Date", width: 150 },
    { field: "cutoffDate", headerName: "Cutoff Date", width: 150 },
    { field: "contestDate", headerName: "Start Date", width: 150 },
    { field: "site", headerName: "Site", width: 370 },
    {
      field: "actions",
      headerName: "Actions",
      width: 240,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ContestResponse>) => (
        <>
          <Button
            variant="contained"
            sx={purpleBtn}
            onClick={() => {
              router.push(
                `/contests/${params.row.id}/${role === "Student" ? "team" : "teams"}`,
              );
            }}
          >
            Info
          </Button>
          {role === "Admin" && (
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
        {role === "Admin" && (
          <Stack
            display="flex"
            direction="row"
            spacing={1}
            sx={{ justifyContent: "right", mt: 2 }}
          >
            <InviteCode setNotif={setNotif} />
            <Button
              sx={purpleBtn}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Create Contest
            </Button>
          </Stack>
        )}
        <DataGrid
          rows={contests}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          loading={dataGridLoading}
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
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
        handleDelete={handleDelete}
      />
      <Snackbar
        open={notif.type !== ""}
        autoHideDuration={2000}
        onClose={() => {
          setNotif({ type: "", name: "" });
        }}
      >
        <Alert
          onClose={() => {
            setNotif({ type: "", name: "" });
          }}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Invite Code Copied!
        </Alert>
      </Snackbar>
    </Container>
  );
}

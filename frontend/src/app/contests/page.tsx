"use client";

import {
  purpleBtn,
  deleteBtn,
  editBtn,
  editContestBtn,
} from "@/styles/sxStyles";
import {
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
import { useAuth } from "@/components/context-provider/AuthProvider";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CreateContestSchema } from "@/types/contests";
import ContestDialog from "@/components/contests/ContestDialog";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { useRouter } from "next/navigation";
import InviteCode from "@/components/utils/InviteCode";
import Notif from "@/components/utils/Notif";
import { useSites } from "@/utils/university";
import { universityToSiteId } from "@/utils/university";
import { getInfo } from "@/utils/profileInfo";

export type ContestResponse = {
  id: string;
  name: string;
  earlyBirdDate: string;
  cutoffDate: string;
  contestDate: string;
  siteId: number;
  site: string;
};

type ContestDelete = {
  id: string;
  name: string;
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
        <DialogActions sx={{ p: "0 24px 25px" }}>
          <Button onClick={onClose} sx={editContestBtn}>
            Cancel
          </Button>
          <Button onClick={handleDelete} sx={editContestBtn} autoFocus>
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
  const [selectDelete, setSelectDelete] = useState<ContestDelete | null>(null);
  const [selectedContest, setSelectedContest] =
    useState<ContestResponse | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [contests, setContests] = useState<ContestResponse[]>([]);
  const [dataGridLoading, setDataGridLoading] = useState(true);
  const [notif, setNotif] = useState({ type: "", message: "" });

  const [errors, setErrors] = useState<
    z.inferFlattenedErrors<typeof CreateContestSchema>
  >({ formErrors: [], fieldErrors: {} });

  const {
    userSession: { id, role },
  } = useAuth();

  const router = useRouter();
  const fetchContests = async () => {
    try {
      const ownData = await getInfo(id);
      const res = await axios.get<{ allContests: ContestResponse[] }>(
        `${SERVER_URL}/api/contests`,
        {
          withCredentials: true,
        },
      );
      let filtered = res.data.allContests.map((c) => ({
        ...c,
        earlyBirdDate: c.earlyBirdDate.split("T")[0],
        cutoffDate: c.cutoffDate.split("T")[0],
        contestDate: c.contestDate.split("T")[0],
      }));
      if (ownData && role !== "Admin") {
        const currSite = await universityToSiteId(ownData.university);
        console.log(filtered);
        filtered = filtered.filter((s) => s.siteId === currSite);
      }
      setContests(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const { universities } = useSites();

  useEffect(() => {
    setDataGridLoading(true);
    fetchContests();
    setDataGridLoading(false);
  }, [id]);

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
      await axios.delete(`${SERVER_URL}/api/contests/${selectDelete?.id}`, {
        withCredentials: true,
      });

      await fetchContests();
      setSelectDelete(null);
      setDeleteDialogOpen(false);
      setNotif({
        type: "delete",
        message: `Contest Deleted: ${selectDelete?.name}`,
      });
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
    { field: "name", headerName: "Name", width: 380 },
    { field: "earlyBirdDate", headerName: "Early Bird Date", width: 150 },
    { field: "cutoffDate", headerName: "Cutoff Date", width: 150 },
    { field: "contestDate", headerName: "Start Date", width: 150 },
    { field: "site", headerName: "Site", width: 349 },
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
                  setSelectDelete({ id: params.row.id, name: params.row.name });
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
    <Container
      sx={{ mt: 15, mx: "3vw", px: "0", width: "94vw" }}
      disableGutters
    >
      <Stack sx={{ width: "94vw" }}>
        <Typography variant="h5" fontWeight="bold" color="rgb(69, 70, 94)">
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
            toolbar: {
              sx: {
                ".MuiButton-root": { color: "#5c69ab" },
              },
            },
            pagination: {
              sx: {
                ".MuiTablePagination-selectLabel": {
                  py: "4.56px",
                },
                ".MuiSelect-select": {
                  p: "5.3px 24px 3.7px 8px",
                },
              },
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
        setNotif={setNotif}
      />
      <DeleteContestDialog
        open={deleteDialogOpen}
        onClose={() => {
          setSelectDelete(null);
          setDeleteDialogOpen(false);
        }}
        handleDelete={handleDelete}
      />
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
    </Container>
  );
}
